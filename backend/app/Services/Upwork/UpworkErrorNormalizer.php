<?php

declare(strict_types=1);

namespace App\Services\Upwork;

use App\Exceptions\AccountSelectionRequiredException;
use App\Exceptions\NoEligibleAccountException;
use App\Exceptions\ReconnectRequiredException;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class UpworkErrorNormalizer
{
    /**
     * Normalize an exception into a controlled JSON response.
     */
    public static function normalize(Exception $e): JsonResponse
    {
        $rawMessage = $e->getMessage();

        // Extract traceId if present
        $traceId = self::extractTraceId($rawMessage);

        $code = 'UPWORK_COMMUNICATION_ERROR';
        $status = 400;
        $userMessage = 'Failed to communicate with the Upwork MCP server.';
        $extra = [];

        if ($e instanceof ReconnectRequiredException || str_contains(strtolower($rawMessage), 'reconnection required') || str_contains(strtolower($rawMessage), 'not connected')) {
            $code = 'RECONNECT_REQUIRED';
            $status = 401;
            $userMessage = 'Upwork connection is not active or token has expired. Please reconnect.';
        } elseif ($e instanceof AccountSelectionRequiredException) {
            $code = 'ACCOUNT_SELECTION_REQUIRED';
            $status = 200; // Expected interactive state
            $userMessage = 'Multiple eligible TALENT accounts detected. Please select one.';
            $extra['candidateAccounts'] = $e->candidateAccounts;
        } elseif ($e instanceof NoEligibleAccountException || str_contains(strtolower($rawMessage), 'no eligible upwork talent')) {
            $code = 'NO_ELIGIBLE_ACCOUNT';
            $status = 403;
            $userMessage = 'No eligible TALENT (freelancer) account was found for this Upwork login.';
        } elseif (str_contains(strtolower($rawMessage), 'rate limit') || str_contains(strtolower($rawMessage), '429')) {
            $code = 'UPWORK_RATE_LIMITED';
            $status = 429;
            $userMessage = 'Upwork temporarily limited this request. Please try again shortly.';
        } elseif (str_contains(strtolower($rawMessage), 'not found') || str_contains(strtolower($rawMessage), '404')) {
            $code = 'UPWORK_NOT_FOUND';
            $status = 404;
            $userMessage = 'The requested Upwork resource could not be found.';
        } elseif (str_contains(strtolower($rawMessage), 'security exception') || str_contains(strtolower($rawMessage), 'blocked in phase 2a')) {
            $code = 'SECURITY_VIOLATION';
            $status = 403;
            $userMessage = 'The requested operation is blocked in Phase 2A (Strictly Read-Only Mode).';
        } elseif (str_contains(strtolower($rawMessage), 'unauthorized') || str_contains(strtolower($rawMessage), 'permission denied')) {
            $code = 'UPWORK_PERMISSION_DENIED';
            $status = 403;
            $userMessage = 'Permission denied for this Upwork resource.';
        }

        // Diagnostic log without tokens or org_uid
        Log::warning('Normalized Upwork Error Response', [
            'code' => $code,
            'traceId' => $traceId,
            'exception' => get_class($e),
        ]);

        $payload = [
            'success' => false,
            'code' => $code,
            'message' => $userMessage,
        ];

        if ($traceId !== null) {
            $payload['traceId'] = $traceId;
        }

        if (! empty($extra)) {
            $payload = array_merge($payload, $extra);
        }

        return response()->json($payload, $status);
    }

    /**
     * Extract trace ID from error message.
     */
    protected static function extractTraceId(string $text): ?string
    {
        if (preg_match('/(?:trace_id|traceId|ray_id|cf-ray)[:=]\s*([a-zA-Z0-9_\-\.]+)/i', $text, $matches)) {
            return $matches[1];
        }

        return null;
    }
}
