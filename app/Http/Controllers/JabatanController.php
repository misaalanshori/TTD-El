<?php

namespace App\Http\Controllers;

use App\Models\Jabatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
class JabatanController extends Controller
{
    
    public function index() {
        $user = Auth::user();
        $jabatan = Jabatan::where('user_id', $user->id)->get();
        return Inertia::render('Jabatan/ListJabatan', compact('jabatan'));
    }

    public function store(Request $request) {

        $request->validate([
            'jabatan' => 'required',
            'nip' => 'required|string'
        ]);

        $user = Auth::user();
        Jabatan::create([
            'user_id' => $user->id,
            'jabatan' => $request->jabatan,
            'nip' => $request->nip
        ]);

        return redirect()->back();

    } 

    public function update(Request $request, $id) {

        $request->validate([
            'jabatan' => 'required',
            'nip' => 'required|string'
        ]);

        $jabatan = Jabatan::findOrFail($id);
        $jabatan->update([
            'jabatan' => $request->jabatan,
            'nip' => $request->nip
        ]);

        return redirect()->back();

    }

    public function destroy($id) {
        Jabatan::destroy($id);
        return redirect()->back();
    } 

    public function getAllJabatanByUserId($id) {

        $jabatan = Jabatan::where('user_id', $id)->with("user")->get();
        return response()->json($jabatan);

    }

}
