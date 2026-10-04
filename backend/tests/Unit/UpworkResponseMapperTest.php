<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Services\Upwork\Mappers\UpworkResponseMapper;
use Tests\TestCase;

class UpworkResponseMapperTest extends TestCase
{
    public function test_maps_profile_and_hides_private_identifiers(): void
    {
        $rawProfile = [
            'org_uid' => 'secret_org_uid_should_not_leak',
            'profile' => [
                'title' => 'Senior Full Stack Architect',
                'overview' => 'Expert in Laravel and React.',
                'hourly_rate' => '$95.00',
                'skills' => ['Laravel', 'React', 'TypeScript'],
                'jss' => 100,
                'top_rated' => true,
                'internal_account_id' => '12345678',
            ],
        ];

        $rawHighlights = [
            'highlights' => [
                [
                    'title' => 'Enterprise CRM',
                    'description' => 'Built with Next.js and Laravel',
                    'url' => 'https://example.com/project1',
                ],
            ],
        ];

        $rawConnects = [
            'available' => 140,
            'membership' => 'Freelancer Plus',
        ];

        $mapped = UpworkResponseMapper::mapProfile($rawProfile, $rawHighlights, $rawConnects);

        $this->assertEquals('Senior Full Stack Architect', $mapped['title']);
        $this->assertEquals('Expert in Laravel and React.', $mapped['overview']);
        $this->assertEquals('$95.00', $mapped['hourlyRate']);
        $this->assertEquals(['Laravel', 'React', 'TypeScript'], $mapped['skills']);
        $this->assertEquals(140, $mapped['connectsBalance']);
        $this->assertEquals(100, $mapped['profileSignals']['jobSuccessScore']);
        $this->assertTrue($mapped['profileSignals']['topRated']);
        $this->assertCount(1, $mapped['portfolioHighlights']);

        // Check non-exposure
        $json = json_encode($mapped);
        $this->assertStringNotContainsString('secret_org_uid_should_not_leak', $json);
        $this->assertStringNotContainsString('internal_account_id', $json);
        $this->assertStringNotContainsString('org_uid', $json);
    }

    public function test_maps_job_search_results_and_exposes_only_safe_reference(): void
    {
        $rawSearch = [
            'jobs' => [
                [
                    'id' => '1849204918239019283',
                    'ciphertext' => '~02189a7f34c2b98e71',
                    'title' => 'Senior Laravel React Developer',
                    'snippet' => 'Looking for senior engineer...',
                    'job_type' => 'fixed',
                    'budget' => '$3,000',
                    'skills' => ['Laravel', 'React'],
                    'experience_level' => 'expert',
                    'connects' => 16,
                    'verified_payment' => true,
                    'client_rating' => 4.95,
                    'client_total_charge' => '$50k+',
                    'client_country' => 'United States',
                    'org_uid' => 'client_org_uid_9999',
                    'internal_routing_hash' => 'hash_999',
                ],
            ],
            'total_count' => 1,
        ];

        $mapped = UpworkResponseMapper::mapJobSearchResults($rawSearch);

        $this->assertEquals(1, $mapped['totalCount']);
        $this->assertCount(1, $mapped['jobs']);

        $job = $mapped['jobs'][0];
        $this->assertEquals('~02189a7f34c2b98e71', $job['reference']);
        $this->assertEquals('Senior Laravel React Developer', $job['title']);
        $this->assertEquals('fixed', $job['jobType']);
        $this->assertEquals('$3,000', $job['budget']);
        $this->assertEquals(16, $job['connectsRequired']);
        $this->assertEquals('United States', $job['client']['location']);

        $json = json_encode($mapped);
        $this->assertStringNotContainsString('client_org_uid_9999', $json);
        $this->assertStringNotContainsString('internal_routing_hash', $json);
    }

    public function test_maps_proposals_and_invitations_safely(): void
    {
        $rawProposals = [
            'proposals' => [
                [
                    'id' => 'prop_123',
                    'title' => 'Full Stack Next.js Project',
                    'client_name' => 'Acme Corp',
                    'status' => 'Submitted',
                    'rate' => '$5,000',
                    'org_uid' => 'secret_org_uid',
                ],
            ],
        ];

        $mappedProposals = UpworkResponseMapper::mapProposals($rawProposals);
        $this->assertCount(1, $mappedProposals);
        $this->assertEquals('Full Stack Next.js Project', $mappedProposals[0]['jobTitle']);
        $this->assertStringNotContainsString('secret_org_uid', json_encode($mappedProposals));

        $rawInvitations = [
            'invitations' => [
                [
                    'id' => 'inv_456',
                    'title' => 'Interview Request: React Specialist',
                    'client_name' => 'Tech Ventures',
                    'status' => 'Pending',
                    'org_uid' => 'secret_org_uid',
                ],
            ],
        ];

        $mappedInvitations = UpworkResponseMapper::mapInvitations($rawInvitations);
        $this->assertCount(1, $mappedInvitations);
        $this->assertEquals('Interview Request: React Specialist', $mappedInvitations[0]['jobTitle']);
        $this->assertStringNotContainsString('secret_org_uid', json_encode($mappedInvitations));
    }

    public function test_missing_upwork_fields_remain_null_without_fabricated_defaults(): void
    {
        // Empty profile payload
        $mappedProfile = UpworkResponseMapper::mapProfile([], [], []);
        $this->assertNull($mappedProfile['title']);
        $this->assertNull($mappedProfile['overview']);
        $this->assertNull($mappedProfile['hourlyRate']);
        $this->assertNull($mappedProfile['connectsBalance']);
        $this->assertNull($mappedProfile['profileSignals']['jobSuccessScore']);
        $this->assertNull($mappedProfile['profileSignals']['topRated']);
        $this->assertSame([], $mappedProfile['skills']);
        $this->assertSame([], $mappedProfile['portfolioHighlights']);

        // Empty job search item payload
        $rawSearch = ['jobs' => [[]]];
        $mappedSearch = UpworkResponseMapper::mapJobSearchResults($rawSearch);
        $job = $mappedSearch['jobs'][0];

        $this->assertNull($job['reference']);
        $this->assertNull($job['title']);
        $this->assertNull($job['descriptionSnippet']);
        $this->assertNull($job['jobType']);
        $this->assertNull($job['budget']);
        $this->assertNull($job['hourlyRate']);
        $this->assertNull($job['experienceLevel']);
        $this->assertNull($job['postedTime']);
        $this->assertNull($job['connectsRequired']);
        $this->assertNull($job['client']['paymentVerified']);
        $this->assertNull($job['client']['rating']);
        $this->assertNull($job['client']['totalSpent']);
        $this->assertNull($job['client']['location']);

        // Empty job detail payload
        $mappedDetail = UpworkResponseMapper::mapJobDetail([]);
        $this->assertNull($mappedDetail['reference']);
        $this->assertNull($mappedDetail['title']);
        $this->assertNull($mappedDetail['description']);
        $this->assertNull($mappedDetail['jobType']);
        $this->assertNull($mappedDetail['budget']);
        $this->assertNull($mappedDetail['hourlyRate']);
        $this->assertNull($mappedDetail['experienceLevel']);
        $this->assertNull($mappedDetail['connectsRequired']);
        $this->assertNull($mappedDetail['client']['paymentVerified']);
        $this->assertNull($mappedDetail['client']['rating']);
        $this->assertNull($mappedDetail['client']['totalSpent']);
        $this->assertNull($mappedDetail['client']['hireRate']);
        $this->assertNull($mappedDetail['client']['location']);
        $this->assertSame([], $mappedDetail['screeningQuestions']);
    }
}
