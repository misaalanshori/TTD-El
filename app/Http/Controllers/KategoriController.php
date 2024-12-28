<?php

namespace App\Http\Controllers;

use App\Models\Kategori;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class KategoriController extends Controller
{
    
    public function index() {
        $kategori = Kategori::select(columns: ["id", "kategori", "slug"])->where("user_id", Auth::user()->id)->get();
        return Inertia::render('Kategori/ListKategori', compact('kategori'));
    }

    public function store(Request $request) {

        $request->validate([
            "kategori" => "required",
        ]);

        Kategori::create([
            "user_id" => Auth::user()->id,
            "kategori" => $request->kategori,
            "slug" => Str::slug($request->kategori),
        ]);

        return redirect()->back();
    }

    public function update(Request $request, $id) {
        $request->validate([
            "kategori" => "required",
        ]);

        $kategori = Kategori::findOrFail($id);
        $kategori->update([
            "kategori" => $request->kategori,
            "slug" => Str::slug($request->kategori),
        ]);

        return redirect()->back();
    }

    public function destroy($id) {
        Kategori::destroy($id);
        return redirect()->back();
    }

}
