<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Frontend\DocumentsFrontendController;

Route::get('/', [DocumentsFrontendController::class, "showSubmit"]);
Route::get('/daftar', [DocumentsFrontendController::class, "showList"]);

Route::get('/inertiatest', function () {
    return Inertia::render('TestDemo/TestDemo', [
        'date' => date("Y-m-d"),
    ]); // This will get default component from the resources/js/pages/TestDemo/TestDemo.jsx
});
