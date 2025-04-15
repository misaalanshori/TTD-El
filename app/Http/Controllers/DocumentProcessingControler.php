<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
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


        $data_extract = function ($prompt, $result_key, $text, $attempt = 3) use ($openai_client, $openai_model, &$data_extract) {
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
        $pdf = $parser->parseFile(public_path('storage/' . $file_path));
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
                $event_handler('Title Extraction Finished');

                $event_handler('Number Extraction');
                $results = $data_extract('Identify the document number from the following document, respond only using a valid JSON format with the key "document_number", "document_number" may be an empty string if not identified', 'document_number', $templated_text);
                $extraction_results['number'] = $results['result'];
                $event_handler('Number Extraction Finished');

                $event_handler('Language Extraction');
                $results = $data_extract('Identify the written human language of the following document, respond only using a valid JSON format with the key "document_language", "document_language" may be an empty string if not identified', 'document_language', $templated_text);
                $extraction_results['language'] = $results['result'];
                $event_handler('Language Extraction Finished');

                $language = $results['result'] ? (" which is \"" . $results['result'] . "\"") : "";

                $event_handler('Summary Extraction');
                $results = $data_extract("Create a short and concise single paragraph summary or description of the document contents using the original language$language, respond using a valid pure JSON format with one key \"document_summary\" containing a single string", 'document_summary', $templated_text);
                $extraction_results['summary'] = $results['result'];
                $event_handler('Summary Extraction Finished', $results);

                $event_handler('Name Extraction');
                $results = $data_extract('Extract all person names from the following document, excluding titles and ensuring correct spelling. Only respond with the results as a valid JSON object with a single key, "document_persons", which maps to an array containing only the identified names as strings, "document_persons" may be an empty array if none are identified', 'document_persons', $templated_text);
                $extraction_results['persons'] = $results['result'];
                $event_handler('Name Extraction Finished', $results);
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
        $extraction_results = $this->extractionProcess($filePath, $dummylog);
        Storage::disk('public')->deleteDirectory('uploads/documentsTesting/' . $id);
        return $extraction_results;
    }
}
