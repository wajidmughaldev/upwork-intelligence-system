<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Exceptions\AccountSelectionRequiredException;
use App\Exceptions\NoEligibleAccountException;
use App\Exceptions\ReconnectRequiredException;
use App\Models\UpworkConnection;
use App\Services\Upwork\UpworkErrorNormalizer;
use App\Services\Upwork\UpworkMcpService;
use Carbon\Carbon;
use Exception;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UpworkTokenAndAccountSelectionTest extends TestCase
{
    use RefreshDatabase;

    public function test_zero_eligible_talent_accounts_throws_no_eligible_account_exception(): void
    {
        UpworkConnection::create([
            'provider' => 'upwork',
            'access_token' => 'active_token',
            'is_active' => true,
        ]);

        $service = $this->getMockBuilder(UpworkMcpService::class)
            ->onlyMethods(['accounts'])
            ->getMock();

        // Remote list_accounts returns only CLIENT accounts
        $service->method('accounts')->willReturn([
            'accounts' => [
                [
                    'id' => 'client_org_1',
                    'name' => 'Acme Hiring Agency',
                    'type' => 'CLIENT',
                ],
            ],
        ]);

        $this->expectException(NoEligibleAccountException::class);
        $this->expectExceptionMessage('No eligible Upwork TALENT (freelancer) account found');

        $service->syncAccountMetadata();

        $connection = UpworkConnection::active();
        $this->assertEquals('no_eligible_account', $connection->account_status);
    }

    public function test_exactly_one_talent_account_is_automatically_selected(): void
    {
        UpworkConnection::create([
            'provider' => 'upwork',
            'access_token' => 'active_token',
            'is_active' => true,
        ]);

        $service = $this->getMockBuilder(UpworkMcpService::class)
            ->onlyMethods(['accounts'])
            ->getMock();

        $service->method('accounts')->willReturn([
            'accounts' => [
                [
                    'id' => 'client_org_1',
                    'name' => 'Acme Hiring Agency',
                    'type' => 'CLIENT',
                ],
                [
                    'org_uid' => 'talent_org_999',
                    'name' => 'Wajid Mughal Freelancer',
                    'type' => 'TALENT',
                ],
            ],
        ]);

        $result = $service->syncAccountMetadata();

        $this->assertEquals('selected', $result['status']);
        $this->assertEquals('Wajid Mughal Freelancer', $result['accountName']);
        $this->assertEquals('Freelancer', $result['role']);

        $connection = UpworkConnection::active();
        $this->assertEquals('selected', $connection->account_status);
        $this->assertEquals('talent_org_999', $connection->org_uid);
        $this->assertEquals('Wajid Mughal Freelancer', $connection->account_name);
    }

    public function test_multiple_talent_accounts_throws_selection_required_exception(): void
    {
        UpworkConnection::create([
            'provider' => 'upwork',
            'access_token' => 'active_token',
            'is_active' => true,
        ]);

        $service = $this->getMockBuilder(UpworkMcpService::class)
            ->onlyMethods(['accounts'])
            ->getMock();

        $service->method('accounts')->willReturn([
            'accounts' => [
                [
                    'org_uid' => 'talent_org_1',
                    'name' => 'Profile A (Engineering)',
                    'type' => 'TALENT',
                ],
                [
                    'org_uid' => 'talent_org_2',
                    'name' => 'Profile B (Consulting)',
                    'type' => 'TALENT',
                ],
            ],
        ]);

        try {
            $service->syncAccountMetadata();
            $this->fail('Expected AccountSelectionRequiredException was not thrown.');
        } catch (AccountSelectionRequiredException $e) {
            $this->assertCount(2, $e->candidateAccounts);
            $this->assertEquals('Profile A (Engineering)', $e->candidateAccounts[0]['name']);
            $this->assertEquals('Profile B (Consulting)', $e->candidateAccounts[1]['name']);

            // Verify org_uid is not exposed in candidate data
            $json = json_encode($e->candidateAccounts);
            $this->assertStringNotContainsString('talent_org_1', $json);
            $this->assertStringNotContainsString('talent_org_2', $json);
        }

        $connection = UpworkConnection::active();
        $this->assertEquals('selection_required', $connection->account_status);
    }

    public function test_manual_talent_account_selection_works(): void
    {
        $connection = UpworkConnection::create([
            'provider' => 'upwork',
            'access_token' => 'active_token',
            'account_status' => 'selection_required',
            'raw_metadata' => [
                'talent_candidates' => [
                    '0' => [
                        'org_uid' => 'talent_org_first',
                        'name' => 'Profile First',
                        'role' => 'Freelancer',
                        'raw' => ['test' => 1],
                    ],
                    '1' => [
                        'org_uid' => 'talent_org_second',
                        'name' => 'Profile Second',
                        'role' => 'Freelancer',
                        'raw' => ['test' => 2],
                    ],
                ],
            ],
            'is_active' => true,
        ]);

        $service = new UpworkMcpService();
        $res = $service->selectTalentAccount('1');

        $this->assertEquals('selected', $res['status']);
        $this->assertEquals('Profile Second', $res['accountName']);

        $refreshed = $connection->fresh();
        $this->assertEquals('selected', $refreshed->account_status);
        $this->assertEquals('talent_org_second', $refreshed->org_uid);
        $this->assertEquals('Profile Second', $refreshed->account_name);
    }

    public function test_expired_token_without_refresh_token_triggers_reconnect_required(): void
    {
        UpworkConnection::create([
            'provider' => 'upwork',
            'access_token' => 'expired_token',
            'refresh_token' => null,
            'expires_at' => Carbon::now()->subMinutes(10),
            'is_active' => true,
        ]);

        $service = new UpworkMcpService();

        $this->expectException(ReconnectRequiredException::class);
        $this->expectExceptionMessage('no refresh token is present. Reconnection required.');

        $service->ensureFreshToken();
    }

    public function test_error_normalizer_formats_rate_limit_and_preserves_trace_id(): void
    {
        $exception = new Exception('Upwork remote API rate limit exceeded. trace_id: upw_req_491823');
        $response = UpworkErrorNormalizer::normalize($exception);

        $this->assertEquals(429, $response->getStatusCode());
        $data = $response->getData(true);

        $this->assertFalse($data['success']);
        $this->assertEquals('UPWORK_RATE_LIMITED', $data['code']);
        $this->assertEquals('upw_req_491823', $data['traceId']);
        $this->assertStringContainsString('Upwork temporarily limited', $data['message']);
    }

    public function test_error_normalizer_formats_reconnect_required(): void
    {
        $exception = new ReconnectRequiredException('Upwork access token has expired.');
        $response = UpworkErrorNormalizer::normalize($exception);

        $this->assertEquals(401, $response->getStatusCode());
        $data = $response->getData(true);

        $this->assertFalse($data['success']);
        $this->assertEquals('RECONNECT_REQUIRED', $data['code']);
    }

    public function test_org_uid_is_stored_encrypted_in_raw_database_and_hidden_from_serialization(): void
    {
        $connection = UpworkConnection::create([
            'provider' => 'upwork',
            'access_token' => 'active_token',
            'org_uid' => 'sensitive_org_uid_99999',
            'account_status' => 'selected',
            'is_active' => true,
        ]);

        // Raw database query bypasses Eloquent decryption cast
        $raw = \Illuminate\Support\Facades\DB::table('upwork_connections')->where('id', $connection->id)->first();
        $this->assertNotNull($raw);
        $this->assertNotEquals('sensitive_org_uid_99999', $raw->org_uid);
        $this->assertStringNotContainsString('sensitive_org_uid_99999', (string) $raw->org_uid);

        // Access via Eloquent decrypts seamlessly
        $this->assertEquals('sensitive_org_uid_99999', $connection->fresh()->org_uid);

        // Serialization hides org_uid
        $array = $connection->fresh()->toArray();
        $this->assertArrayNotHasKey('org_uid', $array);
        $this->assertStringNotContainsString('sensitive_org_uid_99999', json_encode($array));
    }

    public function test_expired_candidate_metadata_clears_raw_metadata_and_returns_selection_expired(): void
    {
        $connection = UpworkConnection::create([
            'provider' => 'upwork',
            'access_token' => 'active_token',
            'account_status' => 'selection_required',
            'raw_metadata' => [
                'talent_candidates' => [
                    '0' => ['name' => 'Profile Alpha', 'org_uid' => 'secret_org_1'],
                ],
                'expires_at' => Carbon::now()->subMinutes(10)->toIso8601String(),
            ],
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/upwork/accounts');

        $response->assertStatus(410)
            ->assertJson([
                'success' => false,
                'code' => 'SELECTION_EXPIRED',
            ]);

        $this->assertNull($connection->fresh()->raw_metadata);
        $this->assertEquals('selection_expired', $connection->fresh()->account_status);
    }
}
