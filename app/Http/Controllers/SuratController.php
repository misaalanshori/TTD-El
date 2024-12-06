<?php

namespace App\Http\Controllers;

use App\Helpers\QrCodeHelper;
use App\Models\Jabatan;
use App\Models\Kategori;
use App\Models\Surat;
use App\Models\SuratPengguna;
use App\Models\User;
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

        return Inertia::render('Documents/SubmitDocument', compact('users'));
    }

    // Function for list all surat
    public function list(Request $request)
    {
        // Query surat table and join user table
        $surat = Surat::with(['jabatan.user'])->where('user_id', Auth::user()->id);

        if ($request->search != '' && $request->search != null) {
            $surat = $surat->where('judul_surat', 'like', "%$request->search%");
        }

        if ($request->hasSign != '' && $request->hasSign != null) {
            $surat = $surat->where('file_edited', $request->hasSign ? '!=' : '=', null);
        }

        if ($request->kategori != '' && $request->kategori != null) {
            $kategori = Kategori::select('id')->where('kategori', $request->kategori)->first();
            if ($kategori) {
                $surat = $surat->where('kategori_id', $kategori->id);
            }
        }

        $surat = $surat->orderBy('created_at', 'desc')->paginate(5);

        return Inertia::render('Documents/ListDocuments', ['surat' => $surat]);
    }

    // Function for show surat details
    public function showDetails($id)
    {
        $surat = Surat::with(['jabatan.user'])->findOrFail($id);

        if ($surat->file_edited == null) {
            $users = User::select(['id', 'name as label'])->get();
            return Inertia::render('Documents/EditDocument', ['surat' => $surat, 'users' => $users]);
        } else {
            return Inertia::render('Documents/DetailsDocument', ['surat' => $surat]);
        }
    }

    public function showPlacementEditor($id)
    {
        $surat = Surat::with(['jabatan.user'])->findOrFail($id);
        if ($surat->file_edited == null) {
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
                $dataJabatan = Jabatan::select(['jabatan', 'nip'])->with('user')->where($jabatan)->first();

                SuratPengguna::create([
                    'id' => $idSuratPengguna,
                    'surat_id' => $surat->id,
                    'jabatan_id' => $jabatan,
                    'qrcode_file' => $pathQr,
                    'jabatan' => $dataJabatan->jabatan,
                    'nip' => $dataJabatan->nip,
                    'nama' => $dataJabatan->user->name,
                    'email' => $dataJabatan->user->email,
                ]);
            }

            DB::commit();

            if ($continue_sign) {
                return redirect()->route("signDocument", ['id' => $surat->id]);
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

    public function update(Request $request, Surat $surat)
    {
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
        if ($surat->file_edited == null) {
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
                        SuratPengguna::create([
                            'id' => $idSuratPengguna,
                            'surat_id' => $surat->id,
                            'jabatan_id' => $jabatan,
                            'qrcode_file' => $pathQr,
                        ]);
                    }
                }

                DB::commit();

                if ($continue_sign) {
                    // dd($request);
                    return redirect()->route("signDocument", ['id' => $surat->id]);
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


    // fungsi update file_edited
    function updateFileEdited(Request $request, Surat $surat)
    {

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

            DB::commit();
            return Inertia::render('Documents/SignaturePlacementSuccess', ['surat' => $surat]);
        }

        return redirect()->back()->withErrors(['surat' => "Dokumen sudah ditandatangan!"]);
    }


    public function destroy(Surat $surat)
    {
        // must be file_edited null
        if ($surat->file_edited == null) {

            $surat->delete();
            return redirect()->back();
        }

        return redirect()->back()->withErrors(['surat' => "Dokumen sudah ditandatangan!"]);
    }

    public function verifyQr($id)
    {
        $info = SuratPengguna::with(['surat.user', 'jabatan.user'])->findOrFail($id);
        return Inertia::render('Documents/SignatureVerification', [
            'info' => [
                'surat' => collect($info['surat'])->except(['id', 'file_asli', 'deleted_at', 'created_at', 'user']),
                'penandatangan' => [
                    'name' => $info->jabatan->user->name,
                    'email' => $info->jabatan->user->email,
                    'jabatan' => $info->jabatan->jabatan,
                    'nip' => $info->jabatan->nip
                ],
                'pengunggah' => [
                    'name' => $info->surat->user->name,
                ],
            ]
        ]);
    }
}
