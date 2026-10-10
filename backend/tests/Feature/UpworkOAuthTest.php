<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\UpworkConnection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UpworkOAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_metadata_document_is_served_according_to_spec(): void
    {
        $response = $this->get('/mcp/oauth/upwork/client-metadata.json');

        $response->assertStatus(200)
            ->assertHeader('content-type', 'application/json')
            ->assertJsonStructure([
                'client_name',
                'client_uri',
                'grant_types',
                'response_types',
                'client_id',
                'redirect_uris',
                'token_endpoint_auth_method',
            ])
            ->assertJson([
                'grant_types' => ['authorization_code', 'refresh_token'],
                'response_types' => ['code'],
                'token_endpoint_auth_method' => 'none',
            ]);

        $this->assertNotEmpty($response->json('client_id'));
        $this->assertContains(url('mcp/oauth/upwork/callback'), $response->json('redirect_uris'));
    }

    public function test_disconnect_requires_authentication_and_deactivates_connection(): void
    {
        UpworkConnection::create([
            'provider' => 'upwork',
            'access_token' => 'active_session_token',
            'refresh_token' => 'refresh_token_data',
            'org_uid' => 'internal_talent_uid',
            'account_name' => 'Wajid Mughal',
            'is_active' => true,
        ]);

        $this->assertNotNull(UpworkConnection::active());

        // Unauthenticated POST fails with 401
        $responseUnauth = $this->postJson('/api/upwork/disconnect');
        $responseUnauth->assertStatus(401);

        // Authenticated POST succeeds
        Sanctum::actingAs(User::factory()->create());
        $responseAuth = $this->postJson('/api/upwork/disconnect');
        $responseAuth->assertStatus(200)
            ->assertJson([
                'success' => true,
                'connected' => false,
                'message' => 'Upwork account disconnected successfully.',
            ]);

        $this->assertNull(UpworkConnection::active());
    }

    public function test_oauth_connect_requires_authenticated_user(): void
    {
        $responseUnauth = $this->getJson('/oauth/upwork/connect');
        $responseUnauth->assertStatus(401);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $responseAuth = $this->get('/oauth/upwork/connect');
        // Authenticated connect redirects to OAuth provider
        $this->assertTrue($responseAuth->isRedirect());
    }
}
