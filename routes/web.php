<?php

use App\Helpers\QrCodeHelper;
use App\Http\Controllers\Frontend\DocumentsFrontendController;
use App\Http\Controllers\JabatanController;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\SuratController;


// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

// Authenticated and Verified Routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Submit Document Route
    Route::get('/', [SuratController::class, "index"])->name('submitDocument');

    // Document Routes
    Route::prefix('document')->group(function () {
        Route::get('/', [SuratController::class, "list"])->name('showDocuments');
        Route::post('/', [SuratController::class, "store"])->name('createDocument');
        Route::delete('/{surat}', [SuratController::class, "destroy"])->name('deleteDocument');
        Route::put('/{surat}', [SuratController::class, "update"])->name('updateDocument');
        Route::patch('/{surat}/kategori', [SuratController::class, "updateKategori"])->name('updateDocumentKategori');
        Route::get('/{id}', [SuratController::class, "showDetails"])->name('detailsDocument');
        Route::get('/sign/{id}', [SuratController::class, "showPlacementEditor"])->name('signDocument');
        Route::patch('/sign/{surat}', [SuratController::class, "updateFileEdited"])->name('saveSignedDocument');
    });

    // Jabatan Routes
    Route::prefix('jabatan')->group(function () {
        Route::get('/', [JabatanController::class, "index"])->name('showJabatan');
        Route::post('/', [JabatanController::class, "store"])->name('createJabatan');
        Route::put('/{id}', [JabatanController::class, "update"])->name('updateJabatan');
        Route::delete('/{id}', [JabatanController::class, "destroy"])->name('deleteJabatan');
        Route::get('/api/user/{id}', [JabatanController::class, "getAllJabatanByUserId"])->name('getJabatanByUserId');
    }); 

    // Kategori Routes
    Route::prefix('kategori')->group(function () {
        Route::get('/', [KategoriController::class, "index"])->name('showKategori');
        Route::post('/', [KategoriController::class, "store"])->name('createKategori');
        Route::put('/{id}', [KategoriController::class, "update"])->name('updateKategori');
        Route::delete('/{id}', [KategoriController::class, "destroy"])->name('deleteKategori');
        // Route::get('/api/user/{id}', [KategoriController::class, "getAllKategoriByUserId"])->name('getAllKategoriByUserId');
    });
});

// Verification Routes
Route::get('/verifikasi/{id}', [SuratController::class, "verifyQr"])->name('verifyQr');


Route::get('/inertiatest', function () {
    return Inertia::render('TestDemo/TestDemo', [
        'date' => date("Y-m-d"),
    ]); // This will get default component from the resources/js/pages/TestDemo/TestDemo.jsx
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::post('/surat/submit', [SuratController::class, 'store']);
    Route::put('/surat/update/{surat}', [SuratController::class, 'update']);
    Route::patch('/surat/update/{surat}', [SuratController::class, 'updateFileEdited']);
    Route::delete('/surat/delete/{surat}', [SuratController::class, 'destroy']);
});

require __DIR__.'/auth.php';
