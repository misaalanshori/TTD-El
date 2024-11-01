<?php

namespace App\Http\Controllers;

use App\Models\Surat;
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


    public function index()
    {
        $users = User::with('jabatan')->select('id', 'name')->get();
        return Inertia::render('Documents/SubmitDocument', compact('users'));
    }

    // Function for list all surat
    public function list()
    {
        // Query surat table and join user table
        $surat = Surat::with(['jabatan.user'])->where('user_id', Auth::user()->id)->orderBy('created_at')->paginate(5);

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

        DB::beginTransaction();
        $id = UUid::uuid4()->toString();
        try {

            $file = $request->file('file_asli');

            $path = 'uploads/surat/' . $id;

            $filename = 'file_asli_' . $id . '.' . $file->getClientOriginalExtension();

            $filePath = $file->storeAs($path, $filename);


            $surat = Surat::create([
                'id' => $id,
                'user_id' => Auth::user()->id,
                'file_asli' => $filePath,
                'pengaju' => $request->pengaju,
                'judul_surat' => $request->judul_surat,
                'tujuan_surat' => $request->tujuan_surat,
                'keterangan' => $request->keterangan
            ]);

            $surat->jabatan()->attach($request->jabatan);

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

            $surat->users()->attach($request->users);

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
