<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Models\UpworkConnection;
use App\Services\Upwork\UpworkMcpService;
use Exception;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UpworkMcpServiceTest extends TestCase
{
    use RefreshDatabase;

    protected UpworkMcpService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new UpworkMcpService();
    }

    public function test_connection_status_is_disconnected_without_credentials(): void
    {
        $status = $this->service->connectionStatus();

        $this->assertFalse($status['connected']);
        $this->assertNull($status['accountName']);
        $this->assertNull($status['role']);
    }

    public function test_connection_status_is_connected_with_active_model(): void
    {
        UpworkConnection::create([
            'provider' => 'upwork',
            'access_token' => 'active_oauth_token',
            'account_name' => 'John Doe',
            'account_role' => 'Freelancer',
            'is_active' => true,
        ]);

        $status = $this->service->connectionStatus();

        $this->assertTrue($status['connected']);
        $this->assertEquals('John Doe', $status['accountName']);
        $this->assertEquals('Freelancer', $status['role']);
    }

    public function test_write_operations_are_strictly_blocked_by_security_guard(): void
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('assertReadOnlyTool');
        $method->setAccessible(true);

        // Disallowed write tools
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Security Exception: Tool [manage_proposals] is blocked');
        $method->invoke($this->service, 'manage_proposals', ['action' => 'create']);
    }

    public function test_confirm_preview_is_strictly_blocked_by_security_guard(): void
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('assertReadOnlyTool');
        $method->setAccessible(true);

        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Security Exception: Tool [confirm_preview] is blocked');
        $method->invoke($this->service, 'confirm_preview', ['action' => 'confirm']);
    }

    public function test_identifier_normalization_preserves_both_numeric_and_ciphertext(): void
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('normalizeJobIdentifiers');
        $method->setAccessible(true);

        $payload = [
            'jobs' => [
                [
                    'id' => '~02189a7f34c2b98e71',
                    'numeric_id' => '1849204918239019283',
                    'title' => 'Senior Full Stack Engineer',
                ],
                [
                    'id' => '1849204918239019999',
                    'ciphertext' => '~029999999999999999',
                    'title' => 'Laravel React Architect',
                ],
            ],
        ];

        $normalized = $method->invoke($this->service, $payload);

        // First job
        $this->assertEquals('~02189a7f34c2b98e71', $normalized['jobs'][0]['ciphertext']);
        $this->assertEquals('1849204918239019283', $normalized['jobs'][0]['numeric_id']);

        // Second job
        $this->assertEquals('~029999999999999999', $normalized['jobs'][1]['ciphertext']);
        $this->assertEquals('1849204918239019999', $normalized['jobs'][1]['numeric_id']);
    }
}
