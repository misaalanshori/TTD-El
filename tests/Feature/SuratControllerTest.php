<?php

use App\Http\Controllers\Auth\RegisteredUserController;
use App\Models\Jabatan;
use App\Models\User;
use Illuminate\Http\UploadedFile;

test('Valid data to store Surat', function () {
    $user = User::factory()->create();
    $jabatan = Jabatan::create([
        'jabatan' => 'Dosen',
        'nip' => '1234567890',
        'user_id' => $user->id
    ]);

    $file = UploadedFile::fake()->create('avatar.pdf', 500, 'application/pdf');

    $response = $this
        ->actingAs($user)
        ->post('/surat/submit', [
            'file_asli' => $file,
            'pengaju' => 'Arya Ashari',
            'nomor_surat' => '123456789',
            'judul_surat' => 'Tes Surat',
            'tujuan_surat' => 'Tes Tujuan Surat',
            'keterangan' => 'Tes Keterangan Surat',
            'jabatan' => [$jabatan->id]
        ]);

        $response->assertOk();
});
