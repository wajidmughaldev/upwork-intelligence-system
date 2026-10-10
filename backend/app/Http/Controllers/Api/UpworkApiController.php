<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UpworkConnection;
use App\Services\Upwork\Mappers\UpworkResponseMapper;
use App\Services\Upwork\UpworkErrorNormalizer;
use App\Services\Upwork\UpworkMcpService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpworkApiController extends Controller
{
    public function __construct(
        protected UpworkMcpService $upworkService
    ) {}

    /**
     * GET /api/upwork/status
     * Returns only safe frontend information (connected, accountName, role).
     * Never exposes access_token, refresh_token, org_uid, or internal IDs.
     */
    public function status(): JsonResponse
    {
        return response()->json($this->upworkService->connectionStatus());
    }

    /**
     * GET /api/upwork/profile
     * Read-only freelancer profile and signals mapped to safe DTO.
     */
    public function profile(): JsonResponse
    {
        try {
            $profile = $this->upworkService->profile();

            try {
                $highlights = $this->upworkService->portfolioHighlights();
            } catch (Exception) {
                $highlights = [];
            }

            try {
                $connects = $this->upworkService->connectsBalance();
            } catch (Exception) {
                $connects = [];
            }

            $mapped = UpworkResponseMapper::mapProfile($profile, $highlights, $connects);

            return response()->json([
                'success' => true,
                'data' => $mapped,
            ]);
        } catch (Exception $e) {
            return UpworkErrorNormalizer::normalize($e);
        }
    }

    /**
     * GET /api/upwork/connects
     * Read-only connects balance mapped to safe DTO.
     */
    public function connects(): JsonResponse
    {
        try {
            $connects = $this->upworkService->connectsBalance();
            $mapped = UpworkResponseMapper::mapConnects($connects);

            return response()->json([
                'success' => true,
                'data' => $mapped,
            ]);
        } catch (Exception $e) {
            return UpworkErrorNormalizer::normalize($e);
        }
    }

    /**
     * GET /api/upwork/jobs/recommended
     * Read-only job recommendations (smart_search) mapped to safe DTO list.
     */
    public function recommendedJobs(Request $request): JsonResponse
    {
        try {
            $options = $request->only(['mode', 'limit']);
            $jobs = $this->upworkService->recommendedJobs($options);
            $mapped = UpworkResponseMapper::mapJobSearchResults($jobs);

            return response()->json([
                'success' => true,
                'data' => $mapped,
            ]);
        } catch (Exception $e) {
            return UpworkErrorNormalizer::normalize($e);
        }
    }

    /**
     * GET /api/upwork/jobs/search
     * Controlled keyword search mapped to safe DTO list.
     */
    public function searchJobs(Request $request): JsonResponse
    {
        try {
            $filters = $request->only([
                'query',
                'skills',
                'category',
                'job_type',
                'budget_min',
                'budget_max',
                'rate_min',
                'rate_max',
                'limit',
                'include_full_details',
            ]);

            $results = $this->upworkService->searchJobs($filters);
            $mapped = UpworkResponseMapper::mapJobSearchResults($results);

            return response()->json([
                'success' => true,
                'data' => $mapped,
            ]);
        } catch (Exception $e) {
            return UpworkErrorNormalizer::normalize($e);
        }
    }

    /**
     * GET /api/upwork/jobs/{reference}
     * Retrieve single job details mapped to safe DTO.
     */
    public function jobDetails(string $reference): JsonResponse
    {
        try {
            $job = $this->upworkService->jobDetails($reference);
            $mapped = UpworkResponseMapper::mapJobDetail($job);

            return response()->json([
                'success' => true,
                'data' => $mapped,
            ]);
        } catch (Exception $e) {
            return UpworkErrorNormalizer::normalize($e);
        }
    }

    /**
     * GET /api/upwork/proposals
     * Read-only list of submitted proposals mapped to safe DTO list.
     */
    public function proposals(): JsonResponse
    {
        try {
            $proposals = $this->upworkService->proposals();
            $mapped = UpworkResponseMapper::mapProposals($proposals);

            return response()->json([
                'success' => true,
                'data' => $mapped,
            ]);
        } catch (Exception $e) {
            return UpworkErrorNormalizer::normalize($e);
        }
    }

    /**
     * GET /api/upwork/invitations
     * Read-only list of received invitations mapped to safe DTO list.
     */
    public function invitations(): JsonResponse
    {
        try {
            $invitations = $this->upworkService->invitations();
            $mapped = UpworkResponseMapper::mapInvitations($invitations);

            return response()->json([
                'success' => true,
                'data' => $mapped,
            ]);
        } catch (Exception $e) {
            return UpworkErrorNormalizer::normalize($e);
        }
    }

    /**
     * GET /api/upwork/accounts
     * List safe candidate accounts when selection is required.
     */
    public function candidateAccounts(): JsonResponse
    {
        try {
            $connection = UpworkConnection::active();
            if (! $connection) {
                return response()->json([
                    'success' => false,
                    'code' => 'RECONNECT_REQUIRED',
                    'message' => 'No active Upwork connection.',
                ], 401);
            }

            $metadata = $connection->raw_metadata ?? [];
            $expiresAt = isset($metadata['expires_at']) ? \Carbon\Carbon::parse($metadata['expires_at']) : null;

            if ($expiresAt !== null && $expiresAt->isPast()) {
                $connection->update([
                    'raw_metadata' => null,
                    'account_status' => 'selection_expired',
                ]);

                return response()->json([
                    'success' => false,
                    'code' => 'SELECTION_EXPIRED',
                    'message' => 'Account selection expired. Please reconnect.',
                ], 410);
            }

            $candidates = $metadata['talent_candidates'] ?? [];
            $safe = [];
            foreach ($candidates as $idx => $c) {
                $safe[] = [
                    'id' => (string) $idx,
                    'name' => isset($c['name']) && is_string($c['name']) && $c['name'] !== '' ? $c['name'] : null,
                    'role' => isset($c['role']) && is_string($c['role']) && $c['role'] !== '' ? $c['role'] : null,
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $safe,
            ]);
        } catch (Exception $e) {
            return UpworkErrorNormalizer::normalize($e);
        }
    }

    /**
     * POST /api/upwork/accounts/select
     * Select a specific TALENT account by candidate ID.
     */
    public function selectAccount(Request $request): JsonResponse
    {
        $request->validate([
            'accountId' => 'required',
        ]);

        try {
            $result = $this->upworkService->selectTalentAccount($request->input('accountId'));

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (Exception $e) {
            return UpworkErrorNormalizer::normalize($e);
        }
    }
}

