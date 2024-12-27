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
        Schema::create('surat_pengguna', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('surat_id');
            $table->unsignedBigInteger('jabatan_id')->nullable();
            $table->string('qrcode_file')->nullable()->default(null);
            $table->string('status_ttd')->nullable();
            $table->foreign('jabatan_id')->references('id')->on('jabatan')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surat_pengguna');
    }
};
