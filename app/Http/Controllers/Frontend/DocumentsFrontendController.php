<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DocumentsFrontendController extends Controller
{
    public function showSubmit(Request $request) {
        return Inertia::render('Documents/SubmitDocument');
    }

    public function showList(Request $request) {
        return Inertia::render('Documents/ListDocuments');
    }
}
