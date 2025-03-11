<?php

namespace App\Http\Controllers;

use App\Helpers\QrCodeHelper;
use App\Models\Jabatan;
use App\Models\Kategori;
use App\Models\Surat;
use App\Models\SuratPengguna;
use App\Models\User;
use App\Services\UtilityService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Ramsey\Uuid\Uuid;

class SuratController extends Controller
{


    public function index(Request $request)
    {
        $users = User::select(['id', 'name as label'])->get();
        $kategori = Kategori::select(['id', 'kategori as label'])->where("user_id", Auth::user()->id)->get();

        return Inertia::render('Documents/SubmitDocument', compact('users', 'kategori'));
    }

    // Function for list all surat
    public function list(Request $request)
    {
        // Query surat table and join user table
        $surat = Surat::with(['jabatan.user', 'kategori', 'signature.approval.user', 'signature.jabatanRef'])->where('user_id', Auth::user()->id);
        $categories = Kategori::select(['slug', 'kategori as label'])->where("user_id", Auth::user()->id)->get();
        $kategori = null;

        if ($request->search != '' && $request->search != null) {
            $surat = $surat->where('judul_surat', 'like', "%$request->search%");
        }

        if ($request->hasSign != '' && $request->hasSign != null) {
            $surat = $surat->where('file_edited', $request->hasSign ? '!=' : '=', null);
        }

        if ($request->kategori != '' && $request->kategori != null) {
            $kategori = Kategori::select('id', 'kategori as label', 'slug')->where('slug', $request->kategori)->first();
            if ($kategori) {
                $surat = $surat->where('kategori_id', $kategori->id);
            }
        }


        $surat = $surat->orderBy('created_at', 'desc')->paginate(5);

        // relasi ke surat pengguna (untuk yg sudah di ttd)
        foreach ($surat as $s) {
            $s->state = UtilityService::determineDocumentState($s);
            if ($s->file_edited != null && count($s->jabatan) < 1) {
                $suratPengguna = SuratPengguna::where('surat_id', $s->id)->get();
                foreach ($suratPengguna as $sp) {
                    $s->jabatan[] = new Jabatan([
                        "jabatan" => $sp->jabatan,
                        "nip" => $sp->nip,
                        "user" => new User([
                            "name" => $sp->nama,
                        ])
                    ]);
                }
            }
        }

        $initialParams = [
            "hasSign" => $request->hasSign,
            "kategori" => $kategori,
            "search" => $request->search
        ];

        return Inertia::render('Documents/ListDocuments', ['surat' => $surat, 'kategori' => $categories, 'initialParams' => $initialParams]);
    }

    // Function for show surat details
    public function showDetails($id)
    {
        $surat = Surat::select('*')->with(['signature.approval.user', 'signature.jabatanRef.user', 'kategori', 'user'])->findOrFail($id);
        $kategori = Kategori::select(['id', 'kategori as label'])->where("user_id", Auth::user()->id)->get();

        $byCurrentUser = $surat->user_id == Auth::user()->id;
        $suratState = UtilityService::determineDocumentState($surat);
        $isPending = is_null($suratState) ? true : ($suratState['state'] === 'pending' && $suratState['new']);
        // $isPending = true;
        $surat->state = $suratState;

        

        // dd(compact('surat', 'byCurrentUser', 'isPending'));

        if ($surat->file_edited == null && $byCurrentUser && $isPending) {
            $users = User::select(['id', 'name as label'])->get();
            return Inertia::render('Documents/EditDocument', ['surat' => $surat, 'users' => $users, 'kategori' => $kategori]);
        } else {
            return Inertia::render('Documents/DetailsDocument', ['surat' => $surat, 'kategori' => $kategori]);
        }
    }

    public function showPlacementEditor($id)
    {
        $surat = Surat::with(['jabatan.user', 'signature.approval'])->findOrFail($id);
        $isCreator = $surat->user_id == Auth::user()->id;
        $isLegacy = is_null(UtilityService::determineDocumentState($surat));
        if ($surat->file_edited == null && $isCreator && $isLegacy) {
            if (count($surat->jabatan) < 1) {
                return redirect()->back()->withErrors(["jabatan" => true]);
            }
            return Inertia::render('Documents/SignaturePlacement', ['surat' => $surat]);
        } else {
            return redirect()->route("detailsDocument", ['id' => $surat->id]);
        }
    }

    // Function for upload surat
    public function store(Request $request)
    {
        $continue_sign = $request->query('continue_sign', false);
        $request->validate(
            [
                'file_asli' => 'required|file|mimes:pdf|max:10240',
                'pengaju' => 'required',
                'nomor_surat' => 'required',
                'judul_surat' => 'required',
                'keterangan' => 'required',
                'jabatan' => 'required|array',
            ]
        );

        DB::beginTransaction();
        $id = UUid::uuid4()->toString();
        try {

            $file = $request->file('file_asli');

            $path = 'uploads/surat/' . $id;

            $fileName = 'file_asli_' . $id . '.' . $file->getClientOriginalExtension();
            $filePath = Storage::disk('public')->putFileAs($path, $file, $fileName);

            $surat = Surat::create([
                'id' => $id,
                'user_id' => Auth::user()->id,
                'nomor_surat' => $request->nomor_surat,
                'file_asli' => 'storage/' . $filePath,
                'pengaju' => $request->pengaju,
                'judul_surat' => $request->judul_surat,
                'keterangan' => $request->keterangan,
                'kategori_id' => $request->kategori_id
            ]);

            // Store data to surat pengguna
            foreach ($request->jabatan as $jabatan) {
                $idSuratPengguna = UUid::uuid4()->toString();
                $link = url('/verifikasi/' . $idSuratPengguna);
                $pathQr = QrCodeHelper::generateQrCode($link, $path);
                $jabatan = Jabatan::with('user')->where('id', $jabatan)->first();

                $suratPengguna = SuratPengguna::create([
                    'id' => $idSuratPengguna,
                    'surat_id' => $surat->id,
                    'jabatan_id' => $jabatan->id,
                    'qrcode_file' => $pathQr,
                ]);

                $suratPengguna->approval()->create([
                    'user_id' => $jabatan->user->id,
                    'status' => 'pending'
                ]);
            }

            DB::commit();

            if ($continue_sign) {
                return redirect()->route("placeDocumentSignature", ['surat' => $surat->id]);
            } else {
                return redirect()->route("showDocuments");
            }
        } catch (Exception $error) {
            DB::rollBack();

            // Remove uploaded file
            if (isset($filePath)) {
                Storage::disk('public')->delete($filePath);
            }

            return $error;
        }
    }

    public function update(Request $request, $surat)
    {
        $surat = Surat::with(['signature.approval'])->findOrFail($surat);
        $suratState = UtilityService::determineDocumentState($surat);
        if ($surat->user_id != Auth::user()->id) {
            redirect()->back()->withErrors(['user' => true]);
        }
        $continue_sign = $request->query('continue_sign', false);
        $request->validate(
            [
                'file_asli' => 'nullable|file|mimes:pdf|max:10240',
                'pengaju' => 'required',
                'nomor_surat' => 'required',
                'judul_surat' => 'required',
                'keterangan' => 'required',
                'jabatan' => 'nullable|array'
            ]
        );

        // must be file_edited null
        if ($surat->file_edited == null && $suratState['new']) {
            DB::beginTransaction();
            try {

                $file = $request->file('file_asli');
                $filePath = null;
                $path = 'uploads/surat/' . $surat->id;
                if ($file) {
                    Storage::disk('public')->delete(str_replace('storage/', '', $surat->file_asli));
                    $fileName = 'file_asli_updated_' . $surat->id . '.' . $file->getClientOriginalExtension();
                    $filePath = Storage::disk('public')->putFileAs($path, $file, $fileName);
                }

                $surat->update([
                    'file_asli' => $filePath ? 'storage/' . $filePath : $surat->file_asli,
                    'nomor_surat' => $request->nomor_surat,
                    'pengaju' => $request->pengaju,
                    'judul_surat' => $request->judul_surat,
                    'keterangan' => $request->keterangan,
                    'kategori_id' => $request->kategori_id
                ]);

                if ($request->jabatan != null) {
                    // delete all surat pengguna with surat id
                    $listSuratPengguna = SuratPengguna::where('surat_id', $surat->id)->get();
                    foreach ($listSuratPengguna as $suratPengguna) {
                        Storage::disk('public')->delete(str_replace('storage/', '', $suratPengguna->qrcode_file));
                        SuratPengguna::destroy($suratPengguna->id);
                    }

                    // store a new one
                    foreach ($request->jabatan as $jabatan) {

                        $idSuratPengguna = UUid::uuid4()->toString();
                        $link = url('/verifikasi/' . $idSuratPengguna);
                        $pathQr = QrCodeHelper::generateQrCode($link, $path);
                        $jabatan = Jabatan::with('user')->where('id', $jabatan)->first();

                        $suratPengguna = SuratPengguna::create([
                            'id' => $idSuratPengguna,
                            'surat_id' => $surat->id,
                            'jabatan_id' => $jabatan->id,
                            'qrcode_file' => $pathQr,
                        ]);
                        $suratPengguna->approval()->create([
                            'user_id' => $jabatan->user->id,
                            'status' => 'pending'
                        ]);
                    }
                }

                DB::commit();

                if ($continue_sign) {
                    // dd($request);
                    $suratState = UtilityService::determineDocumentState($surat);
                    if (is_null($suratState)) {
                        return redirect()->route("signDocument", ['id' => $surat->id]);
                    } else {
                        return redirect()->route("placeDocumentSignature", ['surat' => $surat->id]);
                    }
                    
                } else {
                    return redirect()->back();
                }
            } catch (Exception $error) {
                DB::rollBack();
                return $error;
            }
        }

        return redirect()->back()->withErrors(['surat' => "Dokumen sudah ditandatangan!"]);
    }

    function updateKategori(Request $request, Surat $surat) 
    {
        if ($surat->user_id != Auth::user()->id) {
            redirect()->back()->withErrors(['user' => true]);
        }
        DB::beginTransaction();
        try {
            $surat->update([
                'kategori_id' => $request->kategori_id
            ]);
            DB::commit();
            return redirect()->back();
        } catch (Exception $error) {
            DB::rollBack();
            return $error;
        }
    }


    // fungsi update file_edited
    function updateFileEdited(Request $request, Surat $surat)
    {
        if ($surat->user_id != Auth::user()->id) {
            redirect()->back()->withErrors(['user' => true]);
        }
        $request->validate(
            [
                'file_edited' => 'required|file|mimes:pdf|max:10240',
            ]
        );

        if ($surat->file_edited == null) {

            DB::beginTransaction();

            $file = $request->file('file_edited');
            $path = 'uploads/surat/' . $surat->id;

            $fileName = 'file_edited_' . $surat->id . '.pdf';
            $filePath = Storage::disk('public')->putFileAs($path, $file, $fileName);

            $surat->file_edited = 'storage/' . $filePath;
            $surat->save();

            // copy data jabatan to surat pengguna
            $suratPengguna = SuratPengguna::where('surat_id', $surat->id)->get();
            foreach ($suratPengguna as $item) {
                $jabatan = Jabatan::with('user')->where('id', $item->jabatan_id)->first();
                $item->nama = $jabatan->user->name;
                $item->email = $jabatan->user->email;
                $item->jabatan = $jabatan->jabatan;
                $item->nip = $jabatan->nip;
                $item->jabatan_id = null;
                $item->save();
            }

            DB::commit();
            return Inertia::render('Documents/SignaturePlacementSuccess', ['surat' => $surat]);
        }

        return redirect()->back()->withErrors(['surat' => "Dokumen sudah ditandatangan!"]);
    }

    public function destroy(Surat $surat)
    {
        if ($surat->user_id != Auth::user()->id) {
            redirect()->back()->withErrors(['user' => true]);
        }
        DB::beginTransaction();
        try {
            SuratPengguna::where('surat_id', $surat->id)->delete();
            Storage::disk('public')->deleteDirectory('/uploads/surat/'.$surat->id);
            $surat->delete();
            DB::commit();
            return redirect()->back();
        } catch (Exception $error) {
            DB::rollBack();
            return $error;
        }
        
    }

    public function verifyQr($id)
    {
        $info = SuratPengguna::with(['surat.user', 'jabatan.user'])->findOrFail($id);
        if ($info->surat->file_edited == null) {
            abort(404);
        }
        return Inertia::render('Documents/SignatureVerification', [
            'info' => [
                'surat' => collect($info['surat'])->except(['id', 'file_asli', 'deleted_at', 'user']),
                'penandatangan' => [
                    'name' => $info->nama,
                    'email' => $info->email,
                    'jabatan' => $info->jabatan,
                    'nip' => $info->nip
                ],
                'pengunggah' => [
                    'name' => $info->surat->user->name,
                ],
            ]
        ]);
    }
}
