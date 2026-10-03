import React from 'react';
import { Bookmark, Sparkles, Clock, Zap, DollarSign, EyeOff } from 'lucide-react';
import { Job } from '../types';
import { OpportunityScore } from './OpportunityScore';
import { ConfidenceBadge } from './ConfidenceBadge';
import { ClientSummary } from './ClientSummary';

interface JobCardProps {
  job: Job;
  onViewAnalysis: (job: Job) => void;
  onGenerateProposal: (job: Job) => void;
  onToggleSave: (jobId: string) => void;
  onSkipJob?: (jobId: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onViewAnalysis,
  onGenerateProposal,
  onToggleSave,
  onSkipJob
}) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-all shadow-2xs p-5 flex flex-col justify-between gap-4">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                {job.category}
              </span>
              <ConfidenceBadge confidence={job.confidence} size="sm" />
            </div>

            <h3
              className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
              onClick={() => onViewAnalysis(job)}
            >
              {job.title}
            </h3>

            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1 font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                <DollarSign className="w-3 h-3 text-slate-700" />
                {job.budget}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {job.postedTime}
              </span>
              <span>•</span>
              <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                {job.experienceLevel}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                <Zap className="w-3 h-3 fill-blue-600" />
                {job.connectsRequired} Connects
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <OpportunityScore score={job.opportunityScore} size="sm" />
            <button
              onClick={() => onToggleSave(job.id)}
              className={`p-1.5 rounded-md border transition-colors ${
                job.saved
                  ? 'bg-amber-50 border-amber-300 text-amber-600'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
              title={job.saved ? 'Saved' : 'Save Job'}
            >
              <Bookmark className={`w-4 h-4 ${job.saved ? 'fill-amber-500' : ''}`} />
            </button>
            {onSkipJob && (
              <button
                onClick={() => onSkipJob(job.id)}
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                title="Skip Job (hide from recommendations)"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Short AI Recommendation */}
        <div className="mt-3.5 p-2.5 rounded-md bg-blue-50/70 border border-blue-100/80 flex items-start gap-2.5 text-xs text-blue-950">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">
            <strong className="font-semibold text-blue-900">AI Profile Match Insight:</strong> {job.shortRecommendation}
          </p>
        </div>

        {/* Client & Skills */}
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
          <ClientSummary client={job.client} compact={true} />

          <div className="flex flex-wrap gap-1.5">
            {job.skillTags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
        <button
          onClick={() => onViewAnalysis(job)}
          className="px-3.5 py-1.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          View Analysis
        </button>
        <button
          onClick={() => onGenerateProposal(job)}
          className="px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Generate Proposal
        </button>
      </div>
    </div>
  );
};
