import React, { useState } from 'react';
import { Job, UserProfile } from '../../types';

interface JobAnalysisViewProps {
  job: Job;
  profile: UserProfile;
  onBack: () => void;
  onGenerateProposal: (job: Job) => void;
  onToggleSave: (jobId: string) => void;
  onSkipJob: (jobId: string) => void;
}

export const JobAnalysisView: React.FC<JobAnalysisViewProps> = ({
  job,
  onBack,
  onGenerateProposal,
  onToggleSave,
  onSkipJob,
}) => {
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handleCopyProof = (title: string) => {
    navigator.clipboard.writeText(title);
    setCopiedLink(title);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const confidenceLevel = job.confidence || (job.opportunityScore >= 85 ? 'High' : job.opportunityScore >= 70 ? 'Medium' : 'Low');
  const confidenceColor = confidenceLevel === 'High' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : confidenceLevel === 'Medium' ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-amber-700 bg-amber-50 border-amber-200';

  const signals = job.scoreBreakdown || {
    technicalMatch: 24,
    relevantExperience: 14,
    portfolioProof: 14,
    clientQuality: 14,
    budgetFit: 9,
    jobClarity: 9,
    connectEfficiency: 5,
    preferences: 4,
  };

  return (
    <div className="pb-28 pt-6">
      <div className="max-w-7xl mx-auto px-6 space-y-6">
        {/* 1. JOB DETAIL HEADER SECTION */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col gap-4">
            {/* Back Link & Meta */}
            <div className="flex items-center justify-between">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>Back to Jobs</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active Opportunity
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: #{job.id.toUpperCase()}</span>
              </div>
            </div>

            {/* Title & Badges & Quick Action Cluster */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-2">
                  <h2 className="text-xl font-bold font-headline text-slate-950 tracking-tight">
                    {job.title}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="material-symbols-outlined text-xs fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                    Verified Payment ★ {job.client.rating.toFixed(1)} ({job.client.reviewsCount || 48} reviews)
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    <span className="material-symbols-outlined text-xs">public</span>
                    {job.client.location}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    <span className="material-symbols-outlined text-xs">domain</span>
                    {job.client.feedbackSummary || 'Enterprise / Verified'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-900">
                    {job.budget} {job.budgetType === 'fixed' ? 'Fixed-Price' : '/ hr'}
                  </span>
                  <span>•</span>
                  <span>{job.experienceLevel} Level</span>
                  <span>•</span>
                  <span>Posted {job.postedTime}</span>
                  <span>•</span>
                  <span className="text-amber-700 font-medium">{job.connectsRequired} Connects required</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-medium">{job.client.hireRate || 94}% hire rate</span>
                </p>
              </div>

              {/* Quick Header Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowBriefModal(true)}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  <span>View Original Job Brief</span>
                </button>

                <a
                  href={`https://www.upwork.com/jobs/${job.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  <span>Open on Upwork</span>
                </a>

                <button
                  onClick={() => onToggleSave(job.id)}
                  className={`inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    job.saved
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm" style={job.saved ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    bookmark
                  </span>
                  <span>{job.saved ? 'Saved' : 'Save Job'}</span>
                </button>

                <button
                  onClick={() => onGenerateProposal(job)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  <span>Generate Proposal</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. PRIMARY SCORE CARD & OVERVIEW BENTO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Score Hero (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 p-6 shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Radial Score Circle */}
                <div className="relative flex items-center justify-center h-24 w-24 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className={job.opportunityScore >= 90 ? 'text-emerald-500' : 'text-blue-500'}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray={`${job.opportunityScore}, 100`}
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-bold font-headline text-slate-900">{job.opportunityScore}</span>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">/ 100</span>
                  </div>
                </div>

                {/* Match Rating & Synopsis */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      job.opportunityScore >= 90
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                    }`}>
                      {job.opportunityScore >= 90 ? 'Strong Match' : 'Good Match'}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">Opportunity Score</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Top {job.opportunityScore >= 90 ? '5%' : '15%'} match for your profile
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-md">
                    {job.shortRecommendation || job.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Metric Ribbons - Confidence & Efficiency */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg">verified</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[11px] text-slate-500 font-medium">Analysis Confidence</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${confidenceColor}`}>
                      {confidenceLevel}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">High signal certainty based on verified roster</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg">savings</span>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Projected ROI</p>
                  <p className="text-sm font-bold text-slate-900">
                    ~$142 <span className="text-xs font-normal text-slate-500">/ connect efficiency</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. SCORE BREAKDOWN GRID (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold font-headline uppercase tracking-wider text-slate-500">
                Signal Breakdown
              </h4>
              <span className="text-xs font-medium text-blue-600">8 Vector Analysis</span>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
              {/* Technical Match */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-600">Technical Match</span>
                  <span className="font-semibold text-slate-900">{signals.technicalMatch}/25</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(signals.technicalMatch / 25) * 100}%` }}></div>
                </div>
              </div>

              {/* Relevant Experience */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-600">Relevant Experience</span>
                  <span className="font-semibold text-slate-900">{signals.relevantExperience}/15</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(signals.relevantExperience / 15) * 100}%` }}></div>
                </div>
              </div>

              {/* Portfolio Proof */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-600">Portfolio Proof</span>
                  <span className="font-semibold text-slate-900">{signals.portfolioProof}/15</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(signals.portfolioProof / 15) * 100}%` }}></div>
                </div>
              </div>

              {/* Client Quality */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-600">Client Quality</span>
                  <span className="font-semibold text-slate-900">{signals.clientQuality}/15</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(signals.clientQuality / 15) * 100}%` }}></div>
                </div>
              </div>

              {/* Budget Fit */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-600">Budget Fit</span>
                  <span className="font-semibold text-slate-900">{signals.budgetFit}/10</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${(signals.budgetFit / 10) * 100}%` }}></div>
                </div>
              </div>

              {/* Job Clarity */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-600">Job Clarity</span>
                  <span className="font-semibold text-slate-900">{signals.jobClarity}/10</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(signals.jobClarity / 10) * 100}%` }}></div>
                </div>
              </div>

              {/* Connect Efficiency */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-600">Connect Efficiency</span>
                  <span className="font-semibold text-slate-900">{signals.connectEfficiency}/5</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${(signals.connectEfficiency / 5) * 100}%` }}></div>
                </div>
              </div>

              {/* Preferences Alignment */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-600">Preferences Alignment</span>
                  <span className="font-semibold text-slate-900">{signals.preferences}/5</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${(signals.preferences / 5) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. MAIN ANALYSIS CONTENT PANELS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel 1: Why This Matches You */}
          <div className="bg-white rounded-lg border border-emerald-200/90 shadow-xs p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                <h3 className="text-sm font-bold font-headline text-slate-900">Why This Matches You</h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                High Advantage
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-emerald-600 text-sm mt-0.5 shrink-0">task_alt</span>
                <span>
                  <strong>Technical Stack Synergy:</strong> Exact match with your core specialization in {job.skillTags?.slice(0, 3).join(', ')}.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-emerald-600 text-sm mt-0.5 shrink-0">task_alt</span>
                <span>
                  <strong>Budget Alignment:</strong> {job.budget} {job.budgetType === 'fixed' ? 'fixed milestone' : 'hourly'} perfectly matches your target execution velocity.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-emerald-600 text-sm mt-0.5 shrink-0">task_alt</span>
                <span>
                  <strong>Rapid Decision-Maker:</strong> Client historically completes first hire within <strong>2.1 days</strong> of listing creation.
                </span>
              </div>
            </div>

            {/* Matched Skills Pills */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Matched Skills (100% Verified)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {job.skillTags?.map((skill) => (
                  <span key={skill} className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-medium text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Panel 2: Why You May Want to Skip (Risk Radar) */}
          <div className="bg-white rounded-lg border border-amber-200/90 shadow-xs p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600">warning</span>
                <h3 className="text-sm font-bold font-headline text-slate-900">Why You May Want to Skip (Risk Radar)</h3>
              </div>
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                3 Friction Factors
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-2.5 p-2 rounded bg-amber-50/50 border border-amber-100">
                <span className="material-symbols-outlined text-amber-600 text-sm mt-0.5 shrink-0">alarm</span>
                <div>
                  <strong className="text-amber-900">Aggressive 2-Week Window:</strong>
                  <p className="text-slate-600 mt-0.5">
                    The job post requests a complete MVP launch within 14 calendar days. Requires clear scope boundaries upfront.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded bg-amber-50/50 border border-amber-100">
                <span className="material-symbols-outlined text-amber-600 text-sm mt-0.5 shrink-0">group</span>
                <div>
                  <strong className="text-amber-900">Proposal Competition Velocity:</strong>
                  <p className="text-slate-600 mt-0.5">
                    Already 15-20 proposals submitted in first 40 minutes. You need an immediate high-relevance pitch to stay on top.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded bg-amber-50/50 border border-amber-100">
                <span className="material-symbols-outlined text-amber-600 text-sm mt-0.5 shrink-0">schedule</span>
                <div>
                  <strong className="text-amber-900">Timezone Standup Offset:</strong>
                  <p className="text-slate-600 mt-0.5">
                    Client specifies mandatory 9:00 AM EST sync calls. Ensure morning availability matches your current schedule.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 3: Client Intelligence & History */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">account_balance</span>
                <h3 className="text-sm font-bold font-headline text-slate-900">Client Intelligence &amp; History</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Member since 2019</span>
            </div>

            {/* Quick Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400">Total Spend</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{job.client.totalSpent}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400">Hire Rate</p>
                <p className="text-sm font-bold text-emerald-600 mt-0.5">{job.client.hireRate || 85}%</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400">Jobs Posted</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">42 jobs</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400">Avg Hourly Paid</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">$78/hr</p>
              </div>
            </div>

            {/* Verified Sentiment Summary */}
            <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900 mb-1">
                <span className="material-symbols-outlined text-sm">forum</span>
                <span>Verified Sentiment Summary</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                "Great communicator, pays promptly without milestone disputes, appreciates clear documentation and proactive status updates. 3 active hires currently ongoing."
              </p>
            </div>
          </div>

          {/* Panel 4: Relevant Experience & Proof to Pitch */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">folder_special</span>
                <h3 className="text-sm font-bold font-headline text-slate-900">Relevant Experience &amp; Proof to Pitch</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Mapped to Client Spec</span>
            </div>

            <div className="space-y-2.5">
              {/* Item 1 */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 bg-white hover:bg-slate-50/60 transition-colors">
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900 truncate">Multi-Tenant SaaS Dashboard (Laravel + React)</p>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">98% Match</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">Live production platform with Inertia.js, Stripe subscriptions, and team RBAC.</p>
                </div>
                <button
                  onClick={() => handleCopyProof('Multi-Tenant SaaS Dashboard (Laravel + React)')}
                  className="shrink-0 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                  title="Copy Proof to Clipboard"
                >
                  <span className="material-symbols-outlined text-sm">
                    {copiedLink === 'Multi-Tenant SaaS Dashboard (Laravel + React)' ? 'done' : 'content_copy'}
                  </span>
                </button>
              </div>

              {/* Item 2 */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 bg-white hover:bg-slate-50/60 transition-colors">
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900 truncate">High-Throughput E-commerce REST API</p>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">92% Match</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">Handled 12k concurrent requests via Laravel Octane, Redis queue workers &amp; AWS.</p>
                </div>
                <button
                  onClick={() => handleCopyProof('High-Throughput E-commerce REST API')}
                  className="shrink-0 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                  title="Copy Proof to Clipboard"
                >
                  <span className="material-symbols-outlined text-sm">
                    {copiedLink === 'High-Throughput E-commerce REST API' ? 'done' : 'content_copy'}
                  </span>
                </button>
              </div>

              {/* Item 3 */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 bg-white hover:bg-slate-50/60 transition-colors">
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900 truncate">Healthcare Portal with Real-Time Analytics</p>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">89% Match</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">HIPAA compliant patient dashboard built with React 18, Tailwind, and WebSockets.</p>
                </div>
                <button
                  onClick={() => handleCopyProof('Healthcare Portal with Real-Time Analytics')}
                  className="shrink-0 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                  title="Copy Proof to Clipboard"
                >
                  <span className="material-symbols-outlined text-sm">
                    {copiedLink === 'Healthcare Portal with Real-Time Analytics' ? 'done' : 'content_copy'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 5: Suggested Proposal & Strategic Approach (Full Width) */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded bg-blue-600 text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-base">lightbulb</span>
              </div>
              <div>
                <h3 className="text-sm font-bold font-headline text-slate-900">
                  Suggested Proposal &amp; Strategic Approach
                </h3>
                <p className="text-[11px] text-slate-500">AI-generated high-converting pitch blueprint</p>
              </div>
            </div>
            <button
              onClick={() => alert('Angle regenerated with emphasis on rapid MVP turnaround.')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              <span>Regenerate Angle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Column 1: Recommended Pitch Hook */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <span className="material-symbols-outlined text-blue-600 text-sm">flag</span>
                <span>1. Recommended Pitch Hook</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Open directly by referencing their deadline: <em>"I reviewed your requirements for the {job.title}. I have production-tested scaffolding that shaves 5 days off development time."</em>
              </p>
            </div>

            {/* Column 2: Architecture Recommendation */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <span className="material-symbols-outlined text-blue-600 text-sm">architecture</span>
                <span>2. Architecture Recommendation</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Advise modular monolithic backend with decoupled frontend. Suggest using Vite for instant HMR and Tailwind CSS for rapid prototyping without technical debt.
              </p>
            </div>

            {/* Column 3: 14-Day Delivery Milestones */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <span className="material-symbols-outlined text-blue-600 text-sm">timeline</span>
                <span>3. 14-Day Milestone Plan</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li><strong>Days 1–4:</strong> DB Schema, Multi-tenant Auth &amp; Seeders</li>
                <li><strong>Days 5–10:</strong> Core CRUD, React Components &amp; API endpoints</li>
                <li><strong>Days 11–14:</strong> QA Testing, CI/CD setup, Cloud deployment</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 5. STICKY BOTTOM ACTION BAR */}
      <footer className="fixed bottom-0 right-0 left-64 bg-white/95 backdrop-blur-sm border-t border-slate-200 py-3 px-8 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left side: Status indicators */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <span className="material-symbols-outlined text-amber-600 text-base">toll</span>
              <span>{job.connectsRequired} Connects needed</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-900 font-semibold">147 Available</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
              <span className="material-symbols-outlined text-xs">verified_user</span>
              <span>Safe Match Verified</span>
            </div>
          </div>

          {/* Right side: Primary CTA Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSkipJob(job.id)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              Skip Job
            </button>
            <button
              onClick={() => onToggleSave(job.id)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm" style={job.saved ? { fontVariationSettings: "'FILL' 1" } : {}}>
                bookmark
              </span>
              <span>{job.saved ? 'Saved' : 'Save Job'}</span>
            </button>
            <button
              onClick={() => onGenerateProposal(job)}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              <span>Generate AI Proposal</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modal: View Original Job Brief */}
      {showBriefModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-headline">Original Job Brief</h3>
                <p className="text-xs text-slate-500 mt-0.5">As posted on Upwork • ID #{job.id}</p>
              </div>
              <button
                onClick={() => setShowBriefModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="overflow-y-auto my-4 space-y-4 text-xs text-slate-700 leading-relaxed pr-2">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <h4 className="font-semibold text-slate-900 mb-1">{job.title}</h4>
                <p className="text-slate-500 text-[11px]">
                  Budget: {job.budget} ({job.budgetType === 'fixed' ? 'Fixed' : 'Hourly'}) • Client: {job.client?.location} • Rating: ★ {job.client?.rating}
                </p>
              </div>

              <div>
                <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">Full Job Description:</h5>
                <div className="whitespace-pre-line text-slate-800 bg-slate-50/50 p-4 rounded-lg border border-slate-200 font-sans text-xs">
                  {job.originalBrief?.description || job.description}
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">Required Skills:</h5>
                <div className="flex flex-wrap gap-1.5">
                  {job.skillTags?.map((skill) => (
                    <span key={skill} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowBriefModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowBriefModal(false);
                  onGenerateProposal(job);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Generate Proposal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
