<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Surat extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'surat';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $guarded = [];

    public function jabatan() {
        return $this->belongsToMany(Jabatan::class, 'surat_pengguna', 'surat_id', 'jabatan_id')->withPivot(['id', 'qrcode_file']);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function kategori() {
        return $this->belongsTo(Surat::class);
    }
}
