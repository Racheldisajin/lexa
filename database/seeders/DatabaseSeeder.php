<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Admin User & Other Users
        $admin = User::factory()->create([
            'name' => 'Rizky Pratama',
            'email' => 'rizky@lexa.com',
            'password' => bcrypt('password'),
        ]);

        $budi = User::factory()->create([
            'name' => 'Budi Santoso',
            'email' => 'budi@lexa.com',
            'password' => bcrypt('password'),
        ]);

        $nadia = User::factory()->create([
            'name' => 'Nadia Putri',
            'email' => 'nadia@lexa.com',
            'password' => bcrypt('password'),
        ]);

        $andi = User::factory()->create([
            'name' => 'Andi Wijaya',
            'email' => 'andi@lexa.com',
            'password' => bcrypt('password'),
        ]);

        // 2. Create Specific Documents
        $doc1 = \App\Models\Document::create([
            'title' => 'Kontrak Kerjasama LEXA.pdf',
            'type' => 'Kontrak',
            'status' => 'signed',
            'uploaded_by_id' => $admin->id,
        ]);

        $doc2 = \App\Models\Document::create([
            'title' => 'Proposal Project Digital.docx',
            'type' => 'Proposal',
            'status' => 'pending',
            'uploaded_by_id' => $nadia->id,
        ]);

        $doc3 = \App\Models\Document::create([
            'title' => 'SOP Security System.pdf',
            'type' => 'SOP',
            'status' => 'draft',
            'uploaded_by_id' => $admin->id,
        ]);

        $doc4 = \App\Models\Document::create([
            'title' => 'Laporan Keuangan Q1.xlsx',
            'type' => 'Laporan',
            'status' => 'signed',
            'uploaded_by_id' => $admin->id,
        ]);

        $doc5 = \App\Models\Document::create([
            'title' => 'NDCA - Confidential.pdf',
            'type' => 'Laporan',
            'status' => 'rejected',
            'uploaded_by_id' => $budi->id,
        ]);

        // 3. Create Signatures for these documents
        // doc1: Kontrak Kerjasama LEXA.pdf signed by Budi Santoso & Nadia Putri
        \App\Models\Signature::create([
            'document_id' => $doc1->id,
            'signer_id' => $budi->id,
            'signed_at' => now()->subHours(2),
            'ip_address' => '103.123.45.67',
        ]);
        \App\Models\Signature::create([
            'document_id' => $doc1->id,
            'signer_id' => $nadia->id,
            'signed_at' => now()->subHour(),
            'ip_address' => '103.123.45.68',
        ]);

        // doc4: Laporan Keuangan Q1.xlsx signed by Rizky Pratama, Budi Santoso, Andi Wijaya
        \App\Models\Signature::create([
            'document_id' => $doc4->id,
            'signer_id' => $admin->id,
            'signed_at' => now()->subDay(),
            'ip_address' => '103.123.45.67',
        ]);
        \App\Models\Signature::create([
            'document_id' => $doc4->id,
            'signer_id' => $budi->id,
            'signed_at' => now()->subDay(),
            'ip_address' => '103.123.45.68',
        ]);
        \App\Models\Signature::create([
            'document_id' => $doc4->id,
            'signer_id' => $andi->id,
            'signed_at' => now()->subDay(),
            'ip_address' => '103.123.45.69',
        ]);

        // doc2: Proposal Project Digital.docx pending signature from Andi
        \App\Models\Signature::create([
            'document_id' => $doc2->id,
            'signer_id' => $andi->id,
            'signed_at' => null, // Pending
            'ip_address' => null,
        ]);

        // 4. Create Random Documents to fill total counts (124 total: 89 signed, 18 pending, 12 draft, 5 rejected)
        // Signed (87 more)
        \App\Models\Document::factory()->count(87)->create([
            'status' => 'signed',
            'uploaded_by_id' => $admin->id,
        ]);
        // Pending (17 more)
        \App\Models\Document::factory()->count(17)->create([
            'status' => 'pending',
            'uploaded_by_id' => $admin->id,
        ]);
        // Draft (11 more)
        \App\Models\Document::factory()->count(11)->create([
            'status' => 'draft',
            'uploaded_by_id' => $admin->id,
        ]);
        // Rejected (4 more)
        \App\Models\Document::factory()->count(4)->create([
            'status' => 'rejected',
            'uploaded_by_id' => $admin->id,
        ]);

        // 5. Create Specific Certificates
        // Expiring Soon Certificate: PT LEXA INDONESIA - Code Signing (valid until next month)
        \App\Models\Certificate::create([
            'name' => 'PT LEXA INDONESIA - Code Signing',
            'holder' => 'PT LEXA INDONESIA',
            'status' => 'expiring_soon',
            'valid_until' => now()->addDays(21),
            'issued_at' => now()->subMonth(),
        ]);

        // Expired Certificate: PT LEXA INDONESIA - SSL Certificate
        \App\Models\Certificate::create([
            'name' => 'PT LEXA INDONESIA - SSL Certificate',
            'holder' => 'PT LEXA INDONESIA',
            'status' => 'expired',
            'valid_until' => now()->subDays(1),
            'issued_at' => now()->subYear(),
        ]);

        // 6. Create Random Certificates to fill counts (37 total: 28 valid, 4 expiring soon, 5 expired)
        // Valid (28 total)
        \App\Models\Certificate::factory()->count(28)->create([
            'status' => 'valid',
            'valid_until' => now()->addYear(),
        ]);
        // Expiring Soon (3 more)
        \App\Models\Certificate::factory()->count(3)->create([
            'status' => 'expiring_soon',
            'valid_until' => now()->addDays(15),
        ]);
        // Expired (4 more)
        \App\Models\Certificate::factory()->count(4)->create([
            'status' => 'expired',
            'valid_until' => now()->subDays(10),
        ]);

        // 7. Create Specific Activity Logs
        \App\Models\ActivityLog::create([
            'user_id' => $admin->id,
            'action' => 'signed',
            'description' => 'Rizky Pratama menandatangani dokumen: Kontrak Kerjasama LEXA.pdf',
            'ip_address' => '103.123.45.67',
            'created_at' => now()->subMinutes(30),
        ]);
        \App\Models\ActivityLog::create([
            'user_id' => $nadia->id,
            'action' => 'upload',
            'description' => 'Nadia Putri mengunggah dokumen: Proposal Project Digital.docx',
            'ip_address' => '103.123.45.68',
            'created_at' => now()->subHours(3),
        ]);
        \App\Models\ActivityLog::create([
            'user_id' => $andi->id,
            'action' => 'update',
            'description' => 'Andi Wijaya menambahkan signer pada dokumen: SOP Security System.pdf',
            'ip_address' => '103.123.45.69',
            'created_at' => now()->subHours(20),
        ]);
    }
}
