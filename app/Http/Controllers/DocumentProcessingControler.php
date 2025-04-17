<?php

namespace App\Http\Controllers;

use App\Models\Extractions;
use App\Models\Surat;
use App\Models\User;
use App\Services\UtilityService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Smalot\PdfParser\Parser;
use OpenAI;

class DocumentProcessingControler extends Controller
{
    private function extractionProcess($file_path, $event_handler) {
        $parser = new Parser();
        $openai_model = getenv('OPENAI_MODEL');
        $openai_client = OpenAI::factory()
            ->withApiKey(getenv('OPENAI_APIKEY'))
            ->withBaseUri(getenv('OPENAI_BASEURL'))
            ->withHttpClient($httpClient = new \GuzzleHttp\Client(['connect_timeout' => 0.25])) // default: HTTP client found using PSR-18 HTTP Client Discovery
            ->make();


        $data_extract = function ($prompt, $result_key, $text, $attempt = 0) use ($openai_client, $openai_model, &$data_extract) {
            $text = iconv("UTF-8","UTF-8//IGNORE", $text);
            $result = $openai_client->chat()->create([
                'model' => $openai_model,
                'messages' => [
                    ['role' => 'user', 'content' => $prompt . ': \n' . $text],
                ],
                'temperature' => 0,
            ]);
            $response = ltrim(trim($result->choices[0]->message->content, "`\"'"), "json");
            $response_data = json_decode($response, true);

            if (json_last_error() === JSON_ERROR_NONE && isset($response_data[$result_key])) {
                return [
                    'prompt' => $prompt,
                    'original_response' => $response,
                    'response_data' => $response_data,
                    'result' => $response_data[$result_key],
                    'attempt' => $attempt,
                ];
            } else {
                if ($attempt <= 0) {
                    return [
                        'prompt' => $prompt,
                        'original_response' => $response,
                        'response_data' => null,
                        'result' => null,
                        'attempt' => $attempt,
                    ];
                } else {
                    return $data_extract($prompt, $result_key, $text, $attempt - 1);
                }
            }
        };

        $extraction_results = ['error' => null, 'error_message' => null];
        $pdf = $parser->parseFile(public_path($file_path));
        $pages = array_slice($pdf->getPages(), 0, 5);
        $raw_text = implode(array_map(function ($item, $index) {
            return $item->getText();
        }, $pages, array_keys($pages)));

        if ((strlen(trim($raw_text))) < 8) {
            $event_handler('Empty Document!');
            $extraction_results['error'] = "NOTEXT";
        } else {
            $pages_text = array_map(function ($item, $index) use ($raw_text) {
                $page = $index + 1;
                $raw_text = $raw_text . $item->getText();
                return "<page page=\"$page\">\n" . $item->getText() . "\n</page>";
            }, $pages, array_keys($pages));
            $templated_text = "<document>\n" . implode("\n", $pages_text) . "\n</document>";
            $event_handler('Loaded ' . count($pages) . ' pages', $templated_text);

            try {
                $event_handler('Title Extraction');
                $results = $data_extract('Identify the title of the following document, respond only using a valid JSON format with the key "document_title", "document_title" may be an empty string if not identified', 'document_title', $templated_text);
                $extraction_results['title'] = $results['result'];

                $event_handler('Number Extraction');
                $results = $data_extract('Identify the document number from the following document, respond only using a valid JSON format with the key "document_number", "document_number" may be an empty string if not identified', 'document_number', $templated_text);
                $extraction_results['number'] = $results['result'];

                $event_handler('Language Extraction');
                $results = $data_extract('Identify the written human language of the following document, respond only using a valid JSON format with the key "document_language", "document_language" may be an empty string if not identified', 'document_language', $templated_text);
                $extraction_results['language'] = $results['result'];

                $language = $results['result'] ? (" which is \"" . $results['result'] . "\"") : "";

                $event_handler('Summary Generation');
                $results = $data_extract("Create a short and concise single paragraph summary or description of the document contents using the original language$language, respond using a valid pure JSON format with one key \"document_summary\" containing a single string", 'document_summary', $templated_text);
                $extraction_results['summary'] = $results['result'];

                $event_handler('Name Extraction');
                $results = $data_extract('Extract all person names from the following document, excluding titles and ensuring correct spelling. Only respond with the results as a valid JSON object with a single key, "document_persons", which maps to an array containing only the identified names as strings, "document_persons" may be an empty array if none are identified', 'document_persons', $templated_text);
                $extraction_results['persons'] = $results['result'];
            } catch (Exception $e) {
                $event_handler('Processing Failed!');
                $extraction_results['error'] = "PROCFAIL";
                $extraction_results['error_message'] = $e->getMessage();
            }
            
        }
        return $extraction_results;
    }

    public function extractAPI(Request $request) {
        
        $request->validate(
            [
                'document_file' => 'required|file|mimes:pdf|max:10240',
            ]
        );
        $id = uniqid("test_", true);
        $file = $request->file('document_file');

        $path = 'uploads/documentsTesting/' . $id;
        $fileName = 'document_' . $id . '.' . $file->getClientOriginalExtension();
        
        $filePath = Storage::disk('public')->putFileAs($path, $file, $fileName);
        $dummylog = function ($a,$b=""){};
        $extraction_results = $this->extractionProcess('storage/' . $filePath, $dummylog);

        // Delete the directory
        Storage::disk('public')->deleteDirectory($path);
        return $extraction_results;
    }

    public function process(Surat $surat) {
        ini_set('output_buffering', 'off');
        ini_set('zlib.output_compression', 'off');
        $sse_log = function ($message, $value = null) {
            echo "data: " . json_encode([
                'time' => now()->toDateTimeString(),
                'message' => $message,
                'value' => $value,
            ]) . "\n\n";

            ob_flush();
            flush();
        };
        $response = Response::stream(function () use ($surat, $sse_log) {
            $extraction = Extractions::with('users')->where('surat_id', $surat->id)->first();

            if ($extraction) {
                $sse_log('done', $extraction);
                return;
            }

            $sse_log('Memproses Dokumen');
            $extraction_results = $this->extractionProcess($surat->file_asli, $sse_log);

            if (is_null($extraction_results['error'])) {
                $matches = [];
                # Do name matching if names were extracted
                if (is_array($extraction_results['persons'])) {
                    $sse_log('Name Matching');
                    $databaseNames = User::select('id', 'name')->get();

                    foreach ($extraction_results['persons'] as $identifiedName) {
                        $bestMatch = null;
                        $highestScore = 0;

                        $cleanIdentified = UtilityService::cleanString($identifiedName);
                        foreach ($databaseNames as $dbEntry) {
                            $cleanDbName = UtilityService::cleanString($dbEntry['name']);

                            similar_text($cleanIdentified, $cleanDbName, $percent);
                            if ($percent >= 60 && $percent > $highestScore) {
                                $highestScore = $percent;
                                $bestMatch = $dbEntry;
                            }
                        }

                        if ($bestMatch !== null) {
                            $matches[] = $bestMatch['id'];
                        }
                    }
                }

                try {
                    DB::beginTransaction();
                    if ($surat->created_at->eq($surat->updated_at)) {
                        $surat->update([
                            'judul_surat' => $extraction_results['title'],
                            'nomor_surat' => $extraction_results['number'],
                            'keterangan' => $extraction_results['summary']
                        ]);
                    }
    
                    Extractions::where('surat_id', $surat->id)->delete();
                    $extracted = Extractions::create([
                        'surat_id' => $surat->id,
                        'judul' => $extraction_results['title'],
                        'nomor_surat' => $extraction_results['number'],
                        'keterangan' =>$extraction_results['summary']
                    ]);
                    $extracted->users()->attach($matches);
                    $extracted->load('users');
                    DB::commit();
                    $sse_log('done', $extracted);
                } catch (Exception $th) {
                    DB::rollBack();
                    $sse_log('error', ['error' => "Terjadi Kesalahan", 'ex' => $th->getMessage()]);
                }
                

            } else if ($extraction_results['error'] == "NOTEXT") {
                $sse_log('error', ['error' => "Dokumen tidak mengandung teks"]);
            } else if ($extraction_results['error'] == "PROCFAIL") {
                $sse_log('error', ['error' => "Pemrosesan dokumen sedang tidak tersedia"]);
            } else {
                $sse_log('error', ['error' => "Terjadi Kesalahan", 'obj' => $extraction_results]);
            }

            sleep(1);

        }, 200, [
            'Content-Type'      => 'text/event-stream',
            // 'Content-Type'      => 'text/html',
            'Cache-Control'     => 'no-cache',
            'Connection'        => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);

        // echo "data: " . json_encode([
        //     'counter' => 5,
        //     'time' => now()->toDateTimeString(),
        //     'pdf' => $firstPage,
        // ]) . "\n\n";

        // ob_flush();
        // flush();

        return $response;
    }
}
