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

    public function user() {
        return $this->belongsToMany(User::class, 'surat_pengguna', 'surat_id', 'user_id');
    }
}
