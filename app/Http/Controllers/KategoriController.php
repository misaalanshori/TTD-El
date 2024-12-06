<?php

namespace App\Http\Controllers;

use App\Models\Kategori;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class KategoriController extends Controller
{
    
    public function index() {
        $kategori = Kategori::select(["kategori", "slug"])->get();
        return;
    }

    public function store(Request $request) {

        $request->validate([
            "kategori" => "required",
        ]);

        Kategori::create([
            "kategori" => $request->kategori,
            "slug" => Str::slug($request->kategori),
        ]);

        return;
    }

    public function update(Request $request, Kategori $kategori) {
        $request->validate([
            "kategori" => "required",
        ]);

        $kategori->update([
            "kategori" => $request->kategori,
            "slug" => Str::slug($request->kategori),
        ]);

        return;
    }

    public function destroy($id) {
        Kategori::destroy($id);
        return;
    }

}
