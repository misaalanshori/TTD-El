<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Frontend\DocumentsFrontendController;

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

Route::get('/', [DocumentsFrontendController::class, "showSubmit"])->middleware(['auth', 'verified'])->name('submitDocument');
Route::get('/daftar', [DocumentsFrontendController::class, "showList"])->middleware(['auth', 'verified'])->name('showDocuments');

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
});

require __DIR__.'/auth.php';
