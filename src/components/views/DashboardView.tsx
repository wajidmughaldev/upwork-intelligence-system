import React, { useState } from 'react';
import { Job } from '../../types';
import { UpworkConnectionStatus, UpworkConnectsData } from '../../services/UpworkApiService';

interface DashboardViewProps {
  availableConnects: number | null;
  connectionStatus?: UpworkConnectionStatus | null;
  connectsData?: UpworkConnectsData | null;
  jobs: Job[];
  applicationsCount: number;
  onViewAnalysis: (job: Job) => void;
  onGenerateProposal: (job: Job) => void;
  onToggleSave: (jobId: string) => void;
  onSkipJob: (jobId: string) => void;
  onGoToSearch: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  availableConnects,
  connectionStatus,
  connectsData,
  jobs,
  applicationsCount,
  onViewAnalysis,
  onGenerateProposal,
  onToggleSave,
  onGoToSearch,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'high' | 'fixed' | 'hourly'>('all');
  const [sortBy, setSortBy] = useState<string>('highest_score');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 4;

  // Filter jobs according to selected tab
  const filteredJobs = jobs.filter((job) => {
    if (filterTab === 'high') return job.opportunityScore >= 90;
    if (filterTab === 'fixed') return job.budgetType === 'fixed';
    if (filterTab === 'hourly') return job.budgetType === 'hourly';
    return true;
  });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'highest_score') return b.opportunityScore - a.opportunityScore;
    if (sortBy === 'newest') return a.postedTime.localeCompare(b.postedTime);
    if (sortBy === 'highest_budget') {
      return (b.rawBudget || 0) - (a.rawBudget || 0);
    }
    if (sortBy === 'client_spent') {
      const getSpendNum = (s: string) => {
        const cleaned = s.replace(/[^0-9.]/g, '');
        const val = parseFloat(cleaned) || 0;
        return s.toLowerCase().includes('k') ? val * 1000 : s.toLowerCase().includes('m') ? val * 1000000 : val;
      };
      return getSpendNum(b.client.totalSpent) - getSpendNum(a.client.totalSpent);
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedJobs.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentJobs = sortedJobs.slice(startIndex, startIndex + itemsPerPage);

  const strongMatchesCount = jobs.filter((j) => j.opportunityScore >= 90).length;
  const fixedPriceCount = jobs.filter((j) => jobTypeIsFixed(j)).length;
  const hourlyCount = jobs.filter((j) => !jobTypeIsFixed(j)).length;

  function jobTypeIsFixed(j: Job) {
    return j.budgetType === 'fixed';
  }


  return (
    <div className="pt-6 pb-16 px-8 max-w-7xl mx-auto">
      {/* Top Summary Metrics Row (4 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Metric 1: Upwork Account */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Upwork Account</span>
            <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${
              connectionStatus?.connected
                ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                : 'text-amber-700 bg-amber-50 border-amber-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                connectionStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}></span>
              {connectionStatus?.connected ? 'Active' : 'Offline'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              {connectionStatus?.connected
                ? 'Connected'
                : connectionStatus?.status === 'selection_required'
                ? 'Selection Required'
                : connectionStatus?.status === 'no_eligible_account'
                ? 'No Eligible Account'
                : connectionStatus?.status === 'reconnect_required'
                ? 'Reconnect Required'
                : 'Disconnected'}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 truncate">
            <span className="material-symbols-outlined text-sm text-slate-400">account_circle</span>
            <span className="truncate">{connectionStatus?.accountName || 'No account connected'}</span>
          </div>
        </div>

        {/* Metric 2: Available Connects */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Available Connects</span>
            <span className="material-symbols-outlined text-blue-600 text-lg">toll</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              {availableConnects !== null ? availableConnects : '—'}
            </span>
            <span className="text-xs text-slate-400">tokens</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-slate-400">info</span>
            <span>{connectsData?.membershipType ? `${connectsData.membershipType} Plan` : 'Upwork Balance'}</span>
          </div>
        </div>

        {/* Metric 3: Strong Matches */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Strong Matches</span>
            <span className="material-symbols-outlined text-emerald-600 text-lg">auto_awesome</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight text-slate-900">{strongMatchesCount}</span>
            <span className="text-xs text-slate-400">opportunities</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">add_circle</span>
            <span>+3 new since yesterday</span>
          </div>
        </div>

        {/* Metric 4: Total Applications */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Proposals</span>
            <span className="material-symbols-outlined text-slate-400 text-lg">send</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight text-slate-900">{applicationsCount}</span>
            <span className="text-xs text-slate-400">in pipeline</span>
          </div>
          <div className="mt-2 text-xs text-slate-600 flex items-center gap-1">
            <span className="font-medium text-amber-700">3 awaiting reply</span>
            <span className="text-slate-300">•</span>
            <span className="font-medium text-blue-700">1 interview</span>
          </div>
        </div>
      </div>

      {/* Main Section Header & Filters */}
      <div className="mb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 font-headline tracking-tight">Top Opportunities</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-scored opportunities matched against your profile skills, rate history, and past project wins.
          </p>
        </div>

        {/* Action & View Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs text-xs">
            <button
              onClick={() => { setFilterTab('all'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                filterTab === 'all' ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              All Matches ({jobs.length})
            </button>
            <button
              onClick={() => { setFilterTab('high'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                filterTab === 'high' ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              High Score &gt; 90 ({strongMatchesCount})
            </button>
            <button
              onClick={() => { setFilterTab('fixed'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                filterTab === 'fixed' ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              Fixed Price ({fixedPriceCount})
            </button>
            <button
              onClick={() => { setFilterTab('hourly'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                filterTab === 'hourly' ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              Hourly ({hourlyCount})
            </button>
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-700 font-medium shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              <option value="highest_score">Highest Match Score</option>
              <option value="newest">Newest Posted</option>
              <option value="highest_budget">Highest Budget</option>
              <option value="client_spent">Client Spent: High to Low</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Job Cards List */}
      <div className="space-y-3.5">
        {currentJobs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
            <p className="text-sm font-medium">No opportunities match this filter.</p>
            <button
              onClick={() => setFilterTab('all')}
              className="mt-3 text-xs text-blue-600 font-medium hover:underline"
            >
              Reset to all matches
            </button>
          </div>
        ) : (
          currentJobs.map((job) => {
            const isHighScore = job.opportunityScore >= 90;
            const scoreLabel = isHighScore ? 'Exceptional Match' : 'Strong Match';

            return (
              <div
                key={job.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-xs transition-all duration-150"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isHighScore
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isHighScore ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                        {job.opportunityScore} / 100 • {scoreLabel}
                      </span>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        <span
                          className="material-symbols-outlined text-xs text-blue-600"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          verified
                        </span>
                        Verified Payment ★ {job.client.rating.toFixed(1)} ({job.client.reviewsCount || 48} reviews)
                      </span>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                        <span
                          className="material-symbols-outlined text-xs text-purple-600"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          military_tech
                        </span>
                        Enterprise Client
                      </span>
                    </div>

                    <h2
                      onClick={() => onViewAnalysis(job)}
                      className="text-base font-semibold text-slate-900 pt-1 hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      {job.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                      <span className="text-slate-900 font-semibold">{job.budget}</span>
                      <span>•</span>
                      <span>Posted {job.postedTime}</span>
                      <span>•</span>
                      <span>{job.experienceLevel} Level</span>
                      <span>•</span>
                      <span className="text-slate-600">{job.connectsRequired} Connects required</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleSave(job.id)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      job.saved
                        ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                        : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100'
                    }`}
                    title={job.saved ? 'Remove from Saved' : 'Save Job'}
                  >
                    <span
                      className="material-symbols-outlined text-lg"
                      style={job.saved ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      bookmark
                    </span>
                  </button>
                </div>

                {/* Client Info Details Strip */}
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <span className="material-symbols-outlined text-sm text-slate-400">domain</span>
                  <span className="font-medium">{job.client.totalSpent} spent</span>
                  <span>•</span>
                  <span>{job.client.hireRate || '94%'} hire rate</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-slate-400">public</span>
                    {job.client.location}
                  </span>
                </div>

                {/* AI Recommendation Box */}
                <div className="mt-3 bg-blue-50/70 border border-blue-100 rounded-lg p-2.5 text-xs text-blue-900 flex items-start gap-2">
                  <span className="material-symbols-outlined text-base text-blue-600 shrink-0 mt-0.5">
                    lightbulb
                  </span>
                  <p className="leading-relaxed">
                    <span className="font-semibold text-blue-950">AI Analysis:</span> {job.shortRecommendation}
                  </p>
                </div>

                {/* Skills and CTA Controls */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {job.skillTags.map((skill: string) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => onViewAnalysis(job)}
                      className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                      View Analysis
                    </button>
                    <button
                      onClick={() => onGenerateProposal(job)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">auto_fix_high</span>
                      <span>Generate Proposal</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination / Footer Info */}
      <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500">
        <div>
          Showing <span className="font-medium text-slate-900">{Math.min(currentJobs.length, sortedJobs.length)}</span> of{' '}
          <span className="font-medium text-slate-900">{sortedJobs.length}</span> high-scored opportunities
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`px-2.5 py-1 border border-slate-200 rounded transition-colors ${
              currentPage === 1
                ? 'text-slate-400 bg-slate-50 cursor-not-allowed'
                : 'text-slate-700 hover:bg-slate-50 cursor-pointer'
            }`}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-2.5 py-1 border rounded transition-colors cursor-pointer ${
                currentPage === i + 1
                  ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`px-2.5 py-1 border border-slate-200 rounded transition-colors ${
              currentPage === totalPages
                ? 'text-slate-400 bg-slate-50 cursor-not-allowed'
                : 'text-slate-700 hover:bg-slate-50 cursor-pointer'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
