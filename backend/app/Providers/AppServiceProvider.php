<?php

namespace App\Providers;

use App\Models\UpworkConnection;
use Illuminate\Support\ServiceProvider;
use Laravel\Mcp\Client;
use Laravel\Mcp\Facades\Mcp;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (str_starts_with((string) config('app.url'), 'https://')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        Mcp::registerClient('upwork', function () {

            $mcpUrl = config('services.upwork.mcp_url', 'https://mcp.upwork.com/mcp');
            $clientId = config('services.upwork.client_id');
            $clientSecret = config('services.upwork.client_secret');
            $redirectUri = config('services.upwork.redirect_uri') ?: url('mcp/oauth/upwork/callback');

            $client = Client::web($mcpUrl)
                // Upwork's MCP gateway negotiates 2025-06-18 and rejects the
                // newer discovery handshake with HTTP 400, so pin it explicitly.
                ->withProtocolVersion(\Laravel\Mcp\Enums\ProtocolVersion::V2025_06_18)
                ->withOAuth(
                    clientId: $clientId ?: null,
                    clientSecret: $clientSecret ?: null,
                    redirectUri: $redirectUri ?: null,
                );

            $connection = UpworkConnection::active();
            if ($connection && ! empty($connection->access_token)) {
                $client->withToken($connection->access_token);
            }

            return $client;
        });
    }
}
