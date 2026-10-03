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
        Mcp::registerClient('upwork', function () {
            $mcpUrl = config('services.upwork.mcp_url', 'https://mcp.upwork.com/mcp');
            $clientId = config('services.upwork.client_id');
            $clientSecret = config('services.upwork.client_secret');
            $redirectUri = config('services.upwork.redirect_uri') ?: url('mcp/oauth/upwork/callback');

            $client = Client::web($mcpUrl)
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
