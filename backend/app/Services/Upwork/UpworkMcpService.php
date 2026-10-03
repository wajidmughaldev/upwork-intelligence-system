<?php

declare(strict_types=1);

namespace App\Services\Upwork;

use App\Models\UpworkConnection;
use Exception;
use Illuminate\Support\Facades\Log;
use Laravel\Mcp\Client\Schema\ToolResult;
use Laravel\Mcp\Facades\Mcp;

class UpworkMcpService
{
    /**
     * Get safe frontend connection status.
     * Never exposes access tokens, refresh tokens, org_uid, or internal MCP identifiers.
     *
     * @return array{connected: bool, accountName: string|null, role: string|null}
     */
    public function connectionStatus(): array
    {
        $connection = UpworkConnection::active();

        if (! $connection || empty($connection->access_token)) {
            return [
                'connected' => false,
                'accountName' => null,
                'role' => null,
            ];
        }

        return [
            'connected' => true,
            'accountName' => $connection->account_name ?? 'Freelancer Account',
            'role' => $connection->account_role ?? 'Freelancer',
        ];
    }

    /**
     * Call list_accounts and find the TALENT account.
     *
     * @return array<string, mixed>
     */
    public function accounts(): array
    {
        $this->ensureConnected();

        $result = $this->callTool('list_accounts', []);

        return $result;
    }

    /**
     * Call get_profile action=get.
     *
     * @return array<string, mixed>
     */
    public function profile(): array
    {
        $this->ensureConnected();
        $orgUid = $this->resolveTalentOrgUid();

        return $this->callTool('get_profile', [
            'action' => 'get',
            'org_uid' => $orgUid,
            'params' => (object) [],
        ]);
    }

    /**
     * Call get_profile action=list_highlights (portfolio/certificates).
     *
     * @return array<string, mixed>
     */
    public function portfolioHighlights(): array
    {
        $this->ensureConnected();
        $orgUid = $this->resolveTalentOrgUid();

        return $this->callTool('get_profile', [
            'action' => 'list_highlights',
            'org_uid' => $orgUid,
            'params' => (object) [],
        ]);
    }

    /**
     * Call get_profile action=connects_balance.
     *
     * @return array<string, mixed>
     */
    public function connectsBalance(): array
    {
        $this->ensureConnected();
        $orgUid = $this->resolveTalentOrgUid();

        return $this->callTool('get_profile', [
            'action' => 'connects_balance',
            'org_uid' => $orgUid,
            'params' => (object) [],
        ]);
    }

    /**
     * Call find_jobs action=search with small controlled query.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function searchJobs(array $filters = []): array
    {
        $this->ensureConnected();
        $orgUid = $this->resolveTalentOrgUid();

        $params = array_filter([
            'query' => $filters['query'] ?? 'Laravel React',
            'skills' => isset($filters['skills']) ? (array) $filters['skills'] : null,
            'category' => $filters['category'] ?? null,
            'job_type' => $filters['job_type'] ?? null,
            'budget_min' => isset($filters['budget_min']) ? (float) $filters['budget_min'] : null,
            'budget_max' => isset($filters['budget_max']) ? (float) $filters['budget_max'] : null,
            'rate_min' => isset($filters['rate_min']) ? (float) $filters['rate_min'] : null,
            'rate_max' => isset($filters['rate_max']) ? (float) $filters['rate_max'] : null,
            'limit' => isset($filters['limit']) ? min(10, max(1, (int) $filters['limit'])) : 10,
            'include_full_details' => (bool) ($filters['include_full_details'] ?? false),
        ], fn ($val) => $val !== null);

        $response = $this->callTool('find_jobs', [
            'action' => 'search',
            'org_uid' => $orgUid,
            'params' => (object) $params,
        ]);

        return $this->normalizeJobIdentifiers($response);
    }

    /**
     * Call find_jobs action=smart_search for authenticated freelancer.
     *
     * @param  array<string, mixed>  $options
     * @return array<string, mixed>
     */
    public function recommendedJobs(array $options = []): array
    {
        $this->ensureConnected();
        $orgUid = $this->resolveTalentOrgUid();

        $params = array_filter([
            'mode' => $options['mode'] ?? 'best_match',
            'limit' => isset($options['limit']) ? min(10, max(1, (int) $options['limit'])) : 10,
        ], fn ($val) => $val !== null);

        $response = $this->callTool('find_jobs', [
            'action' => 'smart_search',
            'org_uid' => $orgUid,
            'params' => (object) $params,
        ]);

        return $this->normalizeJobIdentifiers($response);
    }

    /**
     * Call find_jobs action=get for ONE returned job.
     * Supports both numeric job ID and ~02... ciphertext reference.
     *
     * @param  string  $jobReference
     * @return array<string, mixed>
     */
    public function jobDetails(string $jobReference): array
    {
        $this->ensureConnected();
        $orgUid = $this->resolveTalentOrgUid();

        $response = $this->callTool('find_jobs', [
            'action' => 'get',
            'org_uid' => $orgUid,
            'params' => [
                'id' => $jobReference,
            ],
        ]);

        return $this->normalizeJobIdentifiers($response);
    }

    /**
     * Call list_freelancer_proposals action=list.
     *
     * @return array<string, mixed>
     */
    public function proposals(): array
    {
        $this->ensureConnected();
        $orgUid = $this->resolveTalentOrgUid();

        return $this->callTool('list_freelancer_proposals', [
            'action' => 'list',
            'org_uid' => $orgUid,
            'params' => (object) [],
        ]);
    }

    /**
     * Call list_freelancer_proposals action=invitations.
     *
     * @return array<string, mixed>
     */
    public function invitations(): array
    {
        $this->ensureConnected();
        $orgUid = $this->resolveTalentOrgUid();

        return $this->callTool('list_freelancer_proposals', [
            'action' => 'invitations',
            'org_uid' => $orgUid,
            'params' => (object) [],
        ]);
    }

    /**
     * Inspect live tool help schema without executing writes.
     *
     * @param  string  $toolName
     * @return array<string, mixed>
     */
    public function getToolHelp(string $toolName): array
    {
        return $this->callTool('get_tool_help', [
            'tool_name' => $toolName,
        ]);
    }

    /**
     * Synchronize and cache account metadata (org_uid, account_name, role) after OAuth.
     */
    public function syncAccountMetadata(): ?UpworkConnection
    {
        $connection = UpworkConnection::active();
        if (! $connection) {
            return null;
        }

        try {
            $accountsPayload = $this->accounts();
            $accounts = $accountsPayload['accounts'] ?? $accountsPayload['data'] ?? $accountsPayload;

            if (is_array($accounts)) {
                $talentAccount = null;

                foreach ($accounts as $acc) {
                    $type = strtoupper((string) ($acc['type'] ?? $acc['account_type'] ?? $acc['role'] ?? ''));
                    if (str_contains($type, 'TALENT') || str_contains($type, 'FREELANCER')) {
                        $talentAccount = $acc;
                        break;
                    }
                }

                // If not explicitly marked TALENT, check first account
                $selected = $talentAccount ?? ($accounts[0] ?? null);

                if (is_array($selected)) {
                    $connection->org_uid = (string) ($selected['org_uid'] ?? $selected['id'] ?? $selected['organization_id'] ?? '');
                    $connection->account_name = (string) ($selected['name'] ?? $selected['company_name'] ?? $selected['user_name'] ?? 'Freelancer');
                    $connection->account_role = 'Freelancer';
                    $connection->raw_metadata = $selected;
                    $connection->save();
                }
            }
        } catch (Exception $e) {
            Log::warning('Upwork initial account sync skipped or failed', [
                'message' => $e->getMessage(),
            ]);
        }

        return $connection;
    }

    /**
     * Resolve the TALENT org_uid, fetching and saving if not already present.
     */
    protected function resolveTalentOrgUid(): string
    {
        $connection = UpworkConnection::active();
        if ($connection && ! empty($connection->org_uid)) {
            return $connection->org_uid;
        }

        $this->syncAccountMetadata();
        $refreshed = UpworkConnection::active();

        if ($refreshed && ! empty($refreshed->org_uid)) {
            return $refreshed->org_uid;
        }

        throw new Exception('No eligible Upwork TALENT / Freelancer account found for authenticated user.');
    }

    /**
     * Ensure active connection exists.
     */
    protected function ensureConnected(): void
    {
        $connection = UpworkConnection::active();
        if (! $connection || empty($connection->access_token)) {
            throw new Exception('Upwork MCP is not connected. Please authenticate first via /oauth/upwork/connect.');
        }
    }

    /**
     * Low-level MCP tool executor with strict read-only safety guard.
     *
     * @param  string  $tool
     * @param  array<string, mixed>  $arguments
     * @return array<string, mixed>
     */
    protected function callTool(string $tool, array $arguments = []): array
    {
        $this->assertReadOnlyTool($tool, $arguments);

        try {
            $client = Mcp::client('upwork');
            $result = $client->callTool($tool, $arguments);

            if ($result->isError) {
                $errorMsg = $result->text();
                Log::warning('Upwork MCP Tool execution returned isError=true', [
                    'tool' => $tool,
                    'action' => $arguments['action'] ?? null,
                    'error' => $errorMsg,
                ]);

                throw new Exception("Upwork MCP Tool Error [{$tool}]: {$errorMsg}");
            }

            return $this->parseResultPayload($result);
        } catch (Exception $e) {
            // Re-throw if already formatted
            if (str_starts_with($e->getMessage(), 'Security Exception:') || str_starts_with($e->getMessage(), 'Upwork MCP Tool Error')) {
                throw $e;
            }

            Log::error('Upwork MCP transport or communication failure', [
                'tool' => $tool,
                'action' => $arguments['action'] ?? null,
                'message' => $e->getMessage(),
            ]);

            throw new Exception("Upwork MCP Communication Failure [{$tool}]: " . $e->getMessage(), 0, $e);
        }
    }

    /**
     * SAFETY GUARD: Enforce strictly read-only tools and actions.
     *
     * @param  string  $tool
     * @param  array<string, mixed>  $arguments
     */
    protected function assertReadOnlyTool(string $tool, array $arguments): void
    {
        $allowedTools = [
            'list_accounts',
            'get_profile',
            'find_jobs',
            'list_freelancer_proposals',
            'get_tool_help',
        ];

        if (! in_array($tool, $allowedTools, true)) {
            throw new Exception("Security Exception: Tool [{$tool}] is blocked in Phase 2A (Strictly Read-Only Mode).");
        }

        // Action-specific read-only constraints
        $action = $arguments['action'] ?? null;

        if ($tool === 'get_profile' && ! in_array($action, ['get', 'list_highlights', 'connects_balance', 'transactions'], true)) {
            throw new Exception("Security Exception: get_profile action [{$action}] is not permitted.");
        }

        if ($tool === 'find_jobs' && ! in_array($action, ['search', 'get', 'smart_search'], true)) {
            throw new Exception("Security Exception: find_jobs action [{$action}] is not permitted.");
        }

        if ($tool === 'list_freelancer_proposals' && ! in_array($action, ['list', 'invitations', 'get', 'get_room'], true)) {
            throw new Exception("Security Exception: list_freelancer_proposals action [{$action}] is not permitted.");
        }
    }

    /**
     * Parse ToolResult into array structure.
     *
     * @param  ToolResult  $result
     * @return array<string, mixed>
     */
    protected function parseResultPayload(ToolResult $result): array
    {
        if (is_array($result->structuredContent) && ! empty($result->structuredContent)) {
            return $result->structuredContent;
        }

        $text = $result->text();
        if (empty($text)) {
            return [];
        }

        $decoded = json_decode($text, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        return ['raw_text' => $text];
    }

    /**
     * Upwork Identifier Rule: Preserve both ~02... ciphertext and numeric ID when returned.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    protected function normalizeJobIdentifiers(array $payload): array
    {
        $normalizeItem = function (&$item) {
            if (! is_array($item)) {
                return;
            }

            $id1 = $item['id'] ?? null;
            $id2 = $item['numeric_id'] ?? $item['job_id'] ?? null;
            $cipher = $item['ciphertext'] ?? $item['job_reference'] ?? $item['reference'] ?? null;

            $candidates = array_filter([$id1, $id2, $cipher], fn ($v) => is_string($v) && ! empty($v));

            $foundCipher = null;
            $foundNumeric = null;

            foreach ($candidates as $val) {
                if (str_starts_with($val, '~02')) {
                    $foundCipher ??= $val;
                } elseif (ctype_digit($val) || is_numeric($val)) {
                    $foundNumeric ??= (string) $val;
                }
            }

            $item['ciphertext'] = $foundCipher ?? $cipher;
            $item['numeric_id'] = $foundNumeric;
        };

        if (isset($payload['jobs']) && is_array($payload['jobs'])) {
            foreach ($payload['jobs'] as &$job) {
                $normalizeItem($job);
            }
        } elseif (isset($payload['results']) && is_array($payload['results'])) {
            foreach ($payload['results'] as &$job) {
                $normalizeItem($job);
            }
        } else {
            $normalizeItem($payload);
        }

        return $payload;
    }
}
