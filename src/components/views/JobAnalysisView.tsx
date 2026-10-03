import React from 'react';
import { ArrowLeft, Sparkles, CheckCircle2, AlertTriangle, Bookmark, Lightbulb, EyeOff } from 'lucide-react';
import { Job, UserProfile } from '../../types';
import { OpportunityScore } from '../OpportunityScore';
import { ConfidenceBadge } from '../ConfidenceBadge';
import { ClientSummary } from '../ClientSummary';
import { ScoreBreakdown } from '../ScoreBreakdown';
import { JobBrief } from '../JobBrief';

interface JobAnalysisViewProps {
  job: Job;
  profile: UserProfile;
  onBack: () => void;
  onGenerateProposal: (job: Job) => void;
  onToggleSave: (jobId: string) => void;
  onSkipJob?: (jobId: string) => void;
}

export const JobAnalysisView: React.FC<JobAnalysisViewProps> = ({
  job,
  profile,
  onBack,
  onGenerateProposal,
  onToggleSave,
  onSkipJob
}) => {
  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </button>
        <div className="flex items-center gap-2">
          {onSkipJob && (
            <button
              onClick={() => onSkipJob(job.id)}
              className="px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Skip this job"
            >
              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
              Skip Job
            </button>
          )}
          <button
            onClick={() => onToggleSave(job.id)}
            className={`px-3 py-1.5 rounded-md border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              job.saved
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${job.saved ? 'fill-amber-500' : ''}`} />
            {job.saved ? 'Saved Job' : 'Save Job'}
          </button>
          <button
            onClick={() => onGenerateProposal(job)}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate Proposal
          </button>
        </div>
      </div>

      {/* Main Job Detail Header Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-100 font-bold uppercase text-[10px]">
                {job.category}
              </span>
              <span>•</span>
              <span>{job.budgetType.toUpperCase()} JOB</span>
              <span>•</span>
              <span>{job.postedTime}</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
              <span>Budget: <strong className="text-slate-900 font-bold">{job.budget}</strong></span>
              <span>•</span>
              <span>Experience: <strong className="text-slate-900">{job.experienceLevel}</strong></span>
              <span>•</span>
              <span>Connects Required: <strong className="text-blue-700 font-bold">{job.connectsRequired} Connects</strong></span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <OpportunityScore score={job.opportunityScore} size="lg" />
            <ConfidenceBadge
              confidence={job.confidence}
              explanation={job.confidenceExplanation}
              size="lg"
            />
          </div>
        </div>

        {/* Fit Score Disclaimer */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-md text-[11px] text-slate-600 leading-relaxed">
          <strong className="text-slate-800 font-semibold">Profile-Fit Model:</strong> The Opportunity Score (0-100) measures alignment between your verified skills, portfolio proof, and client preferences. It does not represent an automated hiring probability.
        </div>
      </div>

      {/* Original Job Brief (Raw Upwork Posting) */}
      <JobBrief brief={job.originalBrief} />

      {/* Score Breakdown Section */}
      <ScoreBreakdown breakdown={job.scoreBreakdown} />

      {/* Two Column Matches vs Skip Signals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Why This Matches You */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-3 shadow-2xs">
          <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Why This Matches You
          </h3>
          <ul className="space-y-2 text-xs text-slate-700">
            {job.whyMatches.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-emerald-50/60 p-2.5 rounded border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Why You May Want to Skip */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-3 shadow-2xs">
          <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Why You May Want to Skip
          </h3>
          <ul className="space-y-2 text-xs text-slate-700">
            {job.whySkip.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-amber-50/60 p-2.5 rounded border border-amber-100">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Client Intelligence & Relevant Experience Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClientSummary client={job.client} compact={false} />

        {/* Relevant Experience */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Recommended Portfolio Proof
          </h4>
          <div className="space-y-2">
            {profile.portfolio.slice(0, 3).map((item, idx) => (
              <div key={idx} className="p-3 rounded border border-slate-200 bg-slate-50 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>{item.title}</span>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                    Match Confidence: High
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">{item.description}</p>
                <div className="text-[10px] font-semibold text-emerald-700 pt-0.5">
                  Outcome: {item.outcome}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suggested Approach */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-2 shadow-2xs">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          AI Proposal Engine Suggested Approach
        </h4>
        <p className="text-xs text-slate-800 leading-relaxed font-mono bg-slate-50 p-4 rounded border border-slate-200">
          {job.suggestedApproach}
        </p>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="p-4 bg-slate-900 rounded-lg text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="text-sm font-bold">Ready to apply to {job.title}?</div>
          <div className="text-xs text-slate-400">Target cover letter will be generated based on your intelligence profile.</div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {onSkipJob && (
            <button
              onClick={() => onSkipJob(job.id)}
              className="px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Skip Job
            </button>
          )}
          <button
            onClick={() => onToggleSave(job.id)}
            className="px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            {job.saved ? 'Saved' : 'Save Job'}
          </button>
          <button
            onClick={() => onGenerateProposal(job)}
            className="px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            Generate Tailored Proposal
          </button>
        </div>
      </div>
    </div>
  );
};
