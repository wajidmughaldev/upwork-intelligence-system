<?php

use App\Http\Controllers\UpworkOAuthController;
use Illuminate\Support\Facades\Route;
use Laravel\Mcp\Facades\Mcp;

Route::get('/', function () {
    return response()->json([
        'service' => 'Upwork Opportunity Intelligence Backend',
        'status' => 'online',
        'laravel_version' => app()->version(),
    ]);
});

// Register official Laravel MCP OAuth routes for Upwork callback and client metadata
Mcp::oAuthRoutesFor('upwork', [UpworkOAuthController::class, 'handleCallback']);

// Authenticated application OAuth connect initiation route
Route::get('/oauth/upwork/connect', [UpworkOAuthController::class, 'connect'])
    ->middleware('auth:sanctum')
    ->name('upwork.oauth.connect');
