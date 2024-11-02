<?php

use App\Helpers\QrCodeHelper;
use App\Http\Controllers\Frontend\DocumentsFrontendController;
use App\Http\Controllers\JabatanController;
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

Route::get('/', [SuratController::class, "index"])->middleware(['auth', 'verified'])->name('submitDocument');
Route::get('/document', [SuratController::class, "list"])->middleware(['auth', 'verified'])->name('showDocuments');
Route::post('/document', [SuratController::class, "store"])->middleware(['auth', 'verified'])->name('createDocument');
Route::delete('/document/{id}', [SuratController::class, "destroy"])->middleware(['auth', 'verified'])->name('deleteDocument');


Route::get('/jabatan', [JabatanController::class, "index"])->middleware(['auth', 'verified'])->name('showJabatan');
Route::post('/jabatan', [JabatanController::class, "store"])->middleware(['auth', 'verified'])->name('createJabatan');
Route::patch('/jabatan/{id}', [JabatanController::class, "update"])->middleware(['auth', 'verified'])->name('updateJabatan');
Route::delete('/jabatan/{id}', [JabatanController::class, "destroy"])->middleware(['auth', 'verified'])->name('deleteJabatan');

Route::get('/jabatan/api/user/{id}', [JabatanController::class, "getAllJabatanByUserId"])->middleware(['auth', 'verified'])->name('getJabatanByUserId');

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
});

require __DIR__.'/auth.php';
