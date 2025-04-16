<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Extractions extends Model
{
    protected $fillable = [
        'judul', 'nomor_surat', 'keterangan', // Replace with actual column names from the migration
    ];
    
    // In DocumentExtractionResult.php
    public function users() {
        return $this->belongsToMany(User::class);
    }

}
