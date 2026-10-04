<?php

declare(strict_types=1);

use App\Models\UpworkConnection;
use Illuminate\Support\Facades\Http;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$connection = UpworkConnection::active();
$token = $connection->access_token;

// Step 1: initialize
$initResponse = Http::withToken($token)
    ->withHeaders([
        'Accept' => 'application/json, text/event-stream',
        'MCP-Protocol-Version' => '2025-06-18',
    ])
    ->post('https://mcp.upwork.com/mcp', [
        'jsonrpc' => '2.0',
        'id' => 1,
        'method' => 'initialize',
        'params' => [
            'protocolVersion' => '2025-06-18',
            'capabilities' => (object) [],
            'clientInfo' => ['name' => 'laravel-mcp', 'version' => '1.0.0'],
        ],
    ]);

$sessionId = $initResponse->header('Mcp-Session-Id');

// Step 2: send notifications/initialized
Http::withToken($token)
    ->withHeaders([
        'Accept' => 'application/json, text/event-stream',
        'MCP-Protocol-Version' => '2025-06-18',
        'Mcp-Session-Id' => $sessionId,
    ])
    ->post('https://mcp.upwork.com/mcp', [
        'jsonrpc' => '2.0',
        'method' => 'notifications/initialized',
    ]);

// Step 3: call upwork__list_accounts
$callResponse = Http::withToken($token)
    ->withHeaders([
        'Accept' => 'application/json, text/event-stream',
        'MCP-Protocol-Version' => '2025-06-18',
        'Mcp-Session-Id' => $sessionId,
    ])
    ->post('https://mcp.upwork.com/mcp', [
        'jsonrpc' => '2.0',
        'id' => 2,
        'method' => 'tools/call',
        'params' => [
            'name' => 'upwork__list_accounts',
            'arguments' => (object) [],
        ],
    ]);

echo "CALL STATUS: ".$callResponse->status()."\n";
echo "BODY:\n".$callResponse->body()."\n";
