<?php

use Illuminate\Support\Facades\Route;

use App\Models\Document;
use App\Models\Certificate;
use App\Models\ActivityLog;
use App\Models\User;
use App\Models\Signature;

Route::get('/', function () {
    $currentUser = User::where('email', 'rizky@lexa.com')->first() ?? User::first();

    $totalDocs = Document::count();
    $signedDocs = Document::where('status', 'signed')->count();
    $pendingDocs = Document::where('status', 'pending')->count();
    $draftDocs = Document::where('status', 'draft')->count();
    $rejectedDocs = Document::where('status', 'rejected')->count();

    $activeCerts = Certificate::count();
    $expiredCerts = Certificate::where('status', 'expired')->count();
    $validCerts = Certificate::where('status', 'valid')->count();
    $expiringSoonCerts = Certificate::where('status', 'expiring_soon')->count();

    $nextExpiry = Certificate::where('status', 'expiring_soon')
        ->orderBy('valid_until', 'asc')
        ->first();

    $recentDocuments = Document::with(['uploadedBy', 'signatures.signer'])
        ->latest()
        ->take(5)
        ->get();

    $recentActivities = ActivityLog::with('user')
        ->latest()
        ->take(3)
        ->get();

    // Load full datasets for all sidebar pages
    $allDocuments = Document::with(['uploadedBy', 'signatures.signer'])->latest()->get();
    $allCertificates = Certificate::orderBy('valid_until', 'asc')->get();
    $allActivities = ActivityLog::with('user')->latest()->get();
    $allUsers = User::all();
    $allSignatures = Signature::with(['document', 'signer'])->latest()->get();

    return view('welcome', compact(
        'currentUser',
        'totalDocs', 'signedDocs', 'pendingDocs', 'draftDocs', 'rejectedDocs',
        'activeCerts', 'expiredCerts', 'validCerts', 'expiringSoonCerts',
        'nextExpiry', 'recentDocuments', 'recentActivities',
        'allDocuments', 'allCertificates', 'allActivities', 'allUsers', 'allSignatures'
    ));
});

use Illuminate\Http\Request;

Route::post('/documents', function (Request $request) {
    $currentUser = User::where('email', 'rizky@lexa.com')->first() ?? User::first();
    
    $title = $request->input('file_name');
    if ($request->hasFile('file')) {
        $title = $request->file('file')->getClientOriginalName();
    }
    
    if (!$title) {
        $title = 'Dokumen Baru_' . time() . '.pdf';
    }
    
    $doc = Document::create([
        'title' => $title,
        'type' => $request->input('type', 'General'),
        'status' => 'draft',
        'uploaded_by_id' => $currentUser->id,
        'file_path' => 'documents/' . time() . '_' . $title,
    ]);
    
    ActivityLog::create([
        'user_id' => $currentUser->id,
        'action' => 'upload',
        'description' => $currentUser->name . ' mengunggah dokumen baru: ' . $title,
        'ip_address' => $request->ip(),
    ]);
    
    return redirect('/?tab=documents')->with('success', 'Dokumen "' . $title . '" berhasil diunggah!');
});

Route::post('/signatures', function (Request $request) {
    $currentUser = User::where('email', 'rizky@lexa.com')->first() ?? User::first();
    
    $request->validate([
        'document_id' => 'required|exists:documents,id',
        'signer_id' => 'required|exists:users,id',
    ]);
    
    $doc = Document::find($request->document_id);
    $signer = User::find($request->signer_id);
    
    Signature::create([
        'document_id' => $doc->id,
        'signer_id' => $signer->id,
        'signed_at' => null,
        'ip_address' => null,
    ]);
    
    $doc->update(['status' => 'pending']);
    
    ActivityLog::create([
        'user_id' => $currentUser->id,
        'action' => 'update',
        'description' => $currentUser->name . ' meminta tanda tangan untuk dokumen: ' . $doc->title . ' kepada ' . $signer->name,
        'ip_address' => $request->ip(),
    ]);
    
    return redirect('/?tab=signatures')->with('success', 'Permintaan tanda tangan untuk "' . $doc->title . '" berhasil dikirim ke ' . $signer->name . '!');
});

Route::post('/signatures/{id}/sign', function (Request $request, $id) {
    $sig = Signature::findOrFail($id);
    
    $sig->update([
        'signed_at' => now(),
        'ip_address' => $request->ip(),
    ]);
    
    $doc = $sig->document;
    $pendingCount = Signature::where('document_id', $doc->id)->whereNull('signed_at')->count();
    if ($pendingCount === 0) {
        $doc->update(['status' => 'signed']);
    }
    
    ActivityLog::create([
        'user_id' => $sig->signer_id,
        'action' => 'signed',
        'description' => $sig->signer->name . ' menandatangani dokumen: ' . $doc->title,
        'ip_address' => $request->ip(),
    ]);
    
    return redirect('/?tab=signatures')->with('success', 'Dokumen "' . $doc->title . '" berhasil ditandatangani!');
});

Route::post('/certificates', function (Request $request) {
    $currentUser = User::where('email', 'rizky@lexa.com')->first() ?? User::first();
    
    $request->validate([
        'name' => 'required|string',
        'holder' => 'required|string',
        'validity' => 'required|string',
    ]);
    
    $days = 365;
    if (str_contains($request->validity, '2 Tahun')) {
        $days = 730;
    } elseif (str_contains($request->validity, '90 Hari')) {
        $days = 90;
    }
    
    $cert = Certificate::create([
        'name' => $request->name,
        'holder' => $request->holder,
        'status' => 'valid',
        'issued_at' => now()->toDateString(),
        'valid_until' => now()->addDays($days)->toDateString(),
    ]);
    
    ActivityLog::create([
        'user_id' => $currentUser->id,
        'action' => 'system',
        'description' => $currentUser->name . ' menerbitkan sertifikat digital: ' . $cert->name . ' untuk ' . $cert->holder,
        'ip_address' => $request->ip(),
    ]);
    
    return redirect('/?tab=certificates')->with('success', 'Sertifikat untuk "' . $cert->holder . '" berhasil diterbitkan!');
});

Route::post('/verify', function (Request $request) {
    $title = $request->input('file_name');
    if ($request->hasFile('file')) {
        $title = $request->file('file')->getClientOriginalName();
    }
    
    if (!$title) {
        return response()->json([
            'verified' => false,
            'message' => 'File tidak valid atau tidak terbaca.'
        ]);
    }
    
    $doc = Document::where('status', 'signed')
        ->where('title', 'like', '%' . $title . '%')
        ->first();
        
    if ($doc) {
        $signatures = Signature::with('signer')
            ->where('document_id', $doc->id)
            ->whereNotNull('signed_at')
            ->get();
            
        $signerNames = $signatures->map(fn($s) => $s->signer->name)->join(', ');
        $signerEmails = $signatures->map(fn($s) => $s->signer->email)->join(', ');
        $timestamp = $signatures->first() ? $signatures->first()->signed_at->format('d M Y, H:i') : now()->format('d M Y, H:i');
        
        return response()->json([
            'verified' => true,
            'title' => $doc->title,
            'signer' => $signerNames ?: 'Rizky Pratama',
            'email' => $signerEmails ?: 'rizky@lexa.com',
            'timestamp' => $timestamp . ' WIB',
            'ca' => 'Balai Sertifikasi Elektronik (BSrE) CA'
        ]);
    } else {
        return response()->json([
            'verified' => false,
            'message' => 'Dokumen "' . $title . '" tidak terdaftar atau belum ditandatangani secara sah di sistem LEXA.'
        ]);
    }
});

Route::delete('/documents/{id}', function ($id) {
    $doc = Document::findOrFail($id);
    $currentUser = User::where('email', 'rizky@lexa.com')->first() ?? User::first();
    
    $title = $doc->title;
    $doc->delete();
    
    ActivityLog::create([
        'user_id' => $currentUser->id,
        'action' => 'system',
        'description' => $currentUser->name . ' menghapus dokumen: ' . $title,
        'ip_address' => request()->ip(),
    ]);
    
    return redirect('/?tab=documents')->with('success', 'Dokumen "' . $title . '" berhasil dihapus.');
});

Route::delete('/certificates/{id}', function ($id) {
    $cert = Certificate::findOrFail($id);
    $currentUser = User::where('email', 'rizky@lexa.com')->first() ?? User::first();
    
    $name = $cert->name;
    $holder = $cert->holder;
    $cert->delete();
    
    ActivityLog::create([
        'user_id' => $currentUser->id,
        'action' => 'system',
        'description' => $currentUser->name . ' menghapus sertifikat: ' . $name . ' (' . $holder . ')',
        'ip_address' => request()->ip(),
    ]);
    
    return redirect('/?tab=certificates')->with('success', 'Sertifikat "' . $name . '" berhasil dihapus.');
});

Route::post('/documents/use-template', function (Request $request) {
    $currentUser = User::where('email', 'rizky@lexa.com')->first() ?? User::first();
    
    $request->validate([
        'template_name' => 'required|string',
    ]);
    
    $templateName = $request->template_name;
    $title = 'Draft - ' . $templateName . '.pdf';
    $type = 'General';
    if (str_contains($templateName, 'NDA')) $type = 'Kontrak';
    if (str_contains($templateName, 'PKS')) $type = 'Kontrak';
    if (str_contains($templateName, 'SOP')) $type = 'SOP';
    
    $doc = Document::create([
        'title' => $title,
        'type' => $type,
        'status' => 'draft',
        'uploaded_by_id' => $currentUser->id,
    ]);
    
    ActivityLog::create([
        'user_id' => $currentUser->id,
        'action' => 'upload',
        'description' => $currentUser->name . ' membuat dokumen baru dari template: ' . $templateName,
        'ip_address' => $request->ip(),
    ]);
    
    return redirect('/?tab=documents')->with('success', 'Dokumen baru "' . $title . '" berhasil dibuat dari template!');
});

