import React, { useState, useMemo } from 'react';
import { Job } from '../../types';

interface JobSearchViewProps {
  jobs: Job[];
  onViewAnalysis: (job: Job) => void;
  onGenerateProposal: (job: Job) => void;
  onToggleSave: (jobId: string) => void;
  onSkipJob: (jobId: string) => void;
}

export const JobSearchView: React.FC<JobSearchViewProps> = ({
  jobs,
  onViewAnalysis,
  onGenerateProposal,
  onToggleSave,
}) => {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [keywords, setKeywords] = useState('');
  const [jobType, setJobType] = useState('all');
  const [category, setCategory] = useState('all');
  const [minBudget, setMinBudget] = useState('');
  const [experienceLevels, setExperienceLevels] = useState<{ [key: string]: boolean }>({
    Entry: false,
    Intermediate: false,
    Expert: true,
  });
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['React', 'Next.js', 'TypeScript']);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [clientRating, setClientRating] = useState('any');
  const [minClientSpend, setMinClientSpend] = useState('any');
  const [connectsRequired, setConnectsRequired] = useState('all');

  // View States
  const [activeSegment, setActiveSegment] = useState<'recommended' | 'custom' | 'saved'>('recommended');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState('best_match');
  const [currentPage, setCurrentPage] = useState(1);
  const [alertSaved, setAlertSaved] = useState(false);
  const itemsPerPage = 5;

  // Filter calculation
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Segment filter
      if (activeSegment === 'saved' && !job.saved) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(q);
        const matchesClient = job.client.location.toLowerCase().includes(q);
        const matchesSkills = job.skillTags.some((s: string) => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesClient && !matchesSkills) return false;
      }

      // Keywords
      if (keywords.trim()) {
        const kwList = keywords.toLowerCase().split(',').map((k) => k.trim()).filter(Boolean);
        if (kwList.length > 0) {
          const text = `${job.title} ${job.skillTags.join(' ')} ${job.shortRecommendation}`.toLowerCase();
          const hasAny = kwList.some((kw) => text.includes(kw));
          if (!hasAny) return false;
        }
      }

      // Job Type
      if (jobType === 'fixed' && job.budgetType !== 'fixed') return false;
      if (jobType === 'hourly' && job.budgetType !== 'hourly') return false;

      // Category filter
      if (category !== 'all') {
        const catMap: { [key: string]: string[] } = {
          fullstack: ['react', 'next.js', 'laravel', 'full-stack', 'vue'],
          backend: ['fastapi', 'python', 'laravel', 'node', 'django'],
          frontend: ['react', 'react native', 'tailwind', 'vue', 'next.js'],
          mobile: ['react native', 'flutter', 'ios', 'android'],
          ai: ['ai', 'langchain', 'rag', 'pinecone', 'openai', 'llm'],
        };
        const requiredKeywords = catMap[category] || [];
        const jobText = `${job.title} ${job.skillTags.join(' ')}`.toLowerCase();
        const matchesCat = requiredKeywords.some((kw) => jobText.includes(kw));
        if (!matchesCat) return false;
      }

      // Min Budget
      if (minBudget.trim()) {
        const num = parseFloat(minBudget.replace(/[^0-9.]/g, ''));
        if (!isNaN(num) && num > 0) {
          if ((job.rawBudget || 0) < num) return false;
        }
      }

      // Experience Level
      const selectedLevels = Object.entries(experienceLevels)
        .filter(([, active]) => active)
        .map(([lvl]) => lvl.toLowerCase());
      if (selectedLevels.length > 0) {
        if (!selectedLevels.includes(job.experienceLevel.toLowerCase())) {
          return false;
        }
      }

      // Required Skills (if any are active)
      if (selectedSkills.length > 0 && activeSegment === 'custom') {
        const jobSkillsLower = job.skillTags.map((s: string) => s.toLowerCase());
        const hasSkill = selectedSkills.some((s) => jobSkillsLower.includes(s.toLowerCase()));
        if (!hasSkill) return false;
      }

      // Client Rating
      if (clientRating === '4.8' && job.client.rating < 4.8) return false;
      if (clientRating === '4.5' && job.client.rating < 4.5) return false;
      if (clientRating === '4.0' && job.client.rating < 4.0) return false;

      const getSpendNum = (s: string) => {
        const cleaned = s.replace(/[^0-9.]/g, '');
        const val = parseFloat(cleaned) || 0;
        return s.toLowerCase().includes('k') ? val * 1000 : s.toLowerCase().includes('m') ? val * 1000000 : val;
      };

      // Min Client Spend
      if (minClientSpend === '100k' && getSpendNum(job.client.totalSpent) < 100000) return false;
      if (minClientSpend === '50k' && getSpendNum(job.client.totalSpent) < 50000) return false;
      if (minClientSpend === '10k' && getSpendNum(job.client.totalSpent) < 10000) return false;

      // Connects Required
      if (connectsRequired === 'under_8' && job.connectsRequired >= 8) return false;
      if (connectsRequired === '8_12' && (job.connectsRequired < 8 || job.connectsRequired > 12)) return false;
      if (connectsRequired === '12_plus' && job.connectsRequired < 12) return false;

      return true;
    });
  }, [
    jobs,
    activeSegment,
    searchQuery,
    keywords,
    jobType,
    category,
    minBudget,
    experienceLevels,
    selectedSkills,
    clientRating,
    minClientSpend,
    connectsRequired,
  ]);

  // Sort
  const sortedJobs = useMemo(() => {
    return [...filteredJobs].sort((a, b) => {
      if (sortBy === 'best_match') return b.opportunityScore - a.opportunityScore;
      if (sortBy === 'newest') return a.postedTime.localeCompare(b.postedTime);
      if (sortBy === 'budget_high') {
        return (b.rawBudget || 0) - (a.rawBudget || 0);
      }
      if (sortBy === 'client_spend') {
        const getSpendNum = (s: string) => {
          const cleaned = s.replace(/[^0-9.]/g, '');
          const val = parseFloat(cleaned) || 0;
          return s.toLowerCase().includes('k') ? val * 1000 : s.toLowerCase().includes('m') ? val * 1000000 : val;
        };
        return getSpendNum(b.client.totalSpent) - getSpendNum(a.client.totalSpent);
      }
      return 0;
    });
  }, [filteredJobs, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedJobs.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentJobs = sortedJobs.slice(startIndex, startIndex + itemsPerPage);

  const handleClearFilters = () => {
    setSearchQuery('');
    setKeywords('');
    setJobType('all');
    setCategory('all');
    setMinBudget('');
    setExperienceLevels({ Entry: false, Intermediate: false, Expert: false });
    setSelectedSkills([]);
    setClientRating('any');
    setMinClientSpend('any');
    setConnectsRequired('all');
    setCurrentPage(1);
  };

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !selectedSkills.includes(newSkillInput.trim())) {
      setSelectedSkills([...selectedSkills, newSkillInput.trim()]);
      setNewSkillInput('');
      setShowAddSkill(false);
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };

  const savedCount = jobs.filter((j) => j.saved).length;

  return (
    <div className="pt-6 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold font-headline text-slate-900 tracking-tight">
            Job Search &amp; Filter Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-body">
            Real-time semantic filtering and AI scoring across active Upwork job listings.
          </p>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-xs">
          {/* Top Wide Search Input */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search Upwork jobs by title, keyword, or client..."
                className="w-full text-sm pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            </div>
            <button
              onClick={() => setCurrentPage(1)}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-xs transition-colors duration-150 flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">search</span>
              <span>Search</span>
            </button>
          </div>

          {/* Filter Grid: Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4 border-b border-slate-100">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Keywords
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => { setKeywords(e.target.value); setCurrentPage(1); }}
                placeholder="e.g. Next.js, FastAPI, SaaS MVP"
                className="w-full text-xs px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Job Type
              </label>
              <div className="relative">
                <select
                  value={jobType}
                  onChange={(e) => { setJobType(e.target.value); setCurrentPage(1); }}
                  className="w-full text-xs px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-800 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="fixed">Fixed Price Only</option>
                  <option value="hourly">Hourly Rate Only</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[16px]">
                  expand_more
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }}
                  className="w-full text-xs px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-800 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="fullstack">Full-Stack Development</option>
                  <option value="backend">Backend Development</option>
                  <option value="frontend">Frontend Development</option>
                  <option value="mobile">Mobile Development</option>
                  <option value="ai">AI &amp; Machine Learning</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[16px]">
                  expand_more
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Minimum Budget
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">$</span>
                <input
                  type="text"
                  value={minBudget}
                  onChange={(e) => { setMinBudget(e.target.value); setCurrentPage(1); }}
                  placeholder="1,000+"
                  className="w-full text-xs pl-6 pr-3 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Filter Grid: Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 pb-4 border-b border-slate-100">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Experience Level
              </label>
              <div className="flex items-center gap-1.5 pt-0.5">
                {(['Entry', 'Intermediate', 'Expert'] as const).map((lvl) => {
                  const isChecked = experienceLevels[lvl];
                  return (
                    <label
                      key={lvl}
                      className={`flex items-center gap-1.5 px-2 py-1 border rounded text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          setExperienceLevels({ ...experienceLevels, [lvl]: e.target.checked });
                          setCurrentPage(1);
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-0 text-xs"
                      />
                      <span>{lvl}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Required Skills
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                {selectedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md border border-slate-200"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-slate-900 leading-none cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {showAddSkill ? (
                  <div className="inline-flex items-center gap-1">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddSkill(); }}
                      placeholder="Skill..."
                      className="w-16 px-1.5 py-0.5 text-[11px] border border-blue-400 rounded outline-none"
                      autoFocus
                    />
                    <button onClick={handleAddSkill} className="text-blue-600 text-xs font-bold cursor-pointer">✓</button>
                    <button onClick={() => setShowAddSkill(false)} className="text-slate-400 text-xs cursor-pointer">✕</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddSkill(true)}
                    className="text-blue-600 hover:text-blue-700 text-[11px] font-medium px-1.5 py-0.5 cursor-pointer"
                  >
                    + Add Skill
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Client Rating
              </label>
              <div className="relative">
                <select
                  value={clientRating}
                  onChange={(e) => { setClientRating(e.target.value); setCurrentPage(1); }}
                  className="w-full text-xs px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-800 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="any">Any Rating</option>
                  <option value="4.8">★ 4.8+ Client Rating</option>
                  <option value="4.5">★ 4.5+ Client Rating</option>
                  <option value="4.0">★ 4.0+ Client Rating</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[16px]">
                  expand_more
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Min Client Spend
              </label>
              <div className="relative">
                <select
                  value={minClientSpend}
                  onChange={(e) => { setMinClientSpend(e.target.value); setCurrentPage(1); }}
                  className="w-full text-xs px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-800 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="any">Any Spend Level</option>
                  <option value="100k">$100k+ Spent</option>
                  <option value="50k">$50k+ Spent</option>
                  <option value="10k">$10k+ Spent</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[16px]">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Filter Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="material-symbols-outlined text-[17px] text-blue-600">notifications_active</span>
              <button
                onClick={() => setAlertSaved(true)}
                className="font-medium text-blue-600 hover:text-blue-700 underline underline-offset-2 cursor-pointer"
              >
                {alertSaved ? 'Alert Active: Subscribed' : 'Save Search Alert'}
              </button>
              <span className="text-slate-400">• Email &amp; Slack notification when 90+ score matches appear</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => alert('Exporting Intel CSV: Generating high-conviction job lead dataset...')}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Export Intel</span>
              </button>
              <button
                onClick={handleClearFilters}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setCurrentPage(1)}
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold px-4 py-1.5 rounded-lg shadow-xs transition-colors duration-150 cursor-pointer"
              >
                Apply Filters ({sortedJobs.length} Results)
              </button>
            </div>
          </div>
        </div>

        {/* View & Segment Tabs Row */}
        <div className="flex items-center justify-between border-b border-slate-200 mb-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => { setActiveSegment('recommended'); setCurrentPage(1); }}
              className={`flex items-center gap-2 pb-3 text-xs cursor-pointer ${
                activeSegment === 'recommended'
                  ? 'font-semibold text-blue-600 border-b-2 border-blue-600'
                  : 'font-medium text-slate-500 hover:text-slate-900 border-b-2 border-transparent'
              }`}
            >
              <span>Recommended For Me (Active)</span>
              <span className="bg-blue-100 text-blue-700 font-bold text-[10px] px-2 py-0.5 rounded-full">
                {jobs.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveSegment('custom'); setCurrentPage(1); }}
              className={`flex items-center gap-2 pb-3 text-xs cursor-pointer ${
                activeSegment === 'custom'
                  ? 'font-semibold text-blue-600 border-b-2 border-blue-600'
                  : 'font-medium text-slate-500 hover:text-slate-900 border-b-2 border-transparent'
              }`}
            >
              <span>Custom Search</span>
            </button>

            <button
              onClick={() => { setActiveSegment('saved'); setCurrentPage(1); }}
              className={`flex items-center gap-2 pb-3 text-xs cursor-pointer ${
                activeSegment === 'saved'
                  ? 'font-semibold text-blue-600 border-b-2 border-blue-600'
                  : 'font-medium text-slate-500 hover:text-slate-900 border-b-2 border-transparent'
              }`}
            >
              <span>Saved Jobs ({savedCount})</span>
            </button>
          </div>

          <div className="text-xs text-slate-400">
            Last refreshed 3m ago • Auto-evaluating
          </div>
        </div>

        {/* Sorting & Stats Toolbar */}
        <div className="flex items-center justify-between mb-4 text-xs">
          <div className="font-medium text-slate-700">
            Showing <span className="font-semibold text-slate-900">{sortedJobs.length}</span> high-conviction jobs found
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-slate-200/60 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded cursor-pointer ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                title="List View"
              >
                <span className="material-symbols-outlined text-[16px]">list</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded cursor-pointer ${viewMode === 'grid' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                title="Grid View"
              >
                <span className="material-symbols-outlined text-[16px]">grid_view</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Sort By:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-medium pl-2.5 pr-7 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="best_match">Best Match (Highest AI Score)</option>
                  <option value="newest">Newest</option>
                  <option value="budget_high">Budget: High to Low</option>
                  <option value="client_spend">Client Spend</option>
                </select>
                <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[15px]">
                  expand_more
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Job Cards Container */}
        {currentJobs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500 mb-8">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">search_off</span>
            <p className="text-sm font-medium text-slate-700">No jobs match your active filters.</p>
            <button
              onClick={handleClearFilters}
              className="mt-3 text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {currentJobs.map((job) => {
              const isHighScore = job.opportunityScore >= 90;
              return (
                <div
                  key={job.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs transition-all duration-150 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isHighScore
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isHighScore ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                        {job.opportunityScore} / 100
                      </span>
                      <button
                        onClick={() => onToggleSave(job.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          job.saved ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg" style={job.saved ? { fontVariationSettings: "'FILL' 1" } : {}}>
                          bookmark
                        </span>
                      </button>
                    </div>

                    <h2
                      onClick={() => onViewAnalysis(job)}
                      className="text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors line-clamp-2"
                    >
                      {job.title}
                    </h2>

                    <div className="mt-2 text-xs font-semibold text-slate-800">
                      {job.budget}
                    </div>

                    <p className="mt-2 text-xs text-slate-600 line-clamp-2">{job.shortRecommendation}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500">{job.connectsRequired} Connects</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewAnalysis(job)}
                        className="px-2.5 py-1 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium cursor-pointer"
                      >
                        Analysis
                      </button>
                      <button
                        onClick={() => onGenerateProposal(job)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium cursor-pointer"
                      >
                        Proposal
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View Layout matching Stitch 1:1 */
          <div className="space-y-4 mb-8">
            {currentJobs.map((job) => {
              const isHighScore = job.opportunityScore >= 90;
              const scoreLabel = isHighScore ? 'Exceptional Match' : 'Strong Match';

              return (
                <div
                  key={job.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs transition-all duration-150"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Badges Header */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
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

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          <span className="material-symbols-outlined text-xs text-slate-500">public</span>
                          {job.client.location}
                        </span>
                      </div>

                      <h2
                        onClick={() => onViewAnalysis(job)}
                        className="text-base font-semibold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                      >
                        {job.title}
                      </h2>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium mt-1">
                        <span className="text-slate-900 font-semibold">{job.budget}</span>
                        <span>•</span>
                        <span>Posted {job.postedTime}</span>
                        <span>•</span>
                        <span>{job.experienceLevel} Level</span>
                        <span>•</span>
                        <span className="text-slate-600">{job.connectsRequired} Connects required</span>
                      </div>

                      {/* Client Strip */}
                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <span className="material-symbols-outlined text-sm text-slate-400">payments</span>
                        <span className="font-medium">{job.client.totalSpent} spent</span>
                        <span>•</span>
                        <span>{job.client.hireRate || '94%'} hire rate</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-medium">Prompt payment verified</span>
                      </div>

                      {/* AI Box */}
                      <div className="mt-3 bg-blue-50/70 border border-blue-100 rounded-lg p-2.5 text-xs text-blue-900 flex items-start gap-2">
                        <span className="material-symbols-outlined text-base text-blue-600 shrink-0 mt-0.5">
                          lightbulb
                        </span>
                        <p className="leading-relaxed">
                          <span className="font-semibold text-blue-950">AI Analysis:</span> {job.shortRecommendation}
                        </p>
                      </div>

                      {/* Skills & CTAs */}
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
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500">
          <div>
            Showing <span className="font-medium text-slate-900">{Math.min(currentJobs.length, sortedJobs.length)}</span> of{' '}
            <span className="font-medium text-slate-900">{sortedJobs.length}</span> high-conviction jobs
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
    </div>
  );
};
