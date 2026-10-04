<?php

declare(strict_types=1);

use App\Models\UpworkConnection;
use App\Services\Upwork\Mappers\UpworkResponseMapper;
use App\Services\Upwork\UpworkMcpService;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== UPWORK MCP PHASE 2A LIVE READ-ONLY SMOKE TEST ===\n\n";

$service = app(UpworkMcpService::class);
$connection = UpworkConnection::active();

if (! $connection || empty($connection->access_token)) {
    echo "ERROR: No active connection found.\n";
    exit(1);
}

$results = [
    'account_discovery' => 'FAIL',
    'talent_account_selection' => 'FAIL',
    'profile_read' => 'FAIL',
    'highlights_read' => 'FAIL',
    'connects_read' => 'FAIL',
    'smart_search' => 'FAIL',
    'smart_search_count' => 0,
    'keyword_search' => 'FAIL',
    'keyword_search_count' => 0,
    'job_detail_read' => 'FAIL',
    'proposals_list' => 'FAIL',
    'proposals_count' => 0,
    'invitations_list' => 'FAIL',
    'invitations_count' => 0,
];

// Step 1: list_accounts & TALENT account selection
try {
    echo "[1/9] Testing list_accounts and account sync...\n";
    $syncResult = $service->syncAccountMetadata();
    $results['account_discovery'] = 'PASS';
    $results['talent_account_selection'] = strtoupper($syncResult['status'] ?? 'PASS');
    echo "  -> Sync Result: Status={$syncResult['status']}, AccountRole={$syncResult['role']}\n";
} catch (\App\Exceptions\AccountSelectionRequiredException $e) {
    $results['account_discovery'] = 'PASS';
    $results['talent_account_selection'] = 'SELECTION_REQUIRED';
    echo "  -> MULTIPLE TALENT ACCOUNTS DETECTED. Candidate count: ".count($e->candidateAccounts)."\n";
    echo "  -> Account selection is required before proceeding.\n";
    print_r($results);
    exit(0);
} catch (Exception $e) {
    echo "  -> Account discovery error: ".$e->getMessage()."\n";
}

// Reload connection after sync
$connection = UpworkConnection::active();
if (! $connection || $connection->account_status !== 'selected') {
    echo "  -> Account status is not 'selected'. Cannot proceed with org-scoped read tests.\n";
    print_r($results);
    exit(0);
}

// Step 2: get_profile action=get
try {
    echo "[2/9] Testing get_profile action=get...\n";
    $profileRaw = $service->profile();
    $mappedProfile = UpworkResponseMapper::mapProfile($profileRaw);
    if (! empty($mappedProfile['title'])) {
        $results['profile_read'] = 'PASS';
        echo "  -> Profile read success! Title: [{$mappedProfile['title']}], HourlyRate: [{$mappedProfile['hourlyRate']}]\n";
    }
} catch (Exception $e) {
    echo "  -> Profile read error: ".$e->getMessage()."\n";
}

// Step 3: get_profile action=list_highlights
try {
    echo "[3/9] Testing get_profile action=list_highlights...\n";
    $highlightsRaw = $service->portfolioHighlights();
    $mappedProfile = UpworkResponseMapper::mapProfile([], $highlightsRaw, []);
    $results['highlights_read'] = 'PASS';
    echo "  -> Portfolio highlights read success! Items: ".count($mappedProfile['portfolioHighlights'])."\n";
} catch (Exception $e) {
    echo "  -> Highlights read error: ".$e->getMessage()."\n";
}

// Step 4: get_profile action=connects_balance
try {
    echo "[4/9] Testing get_profile action=connects_balance...\n";
    $connectsRaw = $service->connectsBalance();
    $mappedConnects = UpworkResponseMapper::mapConnects($connectsRaw);
    $results['connects_read'] = 'PASS';
    echo "  -> Connects balance read success! Available: {$mappedConnects['available']}\n";
} catch (Exception $e) {
    echo "  -> Connects read error: ".$e->getMessage()."\n";
}

// Step 5: find_jobs action=smart_search
try {
    echo "[5/9] Testing find_jobs action=smart_search (limit=5)...\n";
    $smartRaw = $service->recommendedJobs(['limit' => 5]);
    $mappedSmart = UpworkResponseMapper::mapJobSearchResults($smartRaw);
    $results['smart_search'] = 'PASS';
    $results['smart_search_count'] = count($mappedSmart['jobs']);
    echo "  -> Smart search success! Returned: ".count($mappedSmart['jobs'])." jobs.\n";
} catch (Exception $e) {
    echo "  -> Smart search error: ".$e->getMessage()."\n";
}

// Step 6: find_jobs action=search (Laravel React)
$foundJobReference = null;
try {
    echo "[6/9] Testing find_jobs action=search (query='Laravel React', limit=5)...\n";
    $searchRaw = $service->searchJobs(['query' => 'Laravel React', 'limit' => 5]);
    $mappedSearch = UpworkResponseMapper::mapJobSearchResults($searchRaw);
    $results['keyword_search'] = 'PASS';
    $results['keyword_search_count'] = count($mappedSearch['jobs']);
    echo "  -> Keyword search success! Returned: ".count($mappedSearch['jobs'])." jobs.\n";

    if (! empty($mappedSearch['jobs'][0]['reference'])) {
        $foundJobReference = $mappedSearch['jobs'][0]['reference'];
    }
} catch (Exception $e) {
    echo "  -> Keyword search error: ".$e->getMessage()."\n";
}

// Step 7: find_jobs action=get for ONE job
if ($foundJobReference) {
    try {
        echo "[7/9] Testing find_jobs action=get for reference [{$foundJobReference}]...\n";
        $jobDetailRaw = $service->jobDetails($foundJobReference);
        $mappedDetail = UpworkResponseMapper::mapJobDetail($jobDetailRaw);
        if (! empty($mappedDetail['title'])) {
            $results['job_detail_read'] = 'PASS';
            echo "  -> Job detail read success! Title: [{$mappedDetail['title']}], JobType: [{$mappedDetail['jobType']}], ConnectsReq: [{$mappedDetail['connectsRequired']}]\n";
        }
    } catch (Exception $e) {
        echo "  -> Job detail read error: ".$e->getMessage()."\n";
    }
} else {
    echo "[7/9] Skipping job details read (no job reference returned from search).\n";
}

// Step 8: list_freelancer_proposals action=list
try {
    echo "[8/9] Testing list_freelancer_proposals action=list...\n";
    $proposalsRaw = $service->proposals();
    $mappedProposals = UpworkResponseMapper::mapProposals($proposalsRaw);
    $results['proposals_list'] = 'PASS';
    $results['proposals_count'] = count($mappedProposals);
    echo "  -> Proposals list read success! Count: ".count($mappedProposals)."\n";
} catch (Exception $e) {
    echo "  -> Proposals read error: ".$e->getMessage()."\n";
}

// Step 9: list_freelancer_proposals action=invitations
try {
    echo "[9/9] Testing list_freelancer_proposals action=invitations...\n";
    $invitationsRaw = $service->invitations();
    $mappedInvitations = UpworkResponseMapper::mapInvitations($invitationsRaw);
    $results['invitations_list'] = 'PASS';
    $results['invitations_count'] = count($mappedInvitations);
    echo "  -> Invitations list read success! Count: ".count($mappedInvitations)."\n";
} catch (Exception $e) {
    echo "  -> Invitations read error: ".$e->getMessage()."\n";
}

echo "\n=== SMOKE TEST SUMMARY RESULTS ===\n";
print_r($results);
