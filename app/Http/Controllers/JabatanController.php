<?php

namespace App\Http\Controllers;

use App\Models\Jabatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JabatanController extends Controller
{
    
    public function index() {

        $jabatan = Jabatan::with('user')->get();
        return "ok";
    }

    public function store(Request $request) {

        $request->validate([
            'jabatan' => 'required',
            'nip' => 'required|integer'
        ]);

        $user = Auth::user();
        Jabatan::create([
            'user_id' => $user->id,
            'jabatan' => $request->jabatan,
            'nip' => $request->nip
        ]);

        return 'ok';

    } 

    public function update(Request $request, $id) {

        $request->validate([
            'jabatan' => 'required',
            'nip' => 'required|integer'
        ]);

        $jabatan = Jabatan::findOrFail($id);
        $jabatan->update([
            'jabatan' => $request->jabatan,
            'nip' => $request->nip
        ]);

        return 'ok';

    }

    public function destroy($id) {
        Jabatan::destroy($id);
        return 'ok';
    } 

    public function getAllJabatanByUserId($id) {

        $jabatan = Jabatan::where('user_id', $id)->get();
        return response()->json($jabatan);

    }

}
