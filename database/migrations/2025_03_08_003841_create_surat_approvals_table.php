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
        Schema::create('surat_approvals', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->uuid('surat_pengguna_id');
            $table->foreign('surat_pengguna_id')->references('id')->on('surat_pengguna')->onDelete('cascade');
            $table->enum('status', ['pending', 'approved', 'rejected']);
            $table->text('message')->nullable();
            $table->json('signature_transform')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surat_approvals');
    }
};
