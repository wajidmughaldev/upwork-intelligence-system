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

echo "1. Testing initialize...\n";
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

echo "Init Status: ".$initResponse->status()."\n";
$sessionId = $initResponse->header('Mcp-Session-Id');
echo "Session ID: ".($sessionId ?: 'NONE')."\n";

if ($sessionId) {
    echo "\n2. Testing tools/call list_accounts with Mcp-Session-Id...\n";
    $toolResponse = Http::withToken($token)
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
                'name' => 'list_accounts',
                'arguments' => (object) [],
            ],
        ]);

    echo "Tool Call Status: ".$toolResponse->status()."\n";
    echo "Tool Call Body: ".$toolResponse->body()."\n";
}
