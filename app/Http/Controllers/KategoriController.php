<?php

namespace App\Http\Controllers;

use App\Models\Kategori;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class KategoriController extends Controller
{
    
    public function index() {
        $kategori = Kategori::select(columns: ["kategori", "slug"])->where("user_id", Auth::user()->id)->get();
        return;
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
