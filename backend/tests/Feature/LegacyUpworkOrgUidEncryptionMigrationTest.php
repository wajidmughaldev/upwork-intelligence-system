<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class LegacyUpworkOrgUidEncryptionMigrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_encrypts_only_legacy_plaintext_numeric_org_uids(): void
    {
        $alreadyEncrypted = Crypt::encryptString('987654321');

        DB::table('upwork_connections')->insert([
            [
                'provider' => 'upwork',
                'client_id' => 'client-one',
                'access_token' => 'access-one',
                'refresh_token' => 'refresh-one',
                'org_uid' => '123456789',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'provider' => 'upwork',
                'client_id' => 'client-two',
                'access_token' => 'access-two',
                'refresh_token' => 'refresh-two',
                'org_uid' => $alreadyEncrypted,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'provider' => 'upwork',
                'client_id' => 'client-three',
                'access_token' => 'access-three',
                'refresh_token' => 'refresh-three',
                'org_uid' => 'not-a-numeric-org',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $migration = require database_path('migrations/2026_10_10_120000_encrypt_legacy_plaintext_upwork_org_uid.php');
        $migration->up();

        $rows = DB::table('upwork_connections')->orderBy('id')->get();

        $this->assertNotSame('123456789', $rows[0]->org_uid);
        $this->assertSame('123456789', Crypt::decryptString($rows[0]->org_uid));

        $this->assertSame($alreadyEncrypted, $rows[1]->org_uid);
        $this->assertSame('987654321', Crypt::decryptString($rows[1]->org_uid));

        $this->assertSame('not-a-numeric-org', $rows[2]->org_uid);

        $this->assertSame('access-one', $rows[0]->access_token);
        $this->assertSame('refresh-one', $rows[0]->refresh_token);
        $this->assertSame('client-one', $rows[0]->client_id);
        $this->assertSame('access-two', $rows[1]->access_token);
        $this->assertSame('refresh-two', $rows[1]->refresh_token);
        $this->assertSame('client-two', $rows[1]->client_id);
    }
}
