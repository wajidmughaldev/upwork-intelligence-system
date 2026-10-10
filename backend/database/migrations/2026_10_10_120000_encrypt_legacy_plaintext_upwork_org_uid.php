<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('upwork_connections')
            ->whereNotNull('org_uid')
            ->where('org_uid', '<>', '')
            ->select(['id', 'org_uid'])
            ->chunkById(100, function ($connections): void {
                foreach ($connections as $connection) {
                    $rawOrgUid = (string) $connection->org_uid;

                    try {
                        Crypt::decryptString($rawOrgUid);

                        continue;
                    } catch (Throwable) {
                        // Legacy plaintext org UIDs are numeric. Corrupt or unknown values stay untouched.
                    }

                    if (! ctype_digit($rawOrgUid)) {
                        continue;
                    }

                    DB::table('upwork_connections')
                        ->where('id', $connection->id)
                        ->update(['org_uid' => Crypt::encryptString($rawOrgUid)]);
                }
            });
    }

    public function down(): void
    {
        // Intentionally irreversible: do not decrypt stored org UID values.
    }
};
