<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Http\Controllers\UpworkOAuthController;
use App\Models\UpworkConnection;
use App\Models\User;
use App\Services\Upwork\UpworkMcpService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UpworkApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_requests_to_all_upwork_api_endpoints_return_401(): void
    {
        $getEndpoints = [
            '/api/upwork/status',
            '/api/upwork/profile',
            '/api/upwork/connects',
            '/api/upwork/jobs/recommended',
            '/api/upwork/jobs/search',
            '/api/upwork/jobs/~02189a7f34c2b98e71',
            '/api/upwork/proposals',
            '/api/upwork/invitations',
            '/api/upwork/accounts',
        ];

        foreach ($getEndpoints as $url) {
            $response = $this->getJson($url);
            $response->assertStatus(401);
        }

        $postEndpoints = [
            '/api/upwork/accounts/select',
            '/api/upwork/disconnect',
        ];

        foreach ($postEndpoints as $url) {
            $response = $this->postJson($url, []);
            $response->assertStatus(401);
        }
    }

    public function test_authenticated_user_can_access_status_endpoint(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->getJson('/api/upwork/status');

        $response->assertStatus(200)
            ->assertExactJson([
                'connected' => false,
                'status' => 'disconnected',
                'accountName' => null,
                'role' => null,
            ]);
    }

    public function test_job_detail_allows_only_public_tilde_02_references(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->mock(UpworkMcpService::class, function ($mock): void {
            $mock->shouldReceive('jobDetails')
                ->once()
                ->with('~02189a7f34c2b98e71')
                ->andReturn([
                    'job' => [
                        'ciphertext' => '~02189a7f34c2b98e71',
                        'title' => 'Safe Job',
                    ],
                ]);
        });

        $this->getJson('/api/upwork/jobs/' . rawurlencode('~02189a7f34c2b98e71'))
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.reference', '~02189a7f34c2b98e71');
    }

    public function test_invalid_job_detail_references_are_blocked_before_mcp(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->mock(UpworkMcpService::class, function ($mock): void {
            $mock->shouldNotReceive('jobDetails');
        });

        foreach (['1849204918239019283', '~019999999999', 'c8a9f24b-3b7d-4bad-9bdd-2b0d7b3dcb6d', 'arbitrary-ref', ' '] as $reference) {
            $this->getJson('/api/upwork/jobs/' . rawurlencode($reference))
                ->assertStatus(422)
                ->assertJson([
                    'success' => false,
                    'code' => 'INVALID_JOB_REFERENCE',
                    'message' => 'Invalid Upwork job reference.',
                ]);
        }
    }

    public function test_search_input_validation_blocks_unbounded_filters(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->mock(UpworkMcpService::class, function ($mock): void {
            $mock->shouldNotReceive('searchJobs');
        });

        $this->getJson('/api/upwork/jobs/search?' . http_build_query([
            'query' => str_repeat('x', 121),
            'job_type' => 'retainer',
            'limit' => 99,
            'budget_min' => -1,
        ]))->assertStatus(422);
    }

    public function test_search_forwards_valid_bounded_filters(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->mock(UpworkMcpService::class, function ($mock): void {
            $mock->shouldReceive('searchJobs')
                ->once()
                ->with(\Mockery::on(fn (array $filters): bool => $filters['query'] === 'Laravel' && $filters['job_type'] === 'hourly' && (int) $filters['limit'] === 5))
                ->andReturn(['jobs' => []]);
        });

        $this->getJson('/api/upwork/jobs/search?query=Laravel&job_type=hourly&limit=5')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.jobs', []);
    }

    public function test_tokens_and_internal_ids_are_never_exposed_in_status_api(): void
    {
        Sanctum::actingAs(User::factory()->create());

        UpworkConnection::create([
            'provider' => 'upwork',
            'access_token' => 'secret_access_token_xyz_999',
            'refresh_token' => 'secret_refresh_token_abc_888',
            'org_uid' => 'internal_org_uid_12345_sensitive',
            'account_name' => 'Wajid Mughal',
            'account_role' => 'Freelancer',
            'account_status' => 'selected',
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/upwork/status');

        $response->assertStatus(200)
            ->assertJson([
                'connected' => true,
                'status' => 'connected',
                'accountName' => 'Wajid Mughal',
                'role' => 'Freelancer',
            ]);

        $content = (string) $response->getContent();
        $this->assertStringNotContainsString('secret_access_token', $content);
        $this->assertStringNotContainsString('secret_refresh_token', $content);
        $this->assertStringNotContainsString('internal_org_uid', $content);
    }

    public function test_tokens_and_org_uid_are_encrypted_at_rest_in_database(): void
    {
        $connection = UpworkConnection::create([
            'provider' => 'upwork',
            'access_token' => 'plain_secret_token_data',
            'refresh_token' => 'plain_refresh_token_data',
            'org_uid' => 'sensitive_org_uid_val',
            'is_active' => true,
        ]);

        // Raw database query bypasses Eloquent decryption cast
        $raw = DB::table('upwork_connections')->where('id', $connection->id)->first();

        $this->assertNotNull($raw);
        $this->assertNotEquals('plain_secret_token_data', $raw->access_token);
        $this->assertNotEquals('plain_refresh_token_data', $raw->refresh_token);
        $this->assertNotEquals('sensitive_org_uid_val', $raw->org_uid);

        // Access via Eloquent decrypts seamlessly
        $this->assertEquals('plain_secret_token_data', $connection->fresh()->access_token);
        $this->assertEquals('sensitive_org_uid_val', $connection->fresh()->org_uid);
    }

    public function test_authenticated_disconnect_endpoint_deactivates_connection(): void
    {
        Sanctum::actingAs(User::factory()->create());

        UpworkConnection::create([
            'provider' => 'upwork',
            'access_token' => 'token_to_disconnect',
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/upwork/disconnect');

        $response->assertStatus(200)
            ->assertJson([
                'connected' => false,
            ]);

        $this->assertNull(UpworkConnection::active());
    }

    public function test_get_disconnect_route_is_removed(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->get('/oauth/upwork/disconnect');
        $response->assertStatus(404);
    }

    public function test_unauthenticated_oauth_connect_is_rejected(): void
    {
        $response = $this->getJson('/oauth/upwork/connect');
        $response->assertStatus(401);
    }

    public function test_open_redirect_return_to_url_sanitization(): void
    {
        $controller = app(UpworkOAuthController::class);

        // Malicious external URLs must be rejected and replaced with default frontend URL
        $this->assertEquals('http://localhost:3000', $controller->sanitizeReturnTo('https://malicious.example'));
        $this->assertEquals('http://localhost:3000', $controller->sanitizeReturnTo('//malicious.example'));
        $this->assertEquals('http://localhost:3000', $controller->sanitizeReturnTo('javascript:alert(1)'));
        $this->assertEquals('http://localhost:3000', $controller->sanitizeReturnTo('data:text/html,evil'));
        $this->assertEquals('http://localhost:3000', $controller->sanitizeReturnTo('http://attacker.com/oauth'));

        // Valid relative paths and exact origin matches must be accepted
        $this->assertEquals('http://localhost:3000/dashboard', $controller->sanitizeReturnTo('/dashboard'));
        $this->assertEquals('http://localhost:3000/settings?tab=upwork', $controller->sanitizeReturnTo('http://localhost:3000/settings?tab=upwork'));
    }

    public function test_stateful_session_authenticated_api_access(): void
    {
        $user = User::factory()->create();

        // Simulate stateful first-party SPA session login
        $this->actingAs($user, 'web');

        $response = $this->getJson('/api/upwork/status', [
            'referer' => 'http://localhost:3000',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'connected' => false,
            ]);
    }
}
