<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Upwork\UpworkMcpService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UpworkApiController extends Controller
{
    public function __construct(
        protected UpworkMcpService $upworkService
    ) {}

    /**
     * GET /api/upwork/status
     * Returns only safe frontend information.
     */
    public function status(): JsonResponse
    {
        return response()->json($this->upworkService->connectionStatus());
    }

    /**
     * GET /api/upwork/profile
     * Read-only freelancer profile and signals.
     */
    public function profile(): JsonResponse
    {
        try {
            $profile = $this->upworkService->profile();
            return response()->json([
                'success' => true,
                'data' => $profile,
            ]);
        } catch (Exception $e) {
            return $this->errorResponse($e, 'Failed to fetch Upwork profile');
        }
    }

    /**
     * GET /api/upwork/connects
     * Read-only connects balance.
     */
    public function connects(): JsonResponse
    {
        try {
            $connects = $this->upworkService->connectsBalance();
            return response()->json([
                'success' => true,
                'data' => $connects,
            ]);
        } catch (Exception $e) {
            return $this->errorResponse($e, 'Failed to fetch Connects balance');
        }
    }

    /**
     * GET /api/upwork/jobs/recommended
     * Read-only job recommendations (smart_search).
     */
    public function recommendedJobs(Request $request): JsonResponse
    {
        try {
            $options = $request->only(['mode', 'limit']);
            $jobs = $this->upworkService->recommendedJobs($options);

            return response()->json([
                'success' => true,
                'data' => $jobs,
            ]);
        } catch (Exception $e) {
            return $this->errorResponse($e, 'Failed to fetch recommended jobs');
        }
    }

    /**
     * GET /api/upwork/jobs/search
     * Controlled keyword search.
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

            return response()->json([
                'success' => true,
                'data' => $results,
            ]);
        } catch (Exception $e) {
            return $this->errorResponse($e, 'Failed to perform job search');
        }
    }

    /**
     * GET /api/upwork/jobs/{reference}
     * Retrieve single job details by numeric ID or ~02... ciphertext.
     */
    public function jobDetails(string $reference): JsonResponse
    {
        try {
            $job = $this->upworkService->jobDetails($reference);

            return response()->json([
                'success' => true,
                'data' => $job,
            ]);
        } catch (Exception $e) {
            return $this->errorResponse($e, 'Failed to fetch job details');
        }
    }

    /**
     * GET /api/upwork/proposals
     * Read-only list of submitted proposals.
     */
    public function proposals(): JsonResponse
    {
        try {
            $proposals = $this->upworkService->proposals();

            return response()->json([
                'success' => true,
                'data' => $proposals,
            ]);
        } catch (Exception $e) {
            return $this->errorResponse($e, 'Failed to fetch proposals');
        }
    }

    /**
     * GET /api/upwork/invitations
     * Read-only list of received invitations.
     */
    public function invitations(): JsonResponse
    {
        try {
            $invitations = $this->upworkService->invitations();

            return response()->json([
                'success' => true,
                'data' => $invitations,
            ]);
        } catch (Exception $e) {
            return $this->errorResponse($e, 'Failed to fetch invitations');
        }
    }

    /**
     * Helper to format standardized error response without leaking tokens or private IDs.
     */
    protected function errorResponse(Exception $e, string $fallback): JsonResponse
    {
        Log::warning($fallback, ['error' => $e->getMessage()]);

        return response()->json([
            'success' => false,
            'message' => $e->getMessage() ?: $fallback,
        ], 400);
    }
}
