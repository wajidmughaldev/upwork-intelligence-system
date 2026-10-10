<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    private function spa(): self
    {
        return $this
            ->withHeader('Origin', 'http://localhost:3000')
            ->withHeader('Referer', 'http://localhost:3000/');
    }

    private function issueCsrfCookie(): void
    {
        $this->spa()->get('/sanctum/csrf-cookie')->assertNoContent();
    }

    public function test_unauthenticated_me_returns_401(): void
    {
        $this->withSession([])->getJson('/api/auth/me')->assertStatus(401);
    }

    public function test_login_with_valid_credentials_authenticates_session_and_returns_safe_user(): void
    {
        $user = User::factory()->create([
            'name' => 'Lead Engineer',
            'email' => 'engineer@example.com',
            'password' => Hash::make('SecretPass123!'),
        ]);

        $this->issueCsrfCookie();

        $response = $this->spa()->postJson('/api/auth/login', [
            'email' => 'engineer@example.com',
            'password' => 'SecretPass123!',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => 'Lead Engineer',
                    'email' => 'engineer@example.com',
                ],
            ])
            ->assertJsonMissing(['password', 'remember_token', 'tokens', 'created_at', 'updated_at']);

        $this->assertAuthenticatedAs($user, 'web');

        $this->spa()->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.email', 'engineer@example.com')
            ->assertJsonMissing(['password', 'remember_token', 'tokens', 'created_at', 'updated_at']);
    }

    public function test_login_with_invalid_credentials_returns_422_and_does_not_authenticate(): void
    {
        User::factory()->create([
            'email' => 'engineer@example.com',
            'password' => Hash::make('SecretPass123!'),
        ]);

        $this->issueCsrfCookie();

        $response = $this->spa()->postJson('/api/auth/login', [
            'email' => 'engineer@example.com',
            'password' => 'WrongPassword!',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid email or password.',
            ]);

        $this->assertGuest('web');
    }

    public function test_logout_invalidates_session_and_me_returns_401_afterward(): void
    {
        User::factory()->create([
            'email' => 'engineer@example.com',
            'password' => Hash::make('SecretPass123!'),
        ]);

        $this->issueCsrfCookie();

        $this->spa()->postJson('/api/auth/login', [
            'email' => 'engineer@example.com',
            'password' => 'SecretPass123!',
        ])->assertOk();

        $this->assertAuthenticated('web');

        $this->spa()->postJson('/api/auth/logout')
            ->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Signed out successfully.',
            ]);

        $this->assertGuest('web');

        $this->flushSession();
        $this->app['auth']->forgetGuards();

        $this->withSession([])->getJson('/api/auth/me')->assertStatus(401);
    }

    public function test_login_throttle_works(): void
    {
        User::factory()->create([
            'email' => 'engineer@example.com',
            'password' => Hash::make('SecretPass123!'),
        ]);

        $this->issueCsrfCookie();

        for ($i = 0; $i < 10; $i++) {
            $this->spa()->postJson('/api/auth/login', [
                'email' => 'engineer@example.com',
                'password' => 'WrongPassword!',
            ])->assertStatus(422);
        }

        $this->spa()->postJson('/api/auth/login', [
            'email' => 'engineer@example.com',
            'password' => 'WrongPassword!',
        ])->assertStatus(429);
    }

    public function test_non_stateful_request_does_not_receive_privileged_session_behavior(): void
    {
        User::factory()->create([
            'email' => 'engineer@example.com',
            'password' => Hash::make('SecretPass123!'),
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'engineer@example.com',
            'password' => 'SecretPass123!',
        ])->assertStatus(401);

        $this->getJson('/api/auth/me')->assertStatus(401);
    }
}
