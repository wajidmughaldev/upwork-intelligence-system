import { UpworkJobDetail, UpworkJobSummary, UpworkProfileData } from './UpworkApiService';

export type OpportunityClassification =
  | 'Strong Match'
  | 'Good / Review'
  | 'Weak / Review'
  | 'Low Priority'
  | 'Insufficient Evidence';

export type OpportunityConfidence = 'High' | 'Medium' | 'Low';

export interface OpportunityBreakdownItem {
  earned: number;
  maxWeight: number;
  availableWeight: number;
  available: boolean;
  reason: string;
}

export interface OpportunityAnalysis {
  score: number | null;
  classification: OpportunityClassification;
  confidence: OpportunityConfidence;
  evidenceCoverage: number;
  breakdown: {
    technicalMatch: OpportunityBreakdownItem;
    relevantExperience: OpportunityBreakdownItem;
    portfolioProof: OpportunityBreakdownItem;
    clientQuality: OpportunityBreakdownItem;
    budgetFit: OpportunityBreakdownItem;
    jobClarity: OpportunityBreakdownItem;
    connectEfficiency: OpportunityBreakdownItem;
    personalPreferences: OpportunityBreakdownItem;
  };
  whyMatch: string[];
  whySkip: string[];
  matchedSkills: string[];
  missingSkills: string[];
}

type ScoringJob = UpworkJobSummary | UpworkJobDetail;

const WEIGHTS = {
  technicalMatch: 25,
  relevantExperience: 15,
  portfolioProof: 15,
  clientQuality: 15,
  budgetFit: 10,
  jobClarity: 10,
  connectEfficiency: 5,
  personalPreferences: 5,
} as const;

const LABELS: Record<keyof OpportunityAnalysis['breakdown'], string> = {
  technicalMatch: 'Technical Match',
  relevantExperience: 'Relevant Experience',
  portfolioProof: 'Portfolio Proof',
  clientQuality: 'Client Quality',
  budgetFit: 'Budget Fit',
  jobClarity: 'Job Clarity',
  connectEfficiency: 'Connect Efficiency',
  personalPreferences: 'Personal Preferences',
};

const SKILL_ALIASES: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  nodejs: 'node',
  'node js': 'node',
  next: 'nextjs',
  'next js': 'nextjs',
  reactjs: 'react',
  'react js': 'react',
  vuejs: 'vue',
  'vue js': 'vue',
};

const GENERIC_PORTFOLIO_TERMS = new Set([
  'developer',
  'development',
  'engineer',
  'website',
  'web',
  'application',
  'app',
  'project',
]);

function normalizeText(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/\b\d+(\.\d+)*\b/g, '')
    .replace(/[^a-z0-9+#\s]/g, ' ')
    .replace(/\bnext\s+js\b/g, 'nextjs')
    .replace(/\bnode\s+js\b/g, 'node')
    .replace(/\breact\s+js\b/g, 'react')
    .replace(/\bvue\s+js\b/g, 'vue')
    .replace(/\s+/g, ' ')
    .trim();

  return SKILL_ALIASES[normalized] ?? normalized;
}

function normalizeSkill(value: string): string {
  return normalizeText(value);
}

function normalizedWords(value: string | null | undefined): Set<string> {
  return new Set(normalizeText(value ?? '').split(/\s+/).filter(Boolean));
}

function phraseMatchesText(phrase: string, text: string): boolean {
  const normalizedPhrase = normalizeText(phrase);
  const normalizedText = normalizeText(text);

  if (!normalizedPhrase || !normalizedText) return false;

  const aliases = new Set([normalizedPhrase, SKILL_ALIASES[normalizedPhrase] ?? normalizedPhrase]);
  for (const candidate of aliases) {
    const escaped = candidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    if (new RegExp(`(^|\\s)${escaped}(?=\\s|$)`).test(normalizedText)) {
      return true;
    }
  }

  return false;
}

function meaningfulTitleTerms(title: string | null): string[] {
  return [...normalizedWords(title)]
    .filter((term) => term.length > 2 && !GENERIC_PORTFOLIO_TERMS.has(term));
}

function parseMoney(value: string | null | undefined): number | null {
  if (!value) return null;
  const lower = value.toLowerCase();
  const first = lower.match(/[\d,.]+/);
  if (!first) return null;
  const parsed = Number.parseFloat(first[0].replace(/,/g, ''));
  if (!Number.isFinite(parsed)) return null;
  if (lower.includes('m')) return parsed * 1000000;
  if (lower.includes('k')) return parsed * 1000;
  return parsed;
}

function item(maxWeight: number, available: boolean, earned: number, reason: string): OpportunityBreakdownItem {
  return {
    earned: available ? Math.max(0, Math.min(maxWeight, earned)) : 0,
    maxWeight,
    availableWeight: available ? maxWeight : 0,
    available,
    reason,
  };
}

function classify(score: number): OpportunityClassification {
  if (score >= 85) return 'Strong Match';
  if (score >= 70) return 'Good / Review';
  if (score >= 50) return 'Weak / Review';
  return 'Low Priority';
}

function confidence(coverage: number): OpportunityConfidence {
  if (coverage >= 75) return 'High';
  if (coverage >= 50) return 'Medium';
  return 'Low';
}

function clientQuality(job: ScoringJob): OpportunityBreakdownItem {
  let earned = 0;
  let available = 0;
  const reasons: string[] = [];

  if (job.client.paymentVerified !== null) {
    available += 5;
    earned += job.client.paymentVerified ? 5 : 0;
    reasons.push(job.client.paymentVerified ? 'Payment verified.' : 'Payment not verified.');
  }

  if (job.client.rating !== null) {
    available += 5;
    const rating = job.client.rating;
    earned += rating >= 4.8 ? 5 : rating >= 4.5 ? 4 : rating >= 4.0 ? 2.5 : 1;
    reasons.push(`Client rating is ${rating}.`);
  }

  const spend = parseMoney(job.client.totalSpent);
  if (spend !== null) {
    available += 5;
    earned += spend >= 50000 ? 5 : spend >= 10000 ? 4 : spend >= 1000 ? 2.5 : 1;
    reasons.push('Client spend is source-backed.');
  }

  return {
    earned,
    maxWeight: WEIGHTS.clientQuality,
    availableWeight: available,
    available: available > 0,
    reason: reasons.join(' ') || 'No source-backed client quality fields.',
  };
}

export const opportunityScoringService = {
  analyze(job: ScoringJob, profile: UpworkProfileData | null): OpportunityAnalysis {
    const empty = (maxWeight: number, reason: string) => item(maxWeight, false, 0, reason);
    const profileSkills = (profile?.skills ?? []).map(normalizeSkill).filter(Boolean);
    const jobSkills = job.skills.map(normalizeSkill).filter(Boolean);
    const profileText = `${profile?.title ?? ''} ${profile?.overview ?? ''}`.trim();
    const hasComparableSkills = profileSkills.length > 0 && jobSkills.length > 0;
    const matchedSkills = hasComparableSkills ? job.skills.filter((skill, index) => profileSkills.includes(jobSkills[index])) : [];
    const missingSkills = hasComparableSkills ? job.skills.filter((skill, index) => !profileSkills.includes(jobSkills[index])) : [];

    const technicalMatch =
      jobSkills.length && profileSkills.length
        ? item(
            WEIGHTS.technicalMatch,
            true,
            (matchedSkills.length / jobSkills.length) * WEIGHTS.technicalMatch,
            matchedSkills.length
              ? `Matches ${matchedSkills.length} of ${jobSkills.length} listed skills.`
              : 'No listed job skills match the real Upwork profile skills.'
          )
        : empty(WEIGHTS.technicalMatch, 'Job skills or real profile skills are unavailable.');

    const experienceHits = jobSkills.filter((skill) => phraseMatchesText(skill, profileText));
    const relevantExperience =
      profileText.length > 0 && jobSkills.length > 0
        ? item(
            WEIGHTS.relevantExperience,
            true,
            jobSkills.length ? (experienceHits.length / jobSkills.length) * WEIGHTS.relevantExperience : 0,
            experienceHits.length
              ? `${experienceHits.length} listed skills appear in the real profile title/overview.`
              : 'No listed skills appear in the real profile title/overview.'
          )
        : empty(
            WEIGHTS.relevantExperience,
            profileText.length === 0 ? 'Real profile title/overview unavailable.' : 'Job skills unavailable for profile experience comparison.'
          );

    const portfolio = profile?.portfolioHighlights ?? [];
    const relevanceTerms = jobSkills.length ? jobSkills : meaningfulTitleTerms(job.title);
    const relevantHighlights = portfolio.filter((highlight) => {
      const text = `${highlight.title ?? ''} ${highlight.description ?? ''}`;
      return relevanceTerms.some((term) => phraseMatchesText(term, text));
    }).length;
    const portfolioProof = portfolio.length
      ? item(
          WEIGHTS.portfolioProof,
          true,
          relevantHighlights >= 2 ? 15 : relevantHighlights === 1 ? 10 : 0,
          relevantHighlights >= 2
            ? 'Two relevant Upwork portfolio highlights were found.'
            : relevantHighlights === 1
              ? 'One relevant Upwork portfolio highlight was found.'
              : 'Real portfolio exists but no relevant highlight matched.'
        )
      : empty(WEIGHTS.portfolioProof, 'No source-backed Upwork portfolio highlights available.');

    const client = clientQuality(job);

    const profileHourly = parseMoney(profile?.hourlyRate);
    const jobHourly = parseMoney(job.hourlyRate ?? (job.jobType === 'hourly' ? job.budget : null));
    const budgetFit =
      job.jobType === 'hourly' && profileHourly !== null && jobHourly !== null
        ? item(
            WEIGHTS.budgetFit,
            true,
            jobHourly >= profileHourly ? 10 : jobHourly >= profileHourly * 0.8 ? 7 : jobHourly >= profileHourly * 0.6 ? 4 : 0,
            jobHourly >= profileHourly ? 'Hourly range meets your Upwork profile rate.' : 'Hourly rate is below your profile rate.'
          )
        : empty(
            WEIGHTS.budgetFit,
            job.jobType === 'fixed'
              ? 'Fixed-price budget fit unavailable without trusted fixed-budget preference.'
              : 'Hourly rate fit unavailable without reliable profile and job hourly rates.'
          );

    const description = 'descriptionSnippet' in job ? job.descriptionSnippet : job.description;
    const clarityEarned =
      (job.title ? 2 : 0) +
      ((description?.trim().length ?? 0) >= 80 ? 3 : 0) +
      (job.skills.length ? 2 : 0) +
      (job.jobType ? 1 : 0) +
      (job.budget || job.hourlyRate ? 2 : 0);
    const jobClarity = item(WEIGHTS.jobClarity, true, clarityEarned, 'Score based on source-backed job field completeness.');

    const connectEfficiency =
      job.connectsRequired === null
        ? empty(WEIGHTS.connectEfficiency, 'Connect cost unavailable.')
        : item(
            WEIGHTS.connectEfficiency,
            true,
            job.connectsRequired <= 8 ? 5 : job.connectsRequired <= 12 ? 3 : 1,
            job.connectsRequired > 12 ? 'Connect cost is high.' : 'Connect cost is reasonable.'
          );

    const personalPreferences = empty(WEIGHTS.personalPreferences, 'Not configured with trusted preferences yet.');

    const breakdown = {
      technicalMatch,
      relevantExperience,
      portfolioProof,
      clientQuality: client,
      budgetFit,
      jobClarity,
      connectEfficiency,
      personalPreferences,
    };

    const profileFitAvailable = technicalMatch.available || relevantExperience.available || portfolioProof.available;
    const totalEarned = Object.values(breakdown).reduce((sum, part) => sum + part.earned, 0);
    const totalAvailableWeight = Object.values(breakdown).reduce((sum, part) => sum + part.availableWeight, 0);
    const evidenceCoverage = Math.round(totalAvailableWeight);

    if (!profile || !profileFitAvailable || totalAvailableWeight === 0) {
      return {
        score: null,
        classification: 'Insufficient Evidence',
        confidence: 'Low',
        evidenceCoverage,
        breakdown,
        whyMatch: [],
        whySkip: [profile ? 'Insufficient real profile-fit evidence is available.' : 'Real Upwork profile evidence is unavailable.'],
        matchedSkills,
        missingSkills,
      };
    }

    const score = Math.min(100, Math.round((totalEarned / totalAvailableWeight) * 100));
    const whyMatch = [
      matchedSkills.length ? `Matches ${matchedSkills.length} of ${jobSkills.length} listed skills: ${matchedSkills.slice(0, 4).join(', ')}.` : null,
      job.client.paymentVerified === true ? 'Client payment is verified.' : null,
      job.client.rating !== null && job.client.rating >= 4.5 ? `Client rating is ${job.client.rating}.` : null,
      budgetFit.available && budgetFit.earned >= 7 ? budgetFit.reason : null,
      relevantHighlights >= 2 ? 'Two relevant Upwork portfolio highlights were found.' : relevantHighlights === 1 ? 'One relevant Upwork portfolio highlight was found.' : null,
    ].filter(Boolean).slice(0, 3) as string[];

    const whySkip = [
      missingSkills.length ? `Missing ${missingSkills.length} of ${jobSkills.length} listed skills.` : null,
      job.client.paymentVerified === false ? 'Client payment is not verified.' : null,
      job.client.rating !== null && job.client.rating < 4.0 ? 'Client rating is below 4.0.' : null,
      budgetFit.available && budgetFit.earned < 7 ? budgetFit.reason : null,
      job.connectsRequired !== null && job.connectsRequired > 12 ? 'Connect cost is high.' : null,
    ].filter(Boolean).slice(0, 3) as string[];

    return {
      score,
      classification: classify(score),
      confidence: confidence(evidenceCoverage),
      evidenceCoverage,
      breakdown,
      whyMatch,
      whySkip,
      matchedSkills,
      missingSkills,
    };
  },
  labels: LABELS,
};
