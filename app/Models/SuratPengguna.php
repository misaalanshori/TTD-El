<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SuratPengguna extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'surat_pengguna';

    protected $guarded = [];
}
