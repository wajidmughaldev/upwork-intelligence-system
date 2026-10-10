<?php

declare(strict_types=1);

namespace App\Services\Upwork;

use App\Exceptions\AccountSelectionRequiredException;
use App\Exceptions\NoEligibleAccountException;
use App\Exceptions\ReconnectRequiredException;
use App\Models\UpworkConnection;
use Carbon\Carbon;
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
     * @return array{connected: bool, accountName: string|null, role: string|null, status?: string}
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

        if ($connection->account_status === 'selection_required') {
            return [
                'connected' => false,
                'status' => 'selection_required',
                'accountName' => null,
                'role' => null,
            ];
        }

        if ($connection->account_status === 'no_eligible_account') {
            return [
                'connected' => false,
                'status' => 'no_eligible_account',
                'accountName' => null,
                'role' => null,
            ];
        }

        if ($connection->account_status !== 'selected') {
            return [
                'connected' => false,
                'status' => 'pending',
                'accountName' => null,
                'role' => null,
            ];
        }

        return [
            'connected' => true,
            'accountName' => $connection->account_name,
            'role' => $connection->account_role,
        ];
    }

    /**
     * Ensure active access token is valid and not expired.
     * Automatically refreshes using Laravel MCP OAuthClient if expired or near expiration.
     *
     * @throws ReconnectRequiredException
     */
    public function ensureFreshToken(): UpworkConnection
    {
        $connection = UpworkConnection::active();
        if (! $connection || empty($connection->access_token)) {
            throw new ReconnectRequiredException('Upwork MCP is not connected. Reconnection required.');
        }

        if ($connection->isExpired()) {
            if (empty($connection->refresh_token)) {
                $connection->update(['is_active' => false]);
                throw new ReconnectRequiredException('Upwork access token has expired and no refresh token is present. Reconnection required.');
            }

            try {
                /** @var \Laravel\Mcp\WebClient $webClient */
                $webClient = Mcp::client('upwork');
                $oauthClient = $webClient->oAuthClient();

                // Refresh using stored refresh token and client_id (client metadata document URL)
                $clientId = $connection->client_id;
                if (empty($clientId)) {
                    try {
                        $clientId = \Laravel\Mcp\Client\OAuth\OAuthRouteRegistrar::url('mcp.oauth.upwork.client-metadata');
                    } catch (Exception) {
                        $clientId = url('mcp/oauth/upwork/client-metadata.json');
                    }
                }

                $tokenSet = $oauthClient->refreshCredentials(
                    refreshToken: $connection->refresh_token,
                    clientId: $clientId,
                    clientSecret: null
                );


                $connection->update([
                    'access_token' => $tokenSet->accessToken,
                    'refresh_token' => $tokenSet->refreshToken ?: $connection->refresh_token,
                    'expires_at' => $tokenSet->expiresAt ? Carbon::createFromTimestamp($tokenSet->expiresAt) : null,
                ]);

                // Bind fresh token to active client instance
                $webClient->withToken($tokenSet->accessToken);

                Log::info('Upwork MCP access token refreshed successfully.');
            } catch (Exception $e) {
                Log::warning('Upwork MCP token refresh failed', ['message' => $e->getMessage()]);
                $connection->update(['is_active' => false]);
                throw new ReconnectRequiredException('Upwork token refresh failed. Please reconnect your account.', 0, $e);
            }
        }

        return $connection;
    }

    /**
     * Call list_accounts and discover account options.
     *
     * @return array<string, mixed>
     */
    public function accounts(): array
    {
        $this->ensureFreshToken();

        return $this->callTool('list_accounts', []);
    }

    /**
     * Call get_profile action=get.
     *
     * @return array<string, mixed>
     */
    public function profile(): array
    {
        $this->ensureFreshToken();
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
        $this->ensureFreshToken();
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
        $this->ensureFreshToken();
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
        $this->ensureFreshToken();
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
        $this->ensureFreshToken();
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
        $this->ensureFreshToken();
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
        $this->ensureFreshToken();
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
        $this->ensureFreshToken();
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
     * Synchronize and evaluate account metadata after OAuth.
     * Enforces the three rules:
     * - 0 TALENT accounts: throw NoEligibleAccountException
     * - 1 TALENT account: auto-select
     * - >1 TALENT accounts: throw AccountSelectionRequiredException with safe list
     */
    public function syncAccountMetadata(): array
    {
        $connection = UpworkConnection::active();
        if (! $connection) {
            return ['status' => 'disconnected'];
        }

        $accountsPayload = $this->accounts();
        $accounts = $accountsPayload['accounts'] ?? $accountsPayload['data'] ?? $accountsPayload;

        if (! is_array($accounts)) {
            $accounts = [];
        }

        // Filter strictly for TALENT accounts
        $talentAccounts = [];
        foreach ($accounts as $index => $acc) {
            if (! is_array($acc)) {
                continue;
            }
            $type = strtoupper((string) ($acc['type'] ?? $acc['account_type'] ?? $acc['role'] ?? ''));
            if (str_contains($type, 'TALENT') || str_contains($type, 'FREELANCER')) {
                // Minimum data: keep only the identifier needed for later calls
                // and a display name. The raw MCP payload is discarded.
                $displayName = $acc['name'] ?? $acc['company_name'] ?? $acc['user_name'] ?? null;

                $talentAccounts[] = [
                    'org_uid' => (string) ($acc['org_uid'] ?? $acc['id'] ?? $acc['organization_id'] ?? ''),
                    'name' => is_string($displayName) && $displayName !== '' ? $displayName : null,
                ];
            }
        }

        // Rule A: Zero eligible TALENT accounts
        if (count($talentAccounts) === 0) {
            $connection->update([
                'account_status' => 'no_eligible_account',
                'account_name' => null,
                'account_role' => null,
                'org_uid' => null,
            ]);

            throw new NoEligibleAccountException('No eligible Upwork TALENT (freelancer) account found for this user.');
        }

        // Rule B: Exactly one TALENT account -> automatically select it
        if (count($talentAccounts) === 1) {
            $chosen = $talentAccounts[0];
            $connection->update([
                'org_uid' => $chosen['org_uid'],
                'account_name' => $chosen['name'],
                'account_role' => 'Freelancer',
                'account_status' => 'selected',
                'raw_metadata' => null,
            ]);

            return [
                'status' => 'selected',
                'accountName' => $chosen['name'],
                'role' => 'Freelancer',
            ];
        }

        // Rule C: More than one eligible TALENT account -> selection required
        $safeCandidates = [];
        foreach ($talentAccounts as $idx => $t) {
            $safeCandidates[] = [
                'id' => (string) $idx,
                'name' => $t['name'],
                'role' => 'Freelancer',
            ];
        }

        $connection->update([
            'account_status' => 'selection_required',
            // Task-scoped: candidates are only kept until the user picks one,
            // and never longer than 24 hours.
            'raw_metadata' => [
                'talent_candidates' => $talentAccounts,
                'expires_at' => now()->addHours(24)->toIso8601String(),
            ],
        ]);

        throw new AccountSelectionRequiredException($safeCandidates);
    }

    /**
     * Select a specific TALENT account by safe candidate id/index.
     *
     * @param  string|int  $candidateId
     * @return array{status: string, accountName: string, role: string}
     */
    public function selectTalentAccount(string|int $candidateId): array
    {
        $connection = UpworkConnection::active();
        if (! $connection) {
            throw new ReconnectRequiredException('No active Upwork connection.');
        }

        $metadata = $connection->raw_metadata ?? [];
        $expiresAt = isset($metadata['expires_at']) ? \Carbon\Carbon::parse($metadata['expires_at']) : null;
        if ($expiresAt !== null && $expiresAt->isPast()) {
            $connection->update(['raw_metadata' => null]);
            throw new Exception('Account selection expired. Please reconnect.');
        }

        $candidates = $metadata['talent_candidates'] ?? [];
        $chosen = null;

        foreach ($candidates as $idx => $c) {
            if ((string) $idx === (string) $candidateId) {
                $chosen = $c;
                break;
            }
        }

        if (! $chosen) {
            throw new Exception('Invalid candidate account index specified.');
        }

        $connection->update([
            'org_uid' => $chosen['org_uid'],
            'account_name' => $chosen['name'],
            'account_role' => 'Freelancer',
            'account_status' => 'selected',
            'raw_metadata' => null,
        ]);

        return [
            'status' => 'selected',
            'accountName' => $chosen['name'],
            'role' => 'Freelancer',
        ];
    }

    /**
     * Resolve the TALENT org_uid, fetching and saving if not already present.
     */
    protected function resolveTalentOrgUid(): string
    {
        $connection = UpworkConnection::active();
        if ($connection && ! empty($connection->org_uid) && $connection->account_status === 'selected') {
            return $connection->org_uid;
        }

        $this->syncAccountMetadata();
        $refreshed = UpworkConnection::active();

        if ($refreshed && ! empty($refreshed->org_uid) && $refreshed->account_status === 'selected') {
            return $refreshed->org_uid;
        }

        throw new NoEligibleAccountException('No active Upwork TALENT account selected.');
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
        $connection = $this->ensureFreshToken();

        $mcpToolName = str_starts_with($tool, 'upwork__') ? $tool : "upwork__{$tool}";

        try {
            /** @var \Laravel\Mcp\WebClient $client */
            $client = Mcp::client('upwork');
            if (! empty($connection->access_token)) {
                $client->withToken($connection->access_token);
            }
            $result = $client->callTool($mcpToolName, $arguments);

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
            // Re-throw if already typed or domain exception
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
        $normalizedTool = str_starts_with($tool, 'upwork__') ? substr($tool, 8) : $tool;

        $allowedTools = [
            'list_accounts',
            'get_profile',
            'find_jobs',
            'list_freelancer_proposals',
            'get_tool_help',
        ];

        if (! in_array($normalizedTool, $allowedTools, true)) {
            throw new Exception("Security Exception: Tool [{$tool}] is blocked in Phase 2A (Strictly Read-Only Mode).");
        }

        // Action-specific read-only constraints
        $action = $arguments['action'] ?? null;

        if ($normalizedTool === 'get_profile' && ! in_array($action, ['get', 'list_highlights', 'connects_balance'], true)) {
            throw new Exception("Security Exception: get_profile action [{$action}] is not permitted.");
        }

        if ($normalizedTool === 'find_jobs' && ! in_array($action, ['search', 'get', 'smart_search'], true)) {
            throw new Exception("Security Exception: find_jobs action [{$action}] is not permitted.");
        }

        if ($normalizedTool === 'list_freelancer_proposals' && ! in_array($action, ['list', 'invitations'], true)) {
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
