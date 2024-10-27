<?php

namespace App\Http\Controllers;

use App\Models\Surat;
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
        $users = User::select('id', 'name')->get();
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

        DB::beginTransaction();
        try {

            $file = $request->file('file_asli');
    
            $path = 'uploads/surat/' . $request->nomor_surat;
    
            $filename = 'file_asli_' . $request->nomor_surat . '.' . $file->getClientOriginalExtension();
    
            $filePath = $file->storeAs($path, $filename);
    
    
            $surat = Surat::create([
                'id' => Uuid::uuid4()->toString(),
                'file_asli' => $filePath,
                'pengaju' => $request->pengaju,
                'judul_surat' => $request->judul_surat,
                'tujuan_surat' => $request->tujuan_surat,
                'keterangan' => $request->keterangan
            ]);
    
            $surat->users()->attach($request->users);

            DB::commit();
            return "ok";
        } catch(Exception $error) {
            DB::rollBack();

            // Remove uploaded file
            if (isset($filePath)) {
                Storage::disk('public')->delete($filePath);
            }

            return $error;
        }
    }


    
}
