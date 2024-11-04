<?php

use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\SuratController;
use App\Models\Jabatan;
use App\Models\Surat;
use App\Models\SuratPengguna;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Ramsey\Uuid\Uuid;

// test('Valid data to store Surat', function () {
//     $user = User::factory()->create();
//     $jabatan = Jabatan::create([
//         'jabatan' => 'Dosen',
//         'nip' => '1234567890',
//         'user_id' => $user->id
//     ]);

//     $file = UploadedFile::fake()->create('avatar.pdf', 500, 'application/pdf');

//     $response = $this
//         ->actingAs($user)
//         ->post('/surat/submit', [
//             'file_asli' => $file,
//             'pengaju' => 'Arya Ashari',
//             'nomor_surat' => '123456789',
//             'judul_surat' => 'Tes Surat',
//             'tujuan_surat' => 'Tes Tujuan Surat',
//             'keterangan' => 'Tes Keterangan Surat',
//             'jabatan' => [$jabatan->id]
//         ]);

//     $response->assertStatus(302);
// });


// test('update surat with file_edited not null', function () {
//     $user = User::factory()->create();
//     $jabatan = Jabatan::create([
//         'jabatan' => 'Dosen',
//         'nip' => '1234567890',
//         'user_id' => $user->id
//     ]);

//     $id = Uuid::uuid4()->toString();
//     $surat = Surat::create([
//         'id' => $id,
//         'user_id' => $user->id,
//         'nomor_surat' => '123456789',
//         'file_asli' => 'storage/uploads/surat/tes.pdf',
//         'file_edited' => 'storage/uploads/surat/tes_edited.pdf',
//         'pengaju' => 'Arya Ashari',
//         'judul_surat' => 'Surat Peminjaman Ruangan CAATIS',
//         'keterangan' => 'Untuk keperluan kegiatan'
//     ]);

//     $response = $this->actingAs($user)->put(
//         '/surat/update/'.$id, [
//             'pengaju' => 'Arya Ashari Edit',
//             'nomor_surat' => '123456789 Edit',
//             'judul_surat' => 'Tes Surat Edit',
//             'tujuan_surat' => 'Tes Tujuan Surat Edit',
//             'keterangan' => 'Tes Keterangan Surat Edit',
//         ]
//     );

//     $response->assertRedirect();
//     $response->assertSessionHas('status', 'File sudah tidak bisa di edit lagi!');
// });

// test('update surat with file_edited null and has file_asli and jabatan', function() {

//     $user = User::factory()->create();
//     $jabatan = Jabatan::create([
//         'jabatan' => 'Dosen',
//         'nip' => '1234567890',
//         'user_id' => $user->id
//     ]);

//     $id = "e6301862-56d0-4a6c-8ff7-e0a3eb8db68f";
//     $surat = Surat::create([
//         'id' => $id,
//         'user_id' => $user->id,
//         'nomor_surat' => '123456789',
//         'file_asli' => 'storage/uploads/surat/e6301862-56d0-4a6c-8ff7-e0a3eb8db68f/file_asli_e6301862-56d0-4a6c-8ff7-e0a3eb8db68f.pdf',
//         'pengaju' => 'Arya Ashari',
//         'judul_surat' => 'Surat Peminjaman Ruangan CAATIS',
//         'keterangan' => 'Untuk keperluan kegiatan'
//     ]);

//     SuratPengguna::create([
//         'id' => Uuid::uuid4()->toString(),
//         'jabatan_id' => $jabatan->id,
//         'surat_id' => $surat->id,
//         'qrcode_file' => 'storage/uploads/surat/e6301862-56d0-4a6c-8ff7-e0a3eb8db68f/4na52clfwg.png',
//     ]);

//     $file = UploadedFile::fake()->create('avatar.pdf', 500, 'application/pdf');

//     $response = $this->actingAs($user)->put(
//         '/surat/update/'.$id, [
//             'file_asli' => $file,
//             'pengaju' => 'Arya Ashari Edit',
//             'nomor_surat' => '123456789 Edit',
//             'judul_surat' => 'Tes Surat Edit',
//             'tujuan_surat' => 'Tes Tujuan Surat Edit',
//             'keterangan' => 'Tes Keterangan Surat Edit',
//             'jabatan' => [$jabatan->id]
//         ]
//     );

//     $response->assertOk();

// });

test('update file edited surat', function() {

        $user = User::factory()->create();
        $jabatan = Jabatan::create([
            'jabatan' => 'Dosen',
            'nip' => '1234567890',
            'user_id' => $user->id
        ]);
    
        $id = "e6301862-56d0-4a6c-8ff7-e0a3eb8db68f";
        $surat = Surat::create([
            'id' => $id,
            'user_id' => $user->id,
            'nomor_surat' => '123456789',
            'file_asli' => 'storage/uploads/surat/e6301862-56d0-4a6c-8ff7-e0a3eb8db68f/file_asli_e6301862-56d0-4a6c-8ff7-e0a3eb8db68f.pdf',
            'pengaju' => 'Arya Ashari',
            'judul_surat' => 'Surat Peminjaman Ruangan CAATIS',
            'keterangan' => 'Untuk keperluan kegiatan'
        ]);
    
        SuratPengguna::create([
            'id' => Uuid::uuid4()->toString(),
            'jabatan_id' => $jabatan->id,
            'surat_id' => $surat->id,
            'qrcode_file' => 'storage/uploads/surat/e6301862-56d0-4a6c-8ff7-e0a3eb8db68f/4na52clfwg.png',
        ]);
    
        $file = UploadedFile::fake()->create('avatar.pdf', 500, 'application/pdf');
    
        $response = $this->actingAs($user)->patch(
            '/surat/update/'.$id, [
                'file_edited' => $file
            ]
        );
    
        $response->assertOk();
    
    });




// test('delete surat', function() {

//     $user = User::factory()->create();
//     $jabatan = Jabatan::create([
//         'jabatan' => 'Dosen',
//         'nip' => '1234567890',
//         'user_id' => $user->id
//     ]);

//     $id = "e6301862-56d0-4a6c-8ff7-e0a3eb8db68f";
//     $surat = Surat::create([
//         'id' => $id,
//         'user_id' => $user->id,
//         'nomor_surat' => '123456789',
//         'file_asli' => 'storage/uploads/surat/e6301862-56d0-4a6c-8ff7-e0a3eb8db68f/file_asli_e6301862-56d0-4a6c-8ff7-e0a3eb8db68f.pdf',
//         'pengaju' => 'Arya Ashari',
//         'judul_surat' => 'Surat Peminjaman Ruangan CAATIS',
//         'keterangan' => 'Untuk keperluan kegiatan'
//     ]);

//     SuratPengguna::create([
//         'id' => Uuid::uuid4()->toString(),
//         'jabatan_id' => $jabatan->id,
//         'surat_id' => $surat->id,
//         'qrcode_file' => 'storage/uploads/surat/e6301862-56d0-4a6c-8ff7-e0a3eb8db68f/4na52clfwg.png',
//     ]);

//     $file = UploadedFile::fake()->create('avatar.pdf', 500, 'application/pdf');

//     $response = $this->actingAs($user)->delete(
//         '/surat/delete/'.$id
//     );

//     $response->assertOk();

// });