export interface ScoreBreakdownItem {
  name: string;
  score: number;
  maxScore: number;
}

export interface DetailedBreakdown {
  technicalMatch: number; // /25
  relevantExperience: number; // /15
  portfolioProof: number; // /15
  clientQuality: number; // /15
  budgetFit: number; // /10
  jobClarity: number; // /10
  connectEfficiency: number; // /5
  preferences: number; // /5
}

export interface ClientInfo {
  rating: number;
  reviewsCount: number;
  totalSpent: string;
  hireRate: string;
  jobsPosted: number;
  location: string;
  feedbackSummary: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  technologies: string[];
  description: string;
  outcome: string;
}

export type AnalysisConfidence = 'High' | 'Medium' | 'Low';

export interface OriginalJobBrief {
  description: string;
  deliverables: string[];
  requiredSkills: string[];
  experienceLevel: string;
  jobType: string;
  budget: string;
  timeline?: string;
}

export interface Job {
  id: string;
  title: string;
  category: string;
  budgetType: 'fixed' | 'hourly';
  budget: string; // e.g. "$2,000" or "$65-$90/hr"
  rawBudget: number;
  postedTime: string;
  experienceLevel: 'Entry' | 'Intermediate' | 'Expert';
  connectsRequired: number;
  opportunityScore: number; // 0 - 100 Profile/Job fit score
  matchLevel: 'Strong Match' | 'Good Match' | 'Moderate' | 'Low';
  confidence: AnalysisConfidence;
  confidenceExplanation: string;
  client: ClientInfo;
  skillTags: string[];
  shortRecommendation: string;
  description: string;
  originalBrief: OriginalJobBrief;
  scoreBreakdown: DetailedBreakdown;
  whyMatches: string[];
  whySkip: string[];
  suggestedApproach: string;
  saved?: boolean;
  skipped?: boolean;
}

export interface ProposalVersion {
  id: string;
  versionNumber: number;
  label: string; // e.g. "v3 — Current", "v2", "v1"
  text: string;
  tone: string;
  length: string;
  timestamp: string;
  sourceAction: string; // e.g. "Initial Generation", "Improved Opening", "Made Shorter", "Swapped Proof", "Manual Edit"
}

export type ApplicationStatus = 'Draft' | 'Submitted' | 'Interview' | 'Hired' | 'Archived';

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  clientName: string;
  clientSpent: string;
  clientRating: number;
  opportunityScore: number;
  confidence: AnalysisConfidence;
  proposedBid: string;
  connectsUsed: number;
  status: ApplicationStatus;
  appliedDate: string;
  outcome: string;
  coverLetter: string;
  screeningAnswers: { question: string; answer: string }[];
  attachments: string[];
  tone: string;
  length: string;
  originalJobBrief?: OriginalJobBrief;
}

export type SubmissionResultState = 'idle' | 'success' | 'failed' | 'unknown';

export interface SubmissionResultData {
  state: SubmissionResultState;
  jobTitle: string;
  bid: string;
  connectsCost: number;
  availableConnects: number;
  remainingConnects: number;
  errorReason?: string;
  warningNotice?: string;
}

export interface UserProfile {
  name: string;
  title: string;
  hourlyRate: string;
  jss: string;
  skills: string[];
  totalHours: string;
  jobsCompleted: number;
  categories: string[];
  preferences: {
    preferredJobTypes: string[];
    minFixedBudget: number;
    minHourlyRate: number;
    strongestSkills: string[];
    preferredIndustries: string[];
    avoidedCategories: string[];
    availability: string;
    defaultTone: string;
    defaultLength: string;
    minScore: number;
    minClientRating: number;
  };
  portfolio: PortfolioItem[];
}
