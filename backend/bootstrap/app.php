<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(function (ConnectionException $e, Request $request) {
            if (! $request->is('mcp/oauth/upwork/callback')) {
                return null;
            }

            Log::warning('Upwork OAuth token exchange connection failure', [
                'message' => $e->getMessage(),
            ]);

            $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000'));
            if (! is_string($frontendUrl) || $frontendUrl === '') {
                $frontendUrl = 'http://localhost:3000';
            }

            $separator = str_contains($frontendUrl, '?') ? '&' : '?';

            return redirect($frontendUrl . $separator . 'upwork_error=oauth_callback_failed');
        });
    })->create();
