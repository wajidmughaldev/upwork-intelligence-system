<?php

declare(strict_types=1);

namespace App\Services\Upwork\Mappers;

class UpworkResponseMapper
{
    /**
     * Map raw profile, highlights, and connects data to a sanitized DTO array.
     *
     * @param  array<string, mixed>  $profileRaw
     * @param  array<string, mixed>  $highlightsRaw
     * @param  array<string, mixed>  $connectsRaw
     * @return array<string, mixed>
     */
    public static function mapProfile(array $profileRaw, array $highlightsRaw = [], array $connectsRaw = []): array
    {
        $profile = $profileRaw['profile'] ?? $profileRaw['data'] ?? $profileRaw;
        $highlights = $highlightsRaw['highlights'] ?? $highlightsRaw['portfolio'] ?? $highlightsRaw['data'] ?? [];
        $connects = $connectsRaw['connects_balance'] ?? $connectsRaw['balance'] ?? $connectsRaw['data'] ?? $connectsRaw;

        $sanitizedHighlights = [];
        if (is_array($highlights)) {
            foreach ($highlights as $h) {
                if (! is_array($h)) {
                    continue;
                }
                $sanitizedHighlights[] = [
                    'title' => (string) ($h['title'] ?? $h['name'] ?? 'Portfolio Highlight'),
                    'description' => (string) ($h['description'] ?? $h['summary'] ?? ''),
                    'url' => isset($h['url']) ? (string) $h['url'] : null,
                    'completionDate' => isset($h['completion_date']) ? (string) $h['completion_date'] : null,
                ];
            }
        }

        $skills = [];
        $rawSkills = $profile['skills'] ?? $profile['skill_tags'] ?? [];
        if (is_array($rawSkills)) {
            foreach ($rawSkills as $s) {
                if (is_string($s)) {
                    $skills[] = $s;
                } elseif (is_array($s) && isset($s['name'])) {
                    $skills[] = (string) $s['name'];
                }
            }
        }

        $balance = 0;
        if (is_numeric($connects)) {
            $balance = (int) $connects;
        } elseif (is_array($connects)) {
            $balance = (int) ($connects['available'] ?? $connects['connects'] ?? $connects['balance'] ?? 0);
        }

        return [
            'title' => (string) ($profile['title'] ?? $profile['profile_title'] ?? 'Full Stack Developer'),
            'overview' => (string) ($profile['overview'] ?? $profile['description'] ?? ''),
            'hourlyRate' => (string) ($profile['hourly_rate'] ?? $profile['rate'] ?? '$75.00'),
            'skills' => $skills,
            'portfolioHighlights' => $sanitizedHighlights,
            'connectsBalance' => $balance,
            'profileSignals' => [
                'jobSuccessScore' => isset($profile['jss']) ? (int) $profile['jss'] : (isset($profile['job_success_score']) ? (int) $profile['job_success_score'] : null),
                'topRated' => (bool) ($profile['top_rated'] ?? false),
            ],
        ];
    }

    /**
     * Map raw connects payload to safe response.
     *
     * @param  array<string, mixed>  $connectsRaw
     * @return array{available: int, membershipType: string|null}
     */
    public static function mapConnects(array $connectsRaw): array
    {
        $raw = $connectsRaw['connects_balance'] ?? $connectsRaw['balance'] ?? $connectsRaw['data'] ?? $connectsRaw;

        $available = 0;
        $membership = null;

        if (is_numeric($raw)) {
            $available = (int) $raw;
        } elseif (is_array($raw)) {
            $available = (int) ($raw['available'] ?? $raw['connects'] ?? $raw['balance'] ?? 0);
            $membership = isset($raw['membership']) ? (string) $raw['membership'] : null;
        }

        return [
            'available' => $available,
            'membershipType' => $membership,
        ];
    }

    /**
     * Map raw job search results to safe DTO list.
     *
     * @param  array<string, mixed>  $searchRaw
     * @return array{jobs: array<int, mixed>, totalCount: int, hasMore: bool}
     */
    public static function mapJobSearchResults(array $searchRaw): array
    {
        $rawJobs = $searchRaw['jobs'] ?? $searchRaw['results'] ?? $searchRaw['data'] ?? [];
        if (! is_array($rawJobs)) {
            $rawJobs = [];
        }

        $sanitizedJobs = [];
        foreach ($rawJobs as $job) {
            if (! is_array($job)) {
                continue;
            }

            // Expose ONLY safe reference (~02... or safe reference key) for navigation
            $reference = (string) ($job['ciphertext'] ?? $job['job_reference'] ?? $job['reference'] ?? $job['id'] ?? '');

            $sanitizedJobs[] = [
                'reference' => $reference,
                'title' => (string) ($job['title'] ?? 'Untitled Job'),
                'descriptionSnippet' => (string) ($job['snippet'] ?? $job['description_snippet'] ?? substr((string) ($job['description'] ?? ''), 0, 240)),
                'jobType' => strtolower((string) ($job['job_type'] ?? 'fixed')) === 'hourly' ? 'hourly' : 'fixed',
                'budget' => isset($job['budget']) ? (string) $job['budget'] : null,
                'hourlyRate' => isset($job['rate']) ? (string) $job['rate'] : (isset($job['hourly_rate']) ? (string) $job['hourly_rate'] : null),
                'skills' => is_array($job['skills'] ?? null) ? array_values(array_filter($job['skills'], is_string(...))) : [],
                'experienceLevel' => (string) ($job['experience_level'] ?? 'intermediate'),
                'postedTime' => (string) ($job['posted_time'] ?? $job['created_at'] ?? 'Recently'),
                'connectsRequired' => (int) ($job['connects_required'] ?? $job['connects'] ?? 16),
                'client' => [
                    'paymentVerified' => (bool) ($job['client']['verified_payment'] ?? $job['verified_payment'] ?? true),
                    'rating' => (float) ($job['client']['rating'] ?? $job['client_rating'] ?? 5.0),
                    'totalSpent' => (string) ($job['client']['total_spent'] ?? $job['client_total_charge'] ?? '$10k+'),
                    'location' => (string) ($job['client']['location'] ?? $job['client_country'] ?? 'United States'),
                ],
            ];
        }

        $total = isset($searchRaw['total_count']) ? (int) $searchRaw['total_count'] : count($sanitizedJobs);
        $hasMore = ! empty($searchRaw['cursor']) || ! empty($searchRaw['next_cursor']);

        return [
            'jobs' => $sanitizedJobs,
            'totalCount' => $total,
            'hasMore' => $hasMore,
        ];
    }

    /**
     * Map single job details response to safe DTO.
     *
     * @param  array<string, mixed>  $jobRaw
     * @return array<string, mixed>
     */
    public static function mapJobDetail(array $jobRaw): array
    {
        $job = $jobRaw['job'] ?? $jobRaw['data'] ?? $jobRaw;

        $reference = (string) ($job['ciphertext'] ?? $job['job_reference'] ?? $job['reference'] ?? $job['id'] ?? '');

        $screening = [];
        $rawQuestions = $job['screening_questions'] ?? $job['questions'] ?? [];
        if (is_array($rawQuestions)) {
            foreach ($rawQuestions as $q) {
                if (is_string($q)) {
                    $screening[] = $q;
                } elseif (is_array($q) && isset($q['question'])) {
                    $screening[] = (string) $q['question'];
                }
            }
        }

        return [
            'reference' => $reference,
            'title' => (string) ($job['title'] ?? 'Job Details'),
            'description' => (string) ($job['description'] ?? ''),
            'jobType' => strtolower((string) ($job['job_type'] ?? 'fixed')) === 'hourly' ? 'hourly' : 'fixed',
            'budget' => isset($job['budget']) ? (string) $job['budget'] : null,
            'hourlyRate' => isset($job['rate']) ? (string) $job['rate'] : (isset($job['hourly_rate']) ? (string) $job['hourly_rate'] : null),
            'skills' => is_array($job['skills'] ?? null) ? array_values(array_filter($job['skills'], is_string(...))) : [],
            'experienceLevel' => (string) ($job['experience_level'] ?? 'intermediate'),
            'connectsRequired' => (int) ($job['connects_required'] ?? $job['connects'] ?? 16),
            'client' => [
                'paymentVerified' => (bool) ($job['client']['verified_payment'] ?? $job['verified_payment'] ?? true),
                'rating' => (float) ($job['client']['rating'] ?? $job['client_rating'] ?? 5.0),
                'totalSpent' => (string) ($job['client']['total_spent'] ?? $job['client_total_charge'] ?? '$10k+'),
                'hireRate' => (string) ($job['client']['hire_rate'] ?? '90%'),
                'location' => (string) ($job['client']['location'] ?? $job['client_country'] ?? 'United States'),
            ],
            'screeningQuestions' => $screening,
        ];
    }

    /**
     * Map proposals response to safe DTO list.
     *
     * @param  array<string, mixed>  $proposalsRaw
     * @return array<int, array<string, mixed>>
     */
    public static function mapProposals(array $proposalsRaw): array
    {
        $raw = $proposalsRaw['proposals'] ?? $proposalsRaw['data'] ?? $proposalsRaw;
        if (! is_array($raw)) {
            return [];
        }

        $results = [];
        foreach ($raw as $prop) {
            if (! is_array($prop)) {
                continue;
            }

            $results[] = [
                'reference' => (string) ($prop['id'] ?? $prop['proposal_id'] ?? ''),
                'jobTitle' => (string) ($prop['job_title'] ?? $prop['title'] ?? 'Proposed Job'),
                'clientName' => (string) ($prop['client_name'] ?? 'Client'),
                'status' => (string) ($prop['status'] ?? 'Submitted'),
                'statusLabel' => (string) ($prop['status_label'] ?? $prop['status'] ?? 'Active'),
                'submittedDate' => (string) ($prop['submitted_date'] ?? $prop['created_at'] ?? 'Recently'),
                'bidAmount' => isset($prop['bid_amount']) ? (string) $prop['bid_amount'] : (isset($prop['rate']) ? (string) $prop['rate'] : null),
                'connectsUsed' => isset($prop['connects_used']) ? (int) $prop['connects_used'] : null,
            ];
        }

        return $results;
    }

    /**
     * Map invitations response to safe DTO list.
     *
     * @param  array<string, mixed>  $invitationsRaw
     * @return array<int, array<string, mixed>>
     */
    public static function mapInvitations(array $invitationsRaw): array
    {
        $raw = $invitationsRaw['invitations'] ?? $invitationsRaw['data'] ?? $invitationsRaw;
        if (! is_array($raw)) {
            return [];
        }

        $results = [];
        foreach ($raw as $inv) {
            if (! is_array($inv)) {
                continue;
            }

            $results[] = [
                'invitationReference' => (string) ($inv['id'] ?? $inv['invitation_id'] ?? ''),
                'jobTitle' => (string) ($inv['job_title'] ?? $inv['title'] ?? 'Job Invitation'),
                'clientName' => (string) ($inv['client_name'] ?? 'Client'),
                'receivedDate' => (string) ($inv['received_date'] ?? $inv['created_at'] ?? 'Recently'),
                'status' => (string) ($inv['status'] ?? 'Pending'),
            ];
        }

        return $results;
    }
}
