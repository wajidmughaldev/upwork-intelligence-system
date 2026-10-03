<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\UpworkConnection;
use Illuminate\Foundation\Testing\RefreshDatabase;
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

    public function test_disconnect_clears_stored_tokens_and_deactivates(): void
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

        $response = $this->get('/oauth/upwork/disconnect');

        $response->assertRedirect('http://localhost:3000?upwork_disconnected=1');

        $this->assertNull(UpworkConnection::active());
    }
}
