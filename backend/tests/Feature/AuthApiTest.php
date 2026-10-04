<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_me_returns_401(): void
    {
        $response = $this->getJson('/api/auth/me');
        $response->assertStatus(401);
    }

    public function test_login_with_valid_credentials_authenticates_session_and_returns_safe_user(): void
    {
        $user = User::factory()->create([
            'email' => 'engineer@example.com',
            'password' => Hash::make('SecretPass123!'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'engineer@example.com',
            'password' => 'SecretPass123!',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => 'engineer@example.com',
                ],
            ]);

        $response->assertJsonMissing(['password', 'remember_token', 'two_factor_secret', 'two_factor_recovery_codes']);
        $this->assertAuthenticatedAs($user);
    }

    public function test_login_with_invalid_credentials_is_rejected_and_does_not_authenticate(): void
    {
        User::factory()->create([
            'email' => 'engineer@example.com',
            'password' => Hash::make('SecretPass123!'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'engineer@example.com',
            'password' => 'WrongPassword!',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);

        $this->assertGuest();
    }

    public function test_authenticated_me_returns_safe_user_payload(): void
    {
        $user = User::factory()->create([
            'name' => 'Lead Engineer',
            'email' => 'lead@example.com',
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/auth/me');
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => 'Lead Engineer',
                    'email' => 'lead@example.com',
                ],
            ]);

        $response->assertJsonMissing(['password', 'remember_token']);
    }

    public function test_authenticated_logout_invalidates_session(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/auth/logout');
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Signed out successfully.',
            ]);

        $this->assertGuest();
    }

    public function test_sensitive_model_fields_and_password_hashes_are_never_exposed(): void
    {
        $user = User::factory()->create([
            'email' => 'secure@example.com',
            'password' => Hash::make('StrongPass789!'),
        ]);

        Sanctum::actingAs($user);

        $meResponse = $this->getJson('/api/auth/me');
        $meData = $meResponse->json('user');

        $this->assertArrayHasKey('id', $meData);
        $this->assertArrayHasKey('name', $meData);
        $this->assertArrayHasKey('email', $meData);
        $this->assertArrayNotHasKey('password', $meData);
        $this->assertArrayNotHasKey('remember_token', $meData);
        $this->assertArrayNotHasKey('two_factor_secret', $meData);
    }
}
