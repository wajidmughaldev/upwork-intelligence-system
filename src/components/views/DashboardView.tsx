import React from 'react';
import { Zap, CheckCircle, TrendingUp, FileText, ArrowRight } from 'lucide-react';
import { Job } from '../../types';
import { JobCard } from '../JobCard';

interface DashboardViewProps {
  availableConnects: number;
  jobs: Job[];
  applicationsCount: number;
  onViewAnalysis: (job: Job) => void;
  onGenerateProposal: (job: Job) => void;
  onToggleSave: (jobId: string) => void;
  onSkipJob?: (jobId: string) => void;
  onGoToSearch: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  availableConnects,
  jobs,
  applicationsCount,
  onViewAnalysis,
  onGenerateProposal,
  onToggleSave,
  onSkipJob,
  onGoToSearch
}) => {
  const activeJobs = jobs.filter(j => !j.skipped);
  const topOpportunities = activeJobs.slice(0, 3);
  const strongMatchesCount = activeJobs.filter(j => j.opportunityScore >= 85).length;

  return (
    <div className="space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Upwork Account</div>
            <div className="text-sm font-bold text-emerald-700 flex items-center gap-1.5 mt-1">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Connected (Verified)
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
            API
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Connects</div>
            <div className="text-2xl font-extrabold text-blue-900 mt-0.5">{availableConnects}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Zap className="w-5 h-5 fill-blue-600" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Strong Matches</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{strongMatchesCount}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Applications</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{applicationsCount}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Area: Top Opportunities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Top Opportunities</h2>
            <p className="text-xs text-slate-500">AI-ranked job opportunities based on your technical profile and verified portfolio proof</p>
          </div>
          <button
            onClick={onGoToSearch}
            className="px-3.5 py-1.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <span>Explore All Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4">
          {topOpportunities.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500 text-xs">
              No top opportunities right now. Try exploring all jobs.
            </div>
          ) : (
            topOpportunities.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onViewAnalysis={onViewAnalysis}
                onGenerateProposal={onGenerateProposal}
                onToggleSave={onToggleSave}
                onSkipJob={onSkipJob}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
