<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Surat;

class ApprovalController extends Controller
{
    public function listApproved(Request $request) {
        $surats = Surat::whereHas('signature.approval', function ($query) {
            $query->where('status', 'approved')
            ->where('user_id', Auth::id());
        })
            ->with(['signature' => function ($query) {
            $query->with(['approval' => function ($query) {
                $query->where('status', 'approved')->with('user');
            }, 'jabatan']);
            }])
            ->orderBy('created_at', 'desc')
            ->paginate(5);

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
            $query->where('status', 'pending')
            ->where('user_id', Auth::id());
        })
            ->with(['signature' => function ($query) {
            $query->with(['approval' => function ($query) {
                $query->where('status', 'pending')->with('user');
            }, 'jabatan']);
            }])
            ->orderBy('created_at', 'desc')
            ->paginate(5);

        return Inertia::render('Approval/ApprovalRequests', ['surat' => $surats]);
    }
}
