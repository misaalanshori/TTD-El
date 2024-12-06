<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kategori extends Model
{
    protected $table = "kategori";
    protected $fillable = ["kategori", "slug"];

    public function surat() {
        return $this->hasMany(Surat::class);
    }   
}
