<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Exceptions\AccountSelectionRequiredException;
use App\Exceptions\NoEligibleAccountException;
use App\Models\UpworkConnection;
use App\Services\Upwork\UpworkMcpService;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Laravel\Mcp\Client\OAuth\OAuthRouteRegistrar;
use Laravel\Mcp\Client\OAuth\TokenSet;
use Laravel\Mcp\Facades\Mcp;

class UpworkOAuthController extends Controller
{
    public function __construct(
        protected UpworkMcpService $upworkService
    ) {}

    /**
     * Start the Upwork OAuth 2.1 flow with PKCE.
     * Requires application-user authentication and validates return_to.
     */
    public function connect(Request $request): RedirectResponse
    {
        $safeReturnTo = $this->sanitizeReturnTo($request->query('return_to'));

        try {
            /** @var \Laravel\Mcp\WebClient $client */
            $client = Mcp::client('upwork');

            return $client->oAuthClient()->redirect(
                returnTo: $safeReturnTo
            );
        } catch (Exception $e) {
            Log::error('Failed to initiate Upwork OAuth flow', [
                'error' => $e->getMessage(),
            ]);

            $separator = str_contains($safeReturnTo, '?') ? '&' : '?';

            return redirect($safeReturnTo . $separator . 'upwork_error=' . urlencode($e->getMessage()));
        }
    }

    /**
     * Handle OAuth callback from Upwork MCP server.
     * Registered unauthenticated for provider callback, but binds connection server-side.
     */
    public function handleCallback(
        string $provider,
        string $client,
        TokenSet $token,
        ?string $returnTo = null
    ): RedirectResponse {
        $safeReturnTo = $this->sanitizeReturnTo($returnTo);

        try {
            $clientId = null;
            try {
                $clientId = OAuthRouteRegistrar::url("mcp.oauth.{$client}.client-metadata");
            } catch (Exception) {
                $clientId = url("mcp/oauth/{$client}/client-metadata.json");
            }

            // Save encrypted token set server-side
            UpworkConnection::updateOrCreate(
                ['provider' => 'upwork'],
                [
                    'client_id' => $clientId,
                    'access_token' => $token->accessToken,
                    'refresh_token' => $token->refreshToken,
                    'token_type' => $token->tokenType,
                    'scope' => $token->scope,
                    'expires_at' => $token->expiresAt ? Carbon::createFromTimestamp($token->expiresAt) : null,
                    'is_active' => true,
                ]
            );

            // Sync account info immediately via list_accounts
            try {
                $this->upworkService->syncAccountMetadata();
            } catch (AccountSelectionRequiredException) {
                $separator = str_contains($safeReturnTo, '?') ? '&' : '?';

                return redirect($safeReturnTo . $separator . 'upwork_account_selection=1');
            } catch (NoEligibleAccountException) {
                $separator = str_contains($safeReturnTo, '?') ? '&' : '?';

                return redirect($safeReturnTo . $separator . 'upwork_error=no_eligible_account');
            }

            $separator = str_contains($safeReturnTo, '?') ? '&' : '?';

            return redirect($safeReturnTo . $separator . 'upwork_connected=1');
        } catch (Exception $e) {
            Log::error('Error processing Upwork OAuth callback', [
                'error' => $e->getMessage(),
            ]);

            $separator = str_contains($safeReturnTo, '?') ? '&' : '?';

            return redirect($safeReturnTo . $separator . 'upwork_error=' . urlencode('Failed to store connection'));
        }
    }

    /**
     * Disconnect active Upwork account.
     * State-changing action requiring POST and auth middleware.
     */
    public function disconnect(Request $request): mixed
    {
        $connection = UpworkConnection::active();
        if ($connection) {
            $connection->update([
                'is_active' => false,
                'access_token' => '',
                'refresh_token' => null,
            ]);
        }

        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'connected' => false,
                'message' => 'Upwork account disconnected successfully.',
            ]);
        }

        $safeReturnTo = $this->sanitizeReturnTo($request->query('return_to'));
        $separator = str_contains($safeReturnTo, '?') ? '&' : '?';

        return redirect($safeReturnTo . $separator . 'upwork_disconnected=1');
    }

    /**
     * Strict allowlist validation for return_to parameter to prevent open redirect vulnerabilities.
     */
    public function sanitizeReturnTo(?string $returnTo): string
    {
        $defaultFrontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000'));
        if (! is_string($defaultFrontendUrl) || empty($defaultFrontendUrl)) {
            $defaultFrontendUrl = 'http://localhost:3000';
        }

        if (empty($returnTo)) {
            return $defaultFrontendUrl;
        }

        // Reject dangerous schemes or protocol-relative URLs
        if (str_starts_with($returnTo, '//') || str_contains(strtolower($returnTo), 'javascript:') || str_contains(strtolower($returnTo), 'data:')) {
            return $defaultFrontendUrl;
        }

        // Relative path starting with '/' -> prepend frontend URL origin
        if (str_starts_with($returnTo, '/')) {
            return rtrim($defaultFrontendUrl, '/') . $returnTo;
        }

        // Parse full target URL
        $parsedTarget = parse_url($returnTo);
        $parsedFrontend = parse_url($defaultFrontendUrl);

        if (! is_array($parsedTarget) || empty($parsedTarget['host'])) {
            return $defaultFrontendUrl;
        }

        $targetHost = strtolower($parsedTarget['host']);
        $targetScheme = strtolower($parsedTarget['scheme'] ?? 'http');
        $targetPort = $parsedTarget['port'] ?? null;

        $allowedHost = strtolower($parsedFrontend['host'] ?? 'localhost');
        $allowedScheme = strtolower($parsedFrontend['scheme'] ?? 'http');
        $allowedPort = $parsedFrontend['port'] ?? null;

        if ($targetHost === $allowedHost && $targetScheme === $allowedScheme && $targetPort === $allowedPort) {
            return $returnTo;
        }

        return $defaultFrontendUrl;
    }
}
