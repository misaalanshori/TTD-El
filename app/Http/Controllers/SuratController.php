<?php

namespace App\Http\Controllers;

use App\Helpers\QrCodeHelper;
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
    public function list()
    {
        // Query surat table and join user table
        $surat = Surat::with(['jabatan.user'])->where('user_id', Auth::user()->id)->orderBy('created_at', 'desc')->paginate(5);

        return Inertia::render('Documents/ListDocuments', ['surat' => $surat]);
    }

    // Function for upload surat
    public function store(Request $request)
    {

        $request->validate(
            [
                'file_asli' => 'required|file|mimes:pdf|max:10240',
                'pengaju' => 'required',
                'nomor_surat' => 'required',
                'judul_surat' => 'required',
                'keterangan' => 'required',
                'jabatan' => 'required|array'
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
                'file_asli' => $filePath,
                'pengaju' => $request->pengaju,
                'judul_surat' => $request->judul_surat,
                'keterangan' => $request->keterangan
            ]);

            // Store data to surat pengguna
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

            DB::commit();
            return $surat;
            // return redirect()->route("showDocuments");
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

        $request->validate(
            [
                'file_asli' => 'file|mimes:pdf|max:10240',
                'pengaju' => 'required',
                'nomor_surat' => 'required',
                'judul_surat' => 'required',
                'keterangan' => 'required',
                'jabatan' => 'array'
            ]
        );

        // must be file_edited null
        if ($request->file_edited != null) {
            DB::beginTransaction();
            try {

                $file = $request->file('file_asli');
                $filePath = null;
                $path = 'uploads/surat/' . $surat->id;
                if ($file) {
                    Storage::disk('public')->delete($surat->file_asli);

                    $fileName = 'file_asli_' . $surat->id . '.' . $file->getClientOriginalExtension();
                    $filePath = Storage::disk('public')->putFileAs($path, $file, $fileName);
                }

                $surat->update([
                    'file_asli' => $filePath ?? $surat->file_asli,
                    'nomor_surat' => $request->nomor_surat,
                    'pengaju' => $request->pengaju,
                    'judul_surat' => $request->judul_surat,
                    'keterangan' => $request->keterangan
                ]);

                if ($request->jabatan != null) {
                    // delete all surat pengguna with surat id
                    $listSuratPengguna = SuratPengguna::where('surat_id', $surat->id)->get();
                    foreach($listSuratPengguna as $suratPengguna) {
                        Storage::disk('public')->delete($suratPengguna->qrcode_file);
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
                return response();
            } catch (Exception $error) {
                DB::rollBack();
                return $error;
            }
        }

        return redirect()->back()->with('status', 'File sudah tidak bisa di edit lagi!');
    }


    // fungsi update file_edited


    public function destroy($id)
    {
        // must be file_edited null

        // remove file from storage

        Surat::destroy($id);
        return redirect()->back();
    }
}
