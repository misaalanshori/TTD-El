<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\Surat;
use App\Models\SuratPengguna;
use App\Models\Jabatan;
use App\Models\User;
use App\Services\UtilityService;

class ApprovalController extends Controller
{
    public function listApproved(Request $request) {
        $surats = Surat::whereHas('signature.approval', function ($query) {
            $query->where('status', 'approved')
            ->where('user_id', Auth::id());
        })
            ->with(['signature' => function ($query) {
            $query->with(['approval.user', 'jabatanRef.user']);
            }])
            ->orderBy('created_at', 'desc')
            ->paginate(5);

        foreach ($surats as $surat) {
            $surat->state = UtilityService::determineDocumentState($surat);
            foreach ($surat->signature as $signature) {
                if (!$signature->jabatanRef) {
                    $signature->jabatan = [
                        "jabatan" => $signature->jabatan,
                        "nip" => $signature->nip,
                        "user" => new User([
                            "name" => $signature->nama,
                        ])
                    ];
                } else {
                    $signature->jabatan = $signature->jabatanRef;
                }
            }
        }

        return Inertia::render('Approval/ApprovedDocuments', ['surat' => $surats]);
    }

    public function listRequests(Request $request)
    {
        // $surats = Surat::join('surat_pengguna', 'surat.id', '=', 'surat_pengguna.surat_id')
        //     ->join('surat_approvals', 'surat_pengguna.id', '=', 'surat_approvals.surat_pengguna_id')
        //     ->where('surat_approvals.user_id', Auth::user()->id)
        //     ->where('surat_approvals.status', 'pending')
        //     ->select('*')
        //     ->distinct()
        //     ->get();
        // dd($surats);

        // $surats = Surat::with(['signature.approval.user'])
        //     ->whereHas('signature.approval', function ($query) {
        //         $query->where('status', 'pending')
        //             ->where('user_id', Auth::id());
        //     })
        //     ->get();

        $surats = Surat::whereHas('signature.approval', function ($query) {
            $query->whereIn('status', ['pending', 'rejected'])
            ->where('user_id', Auth::id());
        })
            ->with(['signature' => function ($query) {
            $query->with(['approval.user', 'jabatanRef.user']);
            }])
            ->orderBy('created_at', 'desc')
            ->paginate(5);

        foreach ($surats as $surat) {
            $surat->state = UtilityService::determineDocumentState($surat);
            foreach ($surat->signature as $signature) {
                if (!$signature->jabatanRef) {
                    $signature->jabatan = [
                        "jabatan" => $signature->jabatan,
                        "nip" => $signature->nip,
                        "user" => new User([
                            "name" => $signature->nama,
                        ])
                    ];
                } else {
                    $signature->jabatan = $signature->jabatanRef;
                }
            }
        }

        return Inertia::render('Approval/ApprovalRequests', ['surat' => $surats]);
    }

    public function showPlacementEditor(Request $request, $surat)
    {
        $surat = Surat::with(['signature.approval.user', 'signature.jabatanRef'])->findOrFail($surat);
        if ($surat->file_edited == null) {
            if (count($surat->jabatan) < 1) {
                return redirect()->back()->withErrors(["jabatan" => true]);
            }
            return Inertia::render('Approval/SignaturePlacement', ['surat' => $surat]);
        } else {
            return redirect()->route("detailsDocument", ['id' => $surat->id]);
        }
    }

    public function approve(Request $request, $signature)
    {
        $signature = SuratPengguna::findOrFail($signature);
        $signature->approval()->update([
            'status' => 'approved',
            'signature_transform' => $request->signature_transform,
        ]);
        $surat = Surat::with(['signature.approval.user', 'signature.jabatanRef'])->findOrFail($signature->surat_id);
        
        $surat->state = UtilityService::determineDocumentState($surat);
        return Inertia::render('Approval/SignaturePlacementSuccess', ['surat' => $surat]);
    }

    public function reject(Request $request, $signature)
    {
        $signature = SuratPengguna::findOrFail($signature);
        $signature->approval()->update([
            'status' => 'rejected',
            'message' => $request->message,
        ]);

        return redirect()->back();
    }

    function storeSignedDocument(Request $request, $surat)
    {

        $surat = Surat::with(['signature.approval.user'])->findOrFail($surat);

        // Check that all signatures have been approved
        $approved = UtilityService::determineDocumentState($surat)['state'] === 'approved';

        // return with error if not all signatures are approved
        if (!$approved) {
            return redirect()->back()->withErrors(['surat' => "Dokumen belum disetujui semua penandatangan!"]);
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
            return redirect()->route("detailsDocument", ['id' => $surat->id]);
        }

        return redirect()->back()->withErrors(['surat' => "Dokumen sudah ditandatangan!"]);
    }
}
