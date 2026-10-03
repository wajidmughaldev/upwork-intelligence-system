<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\UpworkConnection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class UpworkApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_status_endpoint_returns_disconnected_state_by_default(): void
    {
        $response = $this->getJson('/api/upwork/status');

        $response->assertStatus(200)
            ->assertExactJson([
                'connected' => false,
                'accountName' => null,
                'role' => null,
            ]);
    }

    public function test_tokens_and_internal_ids_are_never_exposed_in_status_api(): void
    {
        UpworkConnection::create([
            'provider' => 'upwork',
            'access_token' => 'secret_access_token_xyz_999',
            'refresh_token' => 'secret_refresh_token_abc_888',
            'org_uid' => 'internal_org_uid_12345_sensitive',
            'account_name' => 'Wajid Mughal',
            'account_role' => 'Freelancer',
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/upwork/status');

        $response->assertStatus(200)
            ->assertJson([
                'connected' => true,
                'accountName' => 'Wajid Mughal',
                'role' => 'Freelancer',
            ]);

        // Explicit security non-exposure assertions
        $content = (string) $response->getContent();
        $this->assertStringNotContainsString('secret_access_token', $content);
        $this->assertStringNotContainsString('secret_refresh_token', $content);
        $this->assertStringNotContainsString('internal_org_uid', $content);
    }

    public function test_tokens_are_encrypted_at_rest_in_database(): void
    {
        $connection = UpworkConnection::create([
            'provider' => 'upwork',
            'access_token' => 'plain_secret_token_data',
            'refresh_token' => 'plain_refresh_token_data',
            'is_active' => true,
        ]);

        // Read raw database row bypassing Eloquent decryption cast
        $raw = DB::table('upwork_connections')->where('id', $connection->id)->first();

        $this->assertNotNull($raw);
        $this->assertNotEquals('plain_secret_token_data', $raw->access_token);
        $this->assertNotEquals('plain_refresh_token_data', $raw->refresh_token);

        // Access via Eloquent decrypts seamlessly
        $this->assertEquals('plain_secret_token_data', $connection->fresh()->access_token);
    }

    public function test_protected_endpoints_fail_gracefully_when_disconnected(): void
    {
        $endpoints = [
            '/api/upwork/profile',
            '/api/upwork/connects',
            '/api/upwork/jobs/recommended',
            '/api/upwork/jobs/search',
            '/api/upwork/jobs/1849204918239019283',
            '/api/upwork/proposals',
            '/api/upwork/invitations',
        ];

        foreach ($endpoints as $url) {
            $response = $this->getJson($url);
            $response->assertStatus(400)
                ->assertJsonStructure([
                    'success',
                    'message',
                ])
                ->assertJson([
                    'success' => false,
                ]);

            $this->assertStringContainsString('not connected', (string) $response->json('message'));
        }
    }

    public function test_disconnect_endpoint_deactivates_connection(): void
    {
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

    public function test_job_search_handles_empty_results_shape(): void
    {
        UpworkConnection::create([
            'provider' => 'upwork',
            'access_token' => 'active_token',
            'org_uid' => 'org_123',
            'is_active' => true,
        ]);

        $mockService = $this->createMock(\App\Services\Upwork\UpworkMcpService::class);
        $mockService->method('searchJobs')->willReturn([
            'jobs' => [],
            'total_count' => 0,
        ]);
        $this->app->instance(\App\Services\Upwork\UpworkMcpService::class, $mockService);

        $response = $this->getJson('/api/upwork/jobs/search?query=NonExistentSkill123');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'jobs' => [],
                    'total_count' => 0,
                ],
            ]);
    }

    public function test_mcp_failure_is_normalized_without_leaking_sensitive_traces(): void
    {
        UpworkConnection::create([
            'provider' => 'upwork',
            'access_token' => 'active_token',
            'org_uid' => 'org_123',
            'is_active' => true,
        ]);

        $mockService = $this->createMock(\App\Services\Upwork\UpworkMcpService::class);
        $mockService->method('profile')->willThrowException(
            new \Exception('Upwork MCP Error (get_profile): Remote rate limit exceeded [trace_id: upw_trace_98231]')
        );
        $this->app->instance(\App\Services\Upwork\UpworkMcpService::class, $mockService);

        $response = $this->getJson('/api/upwork/profile');

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Upwork MCP Error (get_profile): Remote rate limit exceeded [trace_id: upw_trace_98231]',
            ]);

        // Ensure internal token/secrets are not leaked
        $content = (string) $response->getContent();
        $this->assertStringNotContainsString('active_token', $content);
        $this->assertStringNotContainsString('password', $content);
    }
}
