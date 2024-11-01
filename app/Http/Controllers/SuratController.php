<?php

namespace App\Http\Controllers;

use App\Helpers\QrCodeHelper;
use App\Models\Surat;
use App\Models\SuratPengguna;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Ramsey\Uuid\Uuid;

class SuratController extends Controller
{


    public function index()
    {
        $users = User::with('jabatan')->select('id', 'name')->get();
        return Inertia::render('Documents/SubmitDocument', compact('users'));
    }

    // Function for list all surat
    public function list()
    {
        // Query surat table and join user table
        $surat = Surat::with(['jabatan.user'])->orderBy('created_at')->paginate(5);

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
                'tujuan_surat' => 'required',
                'keterangan' => 'required',
            ]
        );

        // validate jabatan

        DB::beginTransaction();
        $id = UUid::uuid4()->toString();
        try {

            $file = $request->file('file_asli');

            $path = 'uploads/surat/' . $id;

            $filename = 'file_asli_' . $id . '.' . $file->getClientOriginalExtension();

            $filePath = $file->storeAs($path, $filename);


            $surat = Surat::create([
                'id' => $id,
                'file_asli' => $filePath,
                'pengaju' => $request->pengaju,
                'judul_surat' => $request->judul_surat,
                'tujuan_surat' => $request->tujuan_surat,
                'keterangan' => $request->keterangan
            ]);
            
            // Store data to surat pengguna
            foreach($request->jabatan as $jabatan) {
                $idSuratPengguna = UUid::uuid4()->toString();
                $link = url('/verifikasi/'.$idSuratPengguna);
                $path = QrCodeHelper::generateQrCode($link, $path);
                SuratPengguna::create([
                    'id' => $idSuratPengguna,
                    'surat_id' => $surat->id,
                    'jabatan_id' => $jabatan->id,
                    'qrcode_file' => $path,
                    'status_ttd' => 'pending' // ga guna
                ]);
            }

            DB::commit();
            return "ok";
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
                'tujuan_surat' => 'required',
                'keterangan' => 'required',
            ]
        );

        DB::beginTransaction();
        try {


            $file = $request->file('file_asli');
            $filePath = null;
            if ($file) {
                Storage::disk('public')->delete('uploads/surat/'.$surat->file_asli);
                $path = 'uploads/surat/' . $surat->id;
    
                $filename = 'file_asli_' . $surat->id . '.' . $file->getClientOriginalExtension();
    
                $filePath = $file->storeAs($path, $filename);
            }


            $surat->update([
                'file_asli' => $filePath ?? $surat->file_asli,
                'pengaju' => $request->pengaju,
                'judul_surat' => $request->judul_surat,
                'tujuan_surat' => $request->tujuan_surat,
                'keterangan' => $request->keterangan
            ]);


            $surat->jabatan()->sync($request->jabatan);

            // ini update ttd bagaimana? (kalau tidak ada request jabatan berarti tidak update)
            // drop semua surat pengguna di database dan upload file yang berkaitan dan generate ulang

            DB::commit();
            return "ok";
        } catch (Exception $error) {
            DB::rollBack();
            return $error;
        }
    }

    public function destroy(Surat $surat) {

        Surat::destroy($surat->id);
        return "ok";
    }
}
