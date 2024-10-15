<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('surat', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('file_asli');
            $table->string('file_edited')->nullable()->default(null);
            $table->string('pengaju');
            $table->string('nomor_surat')->nullable()->default(null);
            $table->string('judul_surat');
            $table->text('tujuan_surat');
            $table->string('qrcode_file')->nullable()->default(null);
            $table->text('keterangan')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surat');
    }
};
