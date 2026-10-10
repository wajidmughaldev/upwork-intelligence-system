import { Job, Application, UserProfile, ApplicationStatus, SubmissionResultState, SubmissionResultData } from '../types';

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Laravel + React SaaS Developer',
    category: 'Web Development',
    budgetType: 'fixed',
    budget: '$2,000',
    rawBudget: 2000,
    postedTime: '38 minutes ago',
    experienceLevel: 'Expert',
    connectsRequired: 14,
    opportunityScore: 92,
    matchLevel: 'Strong Match',
    confidence: 'High',
    confidenceExplanation: 'High confidence because sufficient job details, client history ($120k+ spend, 4.9★), matching skills, and relevant portfolio evidence are available.',
    skillTags: ['Laravel', 'React', 'REST API', 'AWS', 'Tailwind CSS'],
    shortRecommendation: 'Strong technical alignment with multiple relevant projects available.',
    description: 'We are seeking a senior Full-Stack SaaS Developer to build out the next iteration of our multi-tenant analytics portal. You will work directly with our CTO to convert Figma designs into pixel-perfect React frontend interfaces supported by a high-throughput Laravel 11 REST API. Experience with multi-tenancy, Redis queuing, and Stripe webhook handling is required.',
    originalBrief: {
      description: 'We are seeking a senior Full-Stack SaaS Developer to build out the next iteration of our multi-tenant analytics portal. You will work directly with our CTO to convert Figma designs into pixel-perfect React frontend interfaces supported by a high-throughput Laravel 11 REST API. Experience with multi-tenancy, Redis queuing, and Stripe webhook handling is required.',
      deliverables: [
        'Complete React 19 SPA dashboard aligned with Figma mockups',
        'Laravel 11 REST API backend with JSON:API spec compliance',
        'Redis queue workers for background webhook events and billing notifications',
        'Automated PHPUnit and Pest test coverage (>85%)'
      ],
      requiredSkills: ['Laravel 11', 'React 19', 'TypeScript', 'REST API Architecture', 'MySQL', 'Stripe Billing API'],
      experienceLevel: 'Expert Level',
      jobType: 'Fixed Price Contract',
      budget: '$2,000 Fixed',
      timeline: '2 - 4 Weeks'
    },
    client: {
      rating: 4.9,
      reviewsCount: 38,
      totalSpent: '$120K+',
      hireRate: '85%',
      jobsPosted: 42,
      location: 'United States',
      feedbackSummary: 'Excellent client, prompt payments, clear specifications, high repeat hire rate.'
    },
    scoreBreakdown: {
      technicalMatch: 24,
      relevantExperience: 14,
      portfolioProof: 14,
      clientQuality: 13,
      budgetFit: 10,
      jobClarity: 9,
      connectEfficiency: 4,
      preferences: 4
    },
    whyMatches: [
      'Exact tech stack alignment (Laravel 11 backend + React 19 frontend)',
      'Verified high-spend client ($120k+) with 4.9 rating and prompt payment history',
      'Target budget ($2,000) matches your minimum fixed price preference threshold',
      '3 relevant portfolio proof items available with matching metrics'
    ],
    whySkip: [
      'Relatively high Connect cost (14 Connects)',
      'Aggressive project deadline requiring immediate start within 48 hours'
    ],
    suggestedApproach: 'Architect a clean REST API in Laravel using API Resources & Form Requests. Build modular React components powered by TanStack Query for dynamic client state caching and fast render response times.'
  },
  {
    id: 'job-2',
    title: 'Next.js 14 & Tailwind Full-Stack Engineer',
    category: 'Web Development',
    budgetType: 'hourly',
    budget: '$75 - $95/hr',
    rawBudget: 85,
    postedTime: '1 hour ago',
    experienceLevel: 'Expert',
    connectsRequired: 12,
    opportunityScore: 88,
    matchLevel: 'Strong Match',
    confidence: 'High',
    confidenceExplanation: 'High confidence due to verified client payment history ($65k+, 5.0★), clean specification, and clear technical stack overlap.',
    skillTags: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'PostgreSQL'],
    shortRecommendation: 'High hourly rate project with long-term retention opportunity.',
    description: 'Looking for an experienced Next.js developer to modernize our customer portal. Must be proficient with App Router, Server Actions, Prisma ORM, and responsive Tailwind styling.',
    originalBrief: {
      description: 'Looking for an experienced Next.js developer to modernize our customer portal. Must be proficient with App Router, Server Actions, Prisma ORM, and responsive Tailwind styling.',
      deliverables: [
        'Migrate customer portal pages to Next.js 14 App Router',
        'Implement SSR caching and Server Actions for form submissions',
        'Set up PostgreSQL queries via Prisma ORM',
        'Responsive layout built with Tailwind CSS'
      ],
      requiredSkills: ['Next.js', 'React', 'TypeScript', 'Prisma', 'Tailwind CSS'],
      experienceLevel: 'Expert Level',
      jobType: 'Hourly Contract',
      budget: '$75 - $95 / hr',
      timeline: '1 - 3 Months'
    },
    client: {
      rating: 5.0,
      reviewsCount: 19,
      totalSpent: '$65K+',
      hireRate: '90%',
      jobsPosted: 15,
      location: 'Canada',
      feedbackSummary: 'Great communication, clear requirements, long-term contract potential.'
    },
    scoreBreakdown: {
      technicalMatch: 23,
      relevantExperience: 13,
      portfolioProof: 13,
      clientQuality: 15,
      budgetFit: 10,
      jobClarity: 8,
      connectEfficiency: 4,
      preferences: 2
    },
    whyMatches: [
      'High client score (5.0 stars) and 90% hire rate',
      'Hourly range ($75-$95/hr) exceeds your minimum rate preference',
      'Strong Next.js & TypeScript stack match'
    ],
    whySkip: [
      'Requires 30+ hours/week live overlap in EST timezone'
    ],
    suggestedApproach: 'Leverage Next.js App Router for server-rendered page loading efficiency, using Tailwind CSS and Radix UI components.'
  },
  {
    id: 'job-3',
    title: 'Python FastAPI Microservices & AI Integration',
    category: 'AI & Machine Learning',
    budgetType: 'fixed',
    budget: '$3,500',
    rawBudget: 3500,
    postedTime: '3 hours ago',
    experienceLevel: 'Expert',
    connectsRequired: 16,
    opportunityScore: 95,
    matchLevel: 'Strong Match',
    confidence: 'High',
    confidenceExplanation: 'High confidence based on detailed architectural requirements, top client spend ($210k+), and strong backend proof.',
    skillTags: ['Python', 'FastAPI', 'OpenAI API', 'Docker', 'PostgreSQL'],
    shortRecommendation: 'Exceptional budget fit and AI engineering match.',
    description: 'Build an automated document processing microservice using Python FastAPI, Celery background workers, and OpenAI vector embeddings for semantic document search.',
    originalBrief: {
      description: 'Build an automated document processing microservice using Python FastAPI, Celery background workers, and OpenAI vector embeddings for semantic document search.',
      deliverables: [
        'FastAPI REST endpoints for PDF/DOCX document ingest',
        'Asynchronous document chunking and vector embedding generation pipeline',
        'Integration with PostgreSQL pgvector for semantic search',
        'Docker containerization and Kubernetes deploy manifests'
      ],
      requiredSkills: ['Python', 'FastAPI', 'OpenAI API', 'Docker', 'PostgreSQL', 'Celery'],
      experienceLevel: 'Expert Level',
      jobType: 'Fixed Price Contract',
      budget: '$3,500 Fixed',
      timeline: '3 - 6 Weeks'
    },
    client: {
      rating: 4.8,
      reviewsCount: 54,
      totalSpent: '$210K+',
      hireRate: '82%',
      jobsPosted: 67,
      location: 'United Kingdom',
      feedbackSummary: 'Enterprise client with regular long-term technical projects.'
    },
    scoreBreakdown: {
      technicalMatch: 25,
      relevantExperience: 15,
      portfolioProof: 14,
      clientQuality: 14,
      budgetFit: 10,
      jobClarity: 9,
      connectEfficiency: 4,
      preferences: 4
    },
    whyMatches: [
      'Top tier fixed budget ($3,500)',
      'Enterprise-grade client ($210k+ spent)',
      'High relevance to backend microservice architecture portfolio'
    ],
    whySkip: [
      'Requires expertise with vector databases (Pinecone / Qdrant)'
    ],
    suggestedApproach: 'Deploy asynchronous FastAPI workers wrapped in Docker containers with clean OpenAPI documentation and robust unit test coverage.'
  },
  {
    id: 'job-4',
    title: 'Vue 3 to React Migration Specialist',
    category: 'Web Development',
    budgetType: 'fixed',
    budget: '$1,200',
    rawBudget: 1200,
    postedTime: '5 hours ago',
    experienceLevel: 'Intermediate',
    connectsRequired: 8,
    opportunityScore: 68,
    matchLevel: 'Moderate',
    confidence: 'Medium',
    confidenceExplanation: 'Medium confidence due to moderate client spend history ($8k) and slightly lower budget than profile preference.',
    skillTags: ['React', 'Vue.js', 'TypeScript'],
    shortRecommendation: 'Lower budget than preference, but low competition.',
    description: 'Refactor 12 core Vue 3 components to React 19 functional components with TypeScript.',
    originalBrief: {
      description: 'Refactor 12 core Vue 3 components to React 19 functional components with TypeScript.',
      deliverables: [
        'Rewrite 12 Vue 3 components in React 19 with strict TypeScript typings',
        'Verify zero regression against existing Cypress test suites',
        'Provide documentation for shared React state stores'
      ],
      requiredSkills: ['React', 'Vue.js', 'TypeScript'],
      experienceLevel: 'Intermediate Level',
      jobType: 'Fixed Price Contract',
      budget: '$1,200 Fixed',
      timeline: '1 - 2 Weeks'
    },
    client: {
      rating: 4.6,
      reviewsCount: 8,
      totalSpent: '$8K+',
      hireRate: '60%',
      jobsPosted: 10,
      location: 'Australia',
      feedbackSummary: 'Decent feedback, small business client.'
    },
    scoreBreakdown: {
      technicalMatch: 20,
      relevantExperience: 10,
      portfolioProof: 10,
      clientQuality: 10,
      budgetFit: 6,
      jobClarity: 7,
      connectEfficiency: 3,
      preferences: 2
    },
    whyMatches: [
      'Low Connect cost (8 Connects)',
      'Straightforward migration scope'
    ],
    whySkip: [
      'Budget ($1,200) below minimum preference ($1,500)',
      'Moderate client spend history ($8k)'
    ],
    suggestedApproach: 'Audit existing Vue pinia state store and rewrite using React Context + hooks.'
  },
  {
    id: 'job-5',
    title: 'Mobile App Developer for React Native Health Tracker',
    category: 'Mobile Development',
    budgetType: 'fixed',
    budget: '$2,800',
    rawBudget: 2800,
    postedTime: '6 hours ago',
    experienceLevel: 'Expert',
    connectsRequired: 16,
    opportunityScore: 78,
    matchLevel: 'Good Match',
    confidence: 'Medium',
    confidenceExplanation: 'Medium confidence because mobile is a secondary category, though client has strong budget and rating.',
    skillTags: ['React Native', 'Mobile App', 'TypeScript', 'HealthKit API'],
    shortRecommendation: 'Solid fixed price mobile project with clear requirements.',
    description: 'Looking for a React Native engineer to integrate Apple HealthKit and Google Fit sensor data into our cross-platform wellness application.',
    originalBrief: {
      description: 'Looking for a React Native engineer to integrate Apple HealthKit and Google Fit sensor data into our cross-platform wellness application.',
      deliverables: [
        'Cross-platform sensor background sync module',
        'Offline SQLite local cache layer',
        'Secure token exchange with HIPAA-compliant backend'
      ],
      requiredSkills: ['React Native', 'TypeScript', 'iOS', 'Android'],
      experienceLevel: 'Expert Level',
      jobType: 'Fixed Price Contract',
      budget: '$2,800 Fixed',
      timeline: '3 - 4 Weeks'
    },
    client: {
      rating: 4.9,
      reviewsCount: 22,
      totalSpent: '$75K+',
      hireRate: '88%',
      jobsPosted: 26,
      location: 'Germany',
      feedbackSummary: 'Clear technical leader, fast code reviews.'
    },
    scoreBreakdown: {
      technicalMatch: 18,
      relevantExperience: 12,
      portfolioProof: 11,
      clientQuality: 14,
      budgetFit: 10,
      jobClarity: 9,
      connectEfficiency: 2,
      preferences: 2
    },
    whyMatches: [
      'Generous budget ($2,800)',
      'Top European client ($75k+ spend, 4.9★)'
    ],
    whySkip: [
      'React Native is outside primary web development focus',
      'High connects required (16)'
    ],
    suggestedApproach: 'Build native bridge wrappers for HealthKit and sync data via idempotent background upload batches.'
  },
  {
    id: 'job-6',
    title: 'DevOps & AWS CI/CD Pipeline Architect',
    category: 'DevOps',
    budgetType: 'hourly',
    budget: '$80 - $110/hr',
    rawBudget: 95,
    postedTime: '8 hours ago',
    experienceLevel: 'Expert',
    connectsRequired: 14,
    opportunityScore: 84,
    matchLevel: 'Good Match',
    confidence: 'High',
    confidenceExplanation: 'High confidence based on client verified status ($300k+ spend) and clear infrastructure deliverables.',
    skillTags: ['AWS', 'Docker', 'Terraform', 'GitHub Actions', 'Kubernetes'],
    shortRecommendation: 'High-paying infrastructure project with top client tier.',
    description: 'Help our SaaS company transition from manual EC2 deployments to Terraform-managed ECS Fargate clusters with automated GitHub Actions testing and rollout.',
    originalBrief: {
      description: 'Help our SaaS company transition from manual EC2 deployments to Terraform-managed ECS Fargate clusters with automated GitHub Actions testing and rollout.',
      deliverables: [
        'Modular Terraform IaC for VPC, ECS, RDS, and CloudFront',
        'Zero-downtime blue/green deployment workflow in GitHub Actions',
        'CloudWatch metrics alerting integration with Slack'
      ],
      requiredSkills: ['AWS', 'Terraform', 'Docker', 'GitHub Actions'],
      experienceLevel: 'Expert Level',
      jobType: 'Hourly Contract',
      budget: '$80 - $110 / hr',
      timeline: '2 - 3 Months'
    },
    client: {
      rating: 5.0,
      reviewsCount: 78,
      totalSpent: '$340K+',
      hireRate: '95%',
      jobsPosted: 92,
      location: 'United States',
      feedbackSummary: 'Top enterprise client, excellent team, timely payment.'
    },
    scoreBreakdown: {
      technicalMatch: 21,
      relevantExperience: 12,
      portfolioProof: 12,
      clientQuality: 15,
      budgetFit: 10,
      jobClarity: 10,
      connectEfficiency: 3,
      preferences: 1
    },
    whyMatches: [
      'Top client tier ($340k+ spend, 5.0★ rating)',
      'Exceptional hourly rate ($80-$110/hr)'
    ],
    whySkip: [
      'Requires on-call deployment support'
    ],
    suggestedApproach: 'Set up Terraform remote state with S3 and DynamoDB locking, and build containerized GitHub Actions runner pipelines.'
  }
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-101',
    jobId: 'job-prev-1',
    jobTitle: 'Senior Full-Stack Developer for FinTech Dashboard',
    clientName: 'FinTech Labs LLC',
    clientSpent: '$180K+',
    clientRating: 4.9,
    opportunityScore: 94,
    confidence: 'High',
    proposedBid: '$2,400',
    connectsUsed: 16,
    status: 'Interview',
    appliedDate: 'Oct 1, 2026',
    outcome: 'Interview Scheduled',
    coverLetter: 'Hi, I saw your post for a FinTech dashboard. Having built multi-tenant SaaS financial tools with Laravel & React, I can guarantee sub-100ms API query performance...',
    screeningAnswers: [
      { question: 'Do you have experience with Stripe Connect?', answer: 'Yes, built multi-party marketplace payouts handling $500k monthly volume.' }
    ],
    attachments: ['FinTech_Case_Study.pdf'],
    tone: 'Direct',
    length: 'Short'
  },
  {
    id: 'app-102',
    jobId: 'job-prev-2',
    jobTitle: 'REST API Infrastructure Refactoring',
    clientName: 'CloudScale Systems',
    clientSpent: '$45K+',
    clientRating: 4.8,
    opportunityScore: 89,
    confidence: 'High',
    proposedBid: '$1,800',
    connectsUsed: 14,
    status: 'Submitted',
    appliedDate: 'Oct 2, 2026',
    outcome: 'Client Viewed Proposal',
    coverLetter: 'Hello, your API bottleneck issue is usually related to N+1 query execution or unindexed foreign keys. Here is how I solved this exact problem for a cloud dashboard client...',
    screeningAnswers: [],
    attachments: [],
    tone: 'Technical',
    length: 'Balanced'
  }
];

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Wajid',
  title: 'Senior Full-Stack Engineer (Laravel / React / Next.js)',
  hourlyRate: '$85.00/hr',
  jss: '100% Job Success',
  skills: ['Laravel', 'React', 'Next.js', 'TypeScript', 'Node.js', 'REST API', 'PostgreSQL', 'Tailwind CSS', 'AWS'],
  totalHours: '1,450+',
  jobsCompleted: 48,
  categories: ['Web Development', 'Full-Stack Development', 'API Integration & Middleware'],
  preferences: {
    preferredJobTypes: ['Fixed Price', 'Hourly ($75+/hr)'],
    minFixedBudget: 1500,
    minHourlyRate: 75,
    strongestSkills: ['Laravel 11', 'React 19', 'Next.js App Router', 'REST APIs'],
    preferredIndustries: ['SaaS', 'FinTech', 'Developer Tools'],
    avoidedCategories: ['WordPress Themes', 'Unfiltered Data Scraping'],
    availability: '30+ hrs / week',
    defaultTone: 'Direct',
    defaultLength: 'Short',
    minScore: 75,
    minClientRating: 4.8
  },
  portfolio: [
    {
      id: 'port-1',
      title: 'Multi-Tenant SaaS Analytics Dashboard',
      technologies: ['Laravel 11', 'React 19', 'Tailwind CSS', 'Stripe'],
      description: 'Built a high-performance multi-tenant web application handling real-time revenue analytics for 50,000 monthly active users.',
      outcome: 'Reduced page load times by 65% and achieved 99.98% API availability.'
    },
    {
      id: 'port-2',
      title: 'High-Throughput Microservice API Gateway',
      technologies: ['Node.js', 'TypeScript', 'Redis', 'Docker'],
      description: 'Designed and deployed an API gateway service managing webhook dispatching and automated rate limiting.',
      outcome: 'Processed over 2 million daily events with 0 dropped webhooks.'
    },
    {
      id: 'port-3',
      title: 'Real-Time Workflow Collaboration Hub',
      technologies: ['Next.js App Router', 'WebSockets', 'PostgreSQL'],
      description: 'Created an interactive canvas portal for cross-functional engineering teams.',
      outcome: 'Adopted by 14 enterprise clients within 3 months of launch.'
    }
  ]
};

export class MockUpworkService {
  private jobs: Job[] = INITIAL_JOBS;
  private applications: Application[] = INITIAL_APPLICATIONS;
  private connects: number = 147;
  private connected: boolean = true;
  private profile: UserProfile = INITIAL_USER_PROFILE;

  constructor() {
    this.loadFromStorage();
  }

  private isClient(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private loadFromStorage() {
    if (!this.isClient()) return;
    try {
      const savedApps = localStorage.getItem('uoi_applications');
      if (savedApps) {
        this.applications = JSON.parse(savedApps);
      }

      const savedProfile = localStorage.getItem('uoi_profile');
      if (savedProfile) {
        this.profile = JSON.parse(savedProfile);
      }

      const savedJobIds = JSON.parse(localStorage.getItem('uoi_saved_job_ids') || '[]');
      const skippedJobIds = JSON.parse(localStorage.getItem('uoi_skipped_job_ids') || '[]');

      this.jobs = INITIAL_JOBS.map(j => ({
        ...j,
        saved: savedJobIds.includes(j.id),
        skipped: skippedJobIds.includes(j.id)
      }));
    } catch (e) {
      console.error('Error loading mock data from localStorage:', e);
    }
  }

  private persistStorage() {
    if (!this.isClient()) return;
    try {
      localStorage.setItem('uoi_applications', JSON.stringify(this.applications));
      localStorage.setItem('uoi_profile', JSON.stringify(this.profile));

      const savedIds = this.jobs.filter(j => j.saved).map(j => j.id);
      const skippedIds = this.jobs.filter(j => j.skipped).map(j => j.id);
      localStorage.setItem('uoi_saved_job_ids', JSON.stringify(savedIds));
      localStorage.setItem('uoi_skipped_job_ids', JSON.stringify(skippedIds));
    } catch (e) {
      console.error('Error saving mock data to localStorage:', e);
    }
  }

  public getProfile(): UserProfile {
    return this.profile;
  }

  public getUserProfile(): UserProfile {
    return this.profile;
  }

  public updateUserProfile(updated: Partial<UserProfile>): UserProfile {
    this.profile = { ...this.profile, ...updated };
    this.persistStorage();
    return this.profile;
  }

  public getConnectBalance(): number {
    return this.connects;
  }

  public getAvailableConnects(): number {
    return this.connects;
  }

  public deductConnects(amount: number): boolean {
    if (this.connects >= amount) {
      this.connects -= amount;
      this.persistStorage();
      return true;
    }
    return false;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public refreshConnection(): boolean {
    this.connected = true;
    this.persistStorage();
    return true;
  }

  public disconnect(): boolean {
    this.connected = false;
    this.persistStorage();
    return true;
  }

  public getJobs(): Job[] {
    return this.jobs;
  }

  public getRecommendedJobs(): Job[] {
    return this.jobs.filter(j => !j.skipped);
  }

  public getJob(id: string): Job | undefined {
    return this.jobs.find(j => j.id === id);
  }

  public getJobById(id: string): Job | undefined {
    return this.jobs.find(j => j.id === id);
  }

  public getClient(jobId: string) {
    const job = this.getJob(jobId);
    return job ? job.client : null;
  }

  public saveJob(jobId: string): boolean {
    return this.toggleSaveJob(jobId);
  }

  public toggleSaveJob(jobId: string): boolean {
    const job = this.getJobById(jobId);
    if (job) {
      job.saved = !job.saved;
      this.persistStorage();
      return !!job.saved;
    }
    return false;
  }

  public skipJob(jobId: string): boolean {
    const job = this.getJobById(jobId);
    if (job) {
      job.skipped = true;
      this.persistStorage();
      return true;
    }
    return false;
  }

  public unskipJob(jobId: string): boolean {
    const job = this.getJobById(jobId);
    if (job) {
      job.skipped = false;
      this.persistStorage();
      return true;
    }
    return false;
  }

  public searchJobs(
    query: string,
    filters?: {
      category?: string;
      jobType?: string;
      minBudget?: number;
      minScore?: number;
      experienceLevel?: string;
      minRating?: number;
      minSpend?: string;
      sort?: string;
      includeSkipped?: boolean;
    }
  ): Job[] {
    let result = [...this.jobs];

    if (!filters?.includeSkipped) {
      result = result.filter(j => !j.skipped);
    }

    if (query) {
      const q = query.toLowerCase();
      result = result.filter(j => 
        j.title.toLowerCase().includes(q) || 
        j.description.toLowerCase().includes(q) ||
        j.skillTags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (filters) {
      if (filters.category && filters.category !== 'All Categories') {
        result = result.filter(j => j.category === filters.category);
      }
      if (filters.jobType && filters.jobType !== 'All') {
        result = result.filter(j => j.budgetType === filters.jobType?.toLowerCase());
      }
      if (filters.minBudget && filters.minBudget > 0) {
        result = result.filter(j => j.rawBudget >= (filters.minBudget || 0));
      }
      if (filters.minScore && filters.minScore > 0) {
        result = result.filter(j => j.opportunityScore >= (filters.minScore || 0));
      }
      if (filters.minRating && filters.minRating > 0) {
        result = result.filter(j => j.client.rating >= (filters.minRating || 0));
      }
      if (filters.sort) {
        if (filters.sort === 'Best Match' || filters.sort === 'Opportunity Score') {
          result.sort((a, b) => b.opportunityScore - a.opportunityScore);
        } else if (filters.sort === 'Budget') {
          result.sort((a, b) => b.rawBudget - a.rawBudget);
        } else if (filters.sort === 'Newest') {
          result.sort((a, b) => a.postedTime.localeCompare(b.postedTime));
        }
      }
    }

    return result;
  }

  public getApplications(): Application[] {
    return this.applications;
  }

  public updateApplicationStatus(appId: string, newStatus: ApplicationStatus): boolean {
    const app = this.applications.find(a => a.id === appId);
    if (app) {
      app.status = newStatus;
      if (newStatus === 'Interview') app.outcome = 'Interview Scheduled';
      if (newStatus === 'Hired') app.outcome = 'Offer Accepted / Contract Started';
      if (newStatus === 'Archived') app.outcome = 'Archived by User';
      this.persistStorage();
      return true;
    }
    return false;
  }

  public prepareProposalSubmission(jobId: string, bid: string, connectsCost: number) {
    const job = this.getJob(jobId);
    return {
      job,
      bid,
      connectsCost,
      availableConnects: this.connects,
      canSubmit: this.connects >= connectsCost
    };
  }

  public submitProposal(
    newApp: Omit<Application, 'id' | 'appliedDate' | 'status' | 'outcome'>,
    simulatedOutcome: SubmissionResultState = 'success'
  ): SubmissionResultData {
    if (simulatedOutcome === 'failed') {
      return {
        state: 'failed',
        jobTitle: newApp.jobTitle,
        bid: newApp.proposedBid,
        connectsCost: newApp.connectsUsed,
        availableConnects: this.connects,
        remainingConnects: this.connects,
        errorReason: 'Submission could not be completed due to a temporary mock network timeout.'
      };
    }

    if (simulatedOutcome === 'unknown') {
      return {
        state: 'unknown',
        jobTitle: newApp.jobTitle,
        bid: newApp.proposedBid,
        connectsCost: newApp.connectsUsed,
        availableConnects: this.connects,
        remainingConnects: this.connects,
        warningNotice: 'Submission status could not be confirmed. Gateway did not return an acknowledgment.'
      };
    }

    // Success state
    this.deductConnects(newApp.connectsUsed);
    const app: Application = {
      ...newApp,
      id: `app-${Date.now()}`,
      status: 'Submitted',
      appliedDate: 'Just now',
      outcome: 'Awaiting Client Review'
    };
    this.applications.unshift(app);
    this.persistStorage();

    return {
      state: 'success',
      jobTitle: newApp.jobTitle,
      bid: newApp.proposedBid,
      connectsCost: newApp.connectsUsed,
      availableConnects: this.connects + newApp.connectsUsed,
      remainingConnects: this.connects
    };
  }
}

export const upworkService = new MockUpworkService();
