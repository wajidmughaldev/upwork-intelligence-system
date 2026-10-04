<?php

declare(strict_types=1);

namespace App\Services\Upwork\Mappers;

class UpworkResponseMapper
{
    /**
     * Map raw profile, highlights, and connects data to a sanitized DTO array.
     * Optional fields remain null if missing from Upwork response payload.
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
                    'title' => isset($h['title']) ? (string) $h['title'] : (isset($h['name']) ? (string) $h['name'] : null),
                    'description' => isset($h['description']) ? (string) $h['description'] : (isset($h['summary']) ? (string) $h['summary'] : null),
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

        $balance = null;
        if (is_numeric($connects)) {
            $balance = (int) $connects;
        } elseif (is_array($connects)) {
            $rawBal = $connects['available'] ?? $connects['connects'] ?? $connects['balance'] ?? null;
            $balance = is_numeric($rawBal) ? (int) $rawBal : null;
        }

        return [
            'title' => isset($profile['title']) ? (string) $profile['title'] : (isset($profile['profile_title']) ? (string) $profile['profile_title'] : null),
            'overview' => isset($profile['overview']) ? (string) $profile['overview'] : (isset($profile['description']) ? (string) $profile['description'] : null),
            'hourlyRate' => isset($profile['hourly_rate']) ? (string) $profile['hourly_rate'] : (isset($profile['rate']) ? (string) $profile['rate'] : null),
            'skills' => $skills,
            'portfolioHighlights' => $sanitizedHighlights,
            'connectsBalance' => $balance,
            'profileSignals' => [
                'jobSuccessScore' => isset($profile['jss']) ? (int) $profile['jss'] : (isset($profile['job_success_score']) ? (int) $profile['job_success_score'] : null),
                'topRated' => isset($profile['top_rated']) ? (bool) $profile['top_rated'] : null,
            ],
        ];
    }

    /**
     * Map raw connects payload to safe response.
     *
     * @param  array<string, mixed>  $connectsRaw
     * @return array{available: int|null, membershipType: string|null}
     */
    public static function mapConnects(array $connectsRaw): array
    {
        $raw = $connectsRaw['connects_balance'] ?? $connectsRaw['balance'] ?? $connectsRaw['data'] ?? $connectsRaw;

        $available = null;
        $membership = null;

        if (is_numeric($raw)) {
            $available = (int) $raw;
        } elseif (is_array($raw)) {
            $rawBal = $raw['available'] ?? $raw['connects'] ?? $raw['balance'] ?? null;
            $available = is_numeric($rawBal) ? (int) $rawBal : null;
            $membership = isset($raw['membership']) ? (string) $raw['membership'] : null;
        }

        return [
            'available' => $available,
            'membershipType' => $membership,
        ];
    }

    /**
     * Map raw job search results to safe DTO list.
     * Exposes ONLY safe ciphertext (~02...) references. Numeric IDs are never exposed.
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

            $reference = static::resolvePublicJobReference($job);

            $jobType = null;
            if (isset($job['job_type'])) {
                $jobType = strtolower((string) $job['job_type']) === 'hourly' ? 'hourly' : 'fixed';
            }

            $sanitizedJobs[] = [
                'reference' => $reference,
                'title' => isset($job['title']) ? (string) $job['title'] : null,
                'descriptionSnippet' => isset($job['snippet']) ? (string) $job['snippet'] : (isset($job['description_snippet']) ? (string) $job['description_snippet'] : (isset($job['description']) ? substr((string) $job['description'], 0, 240) : null)),
                'jobType' => $jobType,
                'budget' => isset($job['budget']) ? (string) $job['budget'] : null,
                'hourlyRate' => isset($job['rate']) ? (string) $job['rate'] : (isset($job['hourly_rate']) ? (string) $job['hourly_rate'] : null),
                'skills' => is_array($job['skills'] ?? null) ? array_values(array_filter($job['skills'], is_string(...))) : [],
                'experienceLevel' => isset($job['experience_level']) ? (string) $job['experience_level'] : (isset($job['experience_level_label']) ? (string) $job['experience_level_label'] : null),
                'postedTime' => isset($job['posted_time']) ? (string) $job['posted_time'] : (isset($job['created_at']) ? (string) $job['created_at'] : null),
                'connectsRequired' => isset($job['connects_required']) ? (int) $job['connects_required'] : (isset($job['connects']) ? (int) $job['connects'] : null),
                'client' => [
                    'paymentVerified' => isset($job['client']['verified_payment']) ? (bool) $job['client']['verified_payment'] : (isset($job['verified_payment']) ? (bool) $job['verified_payment'] : null),
                    'rating' => isset($job['client']['rating']) ? (float) $job['client']['rating'] : (isset($job['client_rating']) ? (float) $job['client_rating'] : null),
                    'totalSpent' => isset($job['client']['total_spent']) ? (string) $job['client']['total_spent'] : (isset($job['client_total_charge']) ? (string) $job['client_total_charge'] : null),
                    'location' => isset($job['client']['location']) ? (string) $job['client']['location'] : (isset($job['client_country']) ? (string) $job['client_country'] : null),
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
     * Exposes ONLY safe ciphertext (~02...) references. Numeric IDs are never exposed.
     *
     * @param  array<string, mixed>  $jobRaw
     * @return array<string, mixed>
     */
    public static function mapJobDetail(array $jobRaw): array
    {
        $job = $jobRaw['job'] ?? $jobRaw['data'] ?? $jobRaw;

        $reference = static::resolvePublicJobReference($job);

        $jobType = null;
        if (isset($job['job_type'])) {
            $jobType = strtolower((string) $job['job_type']) === 'hourly' ? 'hourly' : 'fixed';
        }

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
            'title' => isset($job['title']) ? (string) $job['title'] : null,
            'description' => isset($job['description']) ? (string) $job['description'] : null,
            'jobType' => $jobType,
            'budget' => isset($job['budget']) ? (string) $job['budget'] : null,
            'hourlyRate' => isset($job['rate']) ? (string) $job['rate'] : (isset($job['hourly_rate']) ? (string) $job['hourly_rate'] : null),
            'skills' => is_array($job['skills'] ?? null) ? array_values(array_filter($job['skills'], is_string(...))) : [],
            'experienceLevel' => isset($job['experience_level']) ? (string) $job['experience_level'] : (isset($job['experience_level_label']) ? (string) $job['experience_level_label'] : null),
            'connectsRequired' => isset($job['connects_required']) ? (int) $job['connects_required'] : (isset($job['connects']) ? (int) $job['connects'] : null),
            'client' => [
                'paymentVerified' => isset($job['client']['verified_payment']) ? (bool) $job['client']['verified_payment'] : (isset($job['verified_payment']) ? (bool) $job['verified_payment'] : null),
                'rating' => isset($job['client']['rating']) ? (float) $job['client']['rating'] : (isset($job['client_rating']) ? (float) $job['client_rating'] : null),
                'totalSpent' => isset($job['client']['total_spent']) ? (string) $job['client']['total_spent'] : (isset($job['client_total_charge']) ? (string) $job['client_total_charge'] : null),
                'hireRate' => isset($job['client']['hire_rate']) ? (string) $job['client']['hire_rate'] : null,
                'location' => isset($job['client']['location']) ? (string) $job['client']['location'] : (isset($job['client_country']) ? (string) $job['client_country'] : null),
            ],
            'screeningQuestions' => $screening,
        ];
    }

    /**
     * Map proposals response to safe DTO list.
     * Excludes internal proposal IDs from public Phase 2A DTO.
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
                'jobTitle' => isset($prop['job_title']) ? (string) $prop['job_title'] : (isset($prop['title']) ? (string) $prop['title'] : null),
                'clientName' => isset($prop['client_name']) ? (string) $prop['client_name'] : null,
                'status' => isset($prop['status']) ? (string) $prop['status'] : null,
                'statusLabel' => isset($prop['status_label']) ? (string) $prop['status_label'] : (isset($prop['status']) ? (string) $prop['status'] : null),
                'submittedDate' => isset($prop['submitted_date']) ? (string) $prop['submitted_date'] : (isset($prop['created_at']) ? (string) $prop['created_at'] : null),
                'bidAmount' => isset($prop['bid_amount']) ? (string) $prop['bid_amount'] : (isset($prop['rate']) ? (string) $prop['rate'] : null),
                'connectsUsed' => isset($prop['connects_used']) ? (int) $prop['connects_used'] : null,
            ];
        }

        return $results;
    }

    /**
     * Map invitations response to safe DTO list.
     * Excludes internal invitation IDs from public Phase 2A DTO.
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
                'jobTitle' => isset($inv['job_title']) ? (string) $inv['job_title'] : (isset($inv['title']) ? (string) $inv['title'] : null),
                'clientName' => isset($inv['client_name']) ? (string) $inv['client_name'] : null,
                'receivedDate' => isset($inv['received_date']) ? (string) $inv['received_date'] : (isset($inv['created_at']) ? (string) $inv['created_at'] : null),
                'status' => isset($inv['status']) ? (string) $inv['status'] : null,
            ];
        }

        return $results;
    }

    /**
     * Only allow ciphertext (~02...) or non-numeric public job reference string.
     * Numeric IDs are never exposed in the public DTO.
     */
    protected static function resolvePublicJobReference(array $job): ?string
    {
        $candidates = array_filter([
            $job['ciphertext'] ?? null,
            $job['job_reference'] ?? null,
            $job['reference'] ?? null,
            $job['id'] ?? null,
        ], fn ($v) => is_string($v) && ! empty($v));

        foreach ($candidates as $val) {
            if (str_starts_with($val, '~02') || str_starts_with($val, '~')) {
                return $val;
            }
        }

        foreach ($candidates as $val) {
            if (! ctype_digit($val) && ! is_numeric($val)) {
                return $val;
            }
        }

        return null;
    }
}
