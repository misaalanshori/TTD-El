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
        Schema::table('surat_pengguna', function (Blueprint $table) {
            $table->string("nama")->nullable();
            $table->string("email")->nullable();
            $table->string("jabatan")->nullable();
            $table->string("nip")->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('surat_pengguna', function (Blueprint $table) {
            $table->dropColumn("nama");
            $table->dropColumn("email");
            $table->dropColumn("jabatan");
            $table->dropColumn("nip");
        });
    }
};
