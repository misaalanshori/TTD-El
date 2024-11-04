<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Surat extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'surat';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $guarded = [];

    public function jabatan() {
        return $this->belongsToMany(Jabatan::class, 'surat_pengguna', 'surat_id', 'jabatan_id')->withPivot(['qrcode_file']);
    }
}
