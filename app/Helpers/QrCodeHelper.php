<?php

namespace App\Helpers;

use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\Storage;
use Nette\Utils\Random;

class QrCodeHelper
{

    public static function generateQrCode(string $link, string $path)
    {

        $writer = new PngWriter();
        $qrCode = new QrCode($link);
        $result = $writer->write($qrCode);
        // header('Content-Type: '.$result->getMimeType());
        $path .= '/'.Random::generate().'.png';
        Storage::disk('public')->put($path, $result->getString());
        return url($path);
    }
}
