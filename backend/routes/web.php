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

// Register official Laravel MCP OAuth routes for Upwork
Mcp::oAuthRoutesFor('upwork', [UpworkOAuthController::class, 'handleCallback']);

// Convenience OAuth initiate and disconnect routes
Route::get('/oauth/upwork/connect', [UpworkOAuthController::class, 'connect'])->name('upwork.oauth.connect');
Route::get('/oauth/upwork/disconnect', [UpworkOAuthController::class, 'disconnect'])->name('upwork.oauth.disconnect');
