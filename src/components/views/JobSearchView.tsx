import React, { useState } from 'react';
import { Search, RotateCcw, BookmarkCheck, EyeOff } from 'lucide-react';
import { Job } from '../../types';
import { JobCard } from '../JobCard';

interface JobSearchViewProps {
  jobs: Job[];
  onViewAnalysis: (job: Job) => void;
  onGenerateProposal: (job: Job) => void;
  onToggleSave: (jobId: string) => void;
  onSkipJob?: (jobId: string) => void;
}

export const JobSearchView: React.FC<JobSearchViewProps> = ({
  jobs,
  onViewAnalysis,
  onGenerateProposal,
  onToggleSave,
  onSkipJob
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'recommended' | 'search' | 'saved'>('recommended');
  const [sortBy, setSortBy] = useState('Opportunity Score');
  const [category, setCategory] = useState('All Categories');
  const [jobType, setJobType] = useState('All');
  const [minBudget, setMinBudget] = useState(0);
  const [experienceLevel, setExperienceLevel] = useState('All');

  // Categories list per specification
  const categories = [
    'All Categories',
    'Web Development',
    'AI & Machine Learning',
    'Mobile Development',
    'Design',
    'DevOps',
    'Data Science',
    'Marketing'
  ];

  // Filtering logic
  let filteredJobs = [...jobs];

  if (activeTab === 'saved') {
    filteredJobs = filteredJobs.filter(j => j.saved);
  } else if (activeTab === 'recommended') {
    // Exclude skipped jobs from recommended
    filteredJobs = filteredJobs.filter(j => !j.skipped);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredJobs = filteredJobs.filter(j =>
      j.title.toLowerCase().includes(q) ||
      j.description.toLowerCase().includes(q) ||
      j.skillTags.some(s => s.toLowerCase().includes(q))
    );
  }

  if (category !== 'All Categories') {
    filteredJobs = filteredJobs.filter(j => j.category === category);
  }

  if (jobType !== 'All') {
    filteredJobs = filteredJobs.filter(j => j.budgetType === jobType.toLowerCase());
  }

  if (minBudget > 0) {
    filteredJobs = filteredJobs.filter(j => j.rawBudget >= minBudget);
  }

  if (experienceLevel !== 'All') {
    filteredJobs = filteredJobs.filter(j => j.experienceLevel === experienceLevel);
  }

  // Sorting
  if (sortBy === 'Opportunity Score' || sortBy === 'Best Match') {
    filteredJobs.sort((a, b) => b.opportunityScore - a.opportunityScore);
  } else if (sortBy === 'Budget') {
    filteredJobs.sort((a, b) => b.rawBudget - a.rawBudget);
  } else if (sortBy === 'Newest') {
    filteredJobs.sort((a, b) => a.postedTime.localeCompare(b.postedTime));
  }

  const savedCount = jobs.filter(j => j.saved).length;

  return (
    <div className="space-y-6">
      {/* Search Header Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Job Search & Filter Engine</h2>
            <p className="text-xs text-slate-500">Discover and score live Upwork opportunities</p>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search Upwork jobs by title, keyword, or skill (e.g. Laravel, React, Next.js)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-300 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md shadow-2xs transition-colors flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" />
            Search
          </button>
        </div>

        {/* Filters Grid with Category naturally incorporated */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          {/* Category Filter */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded bg-white font-medium text-slate-800"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Job Type</label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded bg-white font-medium text-slate-800"
            >
              <option value="All">All Types (Fixed & Hourly)</option>
              <option value="Fixed">Fixed Price</option>
              <option value="Hourly">Hourly</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Minimum Budget ($)</label>
            <select
              value={minBudget}
              onChange={(e) => setMinBudget(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded bg-white font-medium text-slate-800"
            >
              <option value={0}>Any Budget</option>
              <option value={1000}>$1,000+</option>
              <option value={1500}>$1,500+</option>
              <option value={2000}>$2,000+</option>
              <option value={3000}>$3,000+</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded bg-white font-medium text-slate-800"
            >
              <option value="All">Any Experience</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={() => {
                setSearchQuery('');
                setCategory('All Categories');
                setJobType('All');
                setMinBudget(0);
                setExperienceLevel('All');
              }}
              className="w-full py-2 px-3 border border-slate-300 rounded text-slate-600 font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Tabs & Sorting Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('recommended')}
            className={`px-4 py-2 rounded-t-md font-bold text-xs transition-colors border-b-2 ${
              activeTab === 'recommended'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Recommended For Me
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-t-md font-bold text-xs transition-colors border-b-2 ${
              activeTab === 'search'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Custom Search ({filteredJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-t-md font-bold text-xs transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-amber-500" />
            Saved ({savedCount})
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-1.5 border border-slate-300 rounded bg-white font-semibold text-slate-800 focus:outline-none"
          >
            <option value="Opportunity Score">Opportunity Score (Highest)</option>
            <option value="Best Match">Best Match</option>
            <option value="Budget">Budget (High to Low)</option>
            <option value="Newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Results Job List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500 text-xs">
            No matching jobs found. Try clearing or relaxing search filters.
          </div>
        ) : (
          filteredJobs.map(job => (
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
  );
};
