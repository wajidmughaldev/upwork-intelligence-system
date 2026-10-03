<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\UpworkConnection;
use App\Services\Upwork\UpworkMcpService;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Laravel\Mcp\Client\OAuth\TokenSet;
use Laravel\Mcp\Facades\Mcp;

class UpworkOAuthController extends Controller
{
    public function __construct(
        protected UpworkMcpService $upworkService
    ) {}

    /**
     * Start the Upwork OAuth 2.1 flow with PKCE.
     */
    public function connect(Request $request): RedirectResponse
    {
        try {
            /** @var \Laravel\Mcp\WebClient $client */
            $client = Mcp::client('upwork');

            return $client->oAuthClient()->redirect(
                returnTo: $request->query('return_to', 'http://localhost:3000')
            );
        } catch (Exception $e) {
            Log::error('Failed to initiate Upwork OAuth flow', [
                'error' => $e->getMessage(),
            ]);

            return redirect('http://localhost:3000?upwork_error=' . urlencode($e->getMessage()));
        }
    }

    /**
     * Handle OAuth callback from Upwork MCP server.
     */
    public function handleCallback(
        string $provider,
        string $client,
        TokenSet $token,
        ?string $returnTo = null
    ): RedirectResponse {
        try {
            // Save encrypted token set server-side
            $connection = UpworkConnection::updateOrCreate(
                ['provider' => 'upwork'],
                [
                    'access_token' => $token->accessToken,
                    'refresh_token' => $token->refreshToken,
                    'token_type' => $token->tokenType,
                    'scope' => $token->scope,
                    'expires_at' => $token->expiresAt ? Carbon::createFromTimestamp($token->expiresAt) : null,
                    'is_active' => true,
                ]
            );

            // Sync account info immediately via list_accounts
            $this->upworkService->syncAccountMetadata();

            $targetUrl = $returnTo ?? 'http://localhost:3000';
            $separator = str_contains($targetUrl, '?') ? '&' : '?';

            return redirect($targetUrl . $separator . 'upwork_connected=1');
        } catch (Exception $e) {
            Log::error('Error processing Upwork OAuth callback', [
                'error' => $e->getMessage(),
            ]);

            return redirect('http://localhost:3000?upwork_error=' . urlencode('Failed to store connection'));
        }
    }

    /**
     * Disconnect active Upwork account.
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

        return redirect('http://localhost:3000?upwork_disconnected=1');
    }
}
