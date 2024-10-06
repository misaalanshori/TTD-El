<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/inertiatest', function () {
    return Inertia::render('TestDemo/TestDemo', [
        'date' => date("Y-m-d"),
    ]); // This will get default component from the resources/js/pages/TestDemo/TestDemo.jsx
});