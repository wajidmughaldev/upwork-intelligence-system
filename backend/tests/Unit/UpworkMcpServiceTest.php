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
        $this->assertEquals('disconnected', $status['status']);
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
            'account_status' => 'selected',
            'is_active' => true,
        ]);

        $status = $this->service->connectionStatus();

        $this->assertTrue($status['connected']);
        $this->assertEquals('connected', $status['status']);
        $this->assertEquals('John Doe', $status['accountName']);
        $this->assertEquals('Freelancer', $status['role']);
    }

    public function test_missing_account_metadata_remains_null(): void
    {
        UpworkConnection::create([
            'provider' => 'upwork',
            'access_token' => 'active_oauth_token',
            'account_name' => null,
            'account_role' => null,
            'account_status' => 'selected',
            'is_active' => true,
        ]);

        $status = $this->service->connectionStatus();

        $this->assertTrue($status['connected']);
        $this->assertEquals('connected', $status['status']);
        $this->assertNull($status['accountName']);
        $this->assertNull($status['role']);
    }

    public function test_selection_required_status_is_explicit_and_not_connected(): void
    {
        UpworkConnection::create([
            'provider' => 'upwork',
            'access_token' => 'active_oauth_token',
            'account_status' => 'selection_required',
            'is_active' => true,
        ]);

        $status = $this->service->connectionStatus();

        $this->assertFalse($status['connected']);
        $this->assertEquals('selection_required', $status['status']);
        $this->assertNull($status['accountName']);
        $this->assertNull($status['role']);
    }

    public function test_no_eligible_account_status_is_explicit_and_not_connected(): void
    {
        UpworkConnection::create([
            'provider' => 'upwork',
            'access_token' => 'active_oauth_token',
            'account_status' => 'no_eligible_account',
            'is_active' => true,
        ]);

        $status = $this->service->connectionStatus();

        $this->assertFalse($status['connected']);
        $this->assertEquals('no_eligible_account', $status['status']);
        $this->assertNull($status['accountName']);
        $this->assertNull($status['role']);
    }

    public function test_pending_account_sync_is_not_reported_as_connected(): void
    {
        UpworkConnection::create([
            'provider' => 'upwork',
            'access_token' => 'active_oauth_token',
            'is_active' => true,
        ]);

        $status = $this->service->connectionStatus();

        $this->assertFalse($status['connected']);
        $this->assertEquals('pending', $status['status']);
        $this->assertNull($status['accountName']);
        $this->assertNull($status['role']);
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

    public function test_minimal_read_only_allowlist_permits_phase_2a_actions_and_blocks_disallowed_actions(): void
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('assertReadOnlyTool');
        $method->setAccessible(true);

        // Allowed Phase 2A tool/action combinations (no exception thrown)
        $allowed = [
            ['list_accounts', []],
            ['get_profile', ['action' => 'get']],
            ['get_profile', ['action' => 'list_highlights']],
            ['get_profile', ['action' => 'connects_balance']],
            ['find_jobs', ['action' => 'search']],
            ['find_jobs', ['action' => 'smart_search']],
            ['find_jobs', ['action' => 'get']],
            ['list_freelancer_proposals', ['action' => 'list']],
            ['list_freelancer_proposals', ['action' => 'invitations']],
            ['get_tool_help', []],
            // Also test upwork__ prefixed names
            ['upwork__find_jobs', ['action' => 'search']],
        ];

        foreach ($allowed as [$tool, $args]) {
            try {
                $method->invoke($this->service, $tool, $args);
                $this->assertTrue(true);
            } catch (Exception $e) {
                $this->fail("Allowed tool [{$tool}] with action [" . ($args['action'] ?? '') . "] threw unexpected exception: " . $e->getMessage());
            }
        }

        // Removed/disallowed actions must throw Security Exception
        $disallowed = [
            ['get_profile', ['action' => 'transactions']],
            ['list_freelancer_proposals', ['action' => 'get_room']],
            ['list_freelancer_proposals', ['action' => 'get']],
            ['find_jobs', ['action' => 'delete']],
            ['manage_proposals', ['action' => 'submit']],
            ['confirm_preview', []],
            ['submit_milestones', []],
        ];

        foreach ($disallowed as [$tool, $args]) {
            try {
                $method->invoke($this->service, $tool, $args);
                $this->fail("Disallowed tool/action [{$tool}] was not blocked by assertReadOnlyTool.");
            } catch (Exception $e) {
                $this->assertStringContainsString('Security Exception', $e->getMessage());
            }
        }
    }
}
