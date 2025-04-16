<?php

namespace App\Services;

class UtilityService {
    public static function determineDocumentState($surat) {
        if (empty($surat->signature) || !isset($surat->signature[0]->approval)) {
            return null;
        }
        $state = 'approved';
        $pendingCount = 0;
        foreach ($surat->signature as $signature) {
            if ($signature->approval->status === 'pending') {
                $state = 'pending';
                $pendingCount++;
            } else if ($signature->approval->status === 'rejected') {
                $state = 'rejected';
                break;
            }
        }
        return [
            'state' => $state,
            'new' => $pendingCount === count($surat->signature),
        ];
    }

    public static function cleanString($str) {
        // Remove all non-letter and non-space characters
        $cleaned = preg_replace('/[^a-zA-Z ]/', '', $str);
        return strtolower(trim($cleaned));
    }
}
