<?php

declare(strict_types=1);

use App\Models\UpworkConnection;
use Illuminate\Support\Facades\Http;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

function parseSseJson(string $raw): ?array
{
    foreach (explode("\n", $raw) as $line) {
        $line = trim($line);
        if (str_starts_with($line, 'data:')) {
            $jsonStr = trim(substr($line, 5));
            $decoded = json_decode($jsonStr, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }
    }

    return null;
}

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

// Step 3: tools/list
$toolsResponse = Http::withToken($token)
    ->withHeaders([
        'Accept' => 'application/json, text/event-stream',
        'MCP-Protocol-Version' => '2025-06-18',
        'Mcp-Session-Id' => $sessionId,
    ])
    ->post('https://mcp.upwork.com/mcp', [
        'jsonrpc' => '2.0',
        'id' => 2,
        'method' => 'tools/list',
        'params' => (object) [],
    ]);

$decodedTools = parseSseJson($toolsResponse->body());
$tools = $decodedTools['result']['tools'] ?? [];
echo "FOUND ".count($tools)." LIVE TOOLS ON UPWORK MCP:\n\n";

foreach ($tools as $t) {
    echo "========================================\n";
    echo "TOOL: ".$t['name']."\n";
    echo "DESCRIPTION: ".($t['description'] ?? 'None')."\n";
}
