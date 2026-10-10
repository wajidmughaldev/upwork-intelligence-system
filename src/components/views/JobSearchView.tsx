import React, { useEffect, useMemo, useState } from 'react';
import { Job } from '../../types';
import {
  upworkApiService,
  UpworkJobDetail,
  UpworkJobSearchData,
  UpworkJobSummary,
  UpworkSearchParams,
} from '../../services/UpworkApiService';

interface JobSearchViewProps {
  jobs: Job[];
  onViewAnalysis: (job: Job) => void;
  onGenerateProposal: (job: Job) => void;
  onToggleSave: (jobId: string) => void;
  onSkipJob: (jobId: string) => void;
}

type Segment = 'recommended' | 'custom' | 'saved';
type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

const isSafeReference = (value: string | null): value is string => typeof value === 'string' && value.startsWith('~02');
const emptyLabel = (value: string | number | null | undefined) => value ?? '—';

function loadRefs(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed.filter(isSafeReference) : [];
  } catch {
    return [];
  }
}

function saveRefs(key: string, refs: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(refs.filter(isSafeReference)));
}

function spendValue(value: string | null): number | null {
  if (!value) return null;
  const amount = Number.parseFloat(value.replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(amount)) return null;
  if (value.toLowerCase().includes('m')) return amount * 1000000;
  if (value.toLowerCase().includes('k')) return amount * 1000;
  return amount;
}

export const JobSearchView: React.FC<JobSearchViewProps> = () => {
  const [activeSegment, setActiveSegment] = useState<Segment>('recommended');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState('best_match');
  const [searchQuery, setSearchQuery] = useState('');
  const [keywords, setKeywords] = useState('');
  const [jobType, setJobType] = useState('all');
  const [category, setCategory] = useState('all');
  const [minBudget, setMinBudget] = useState('');
  const [experienceLevels, setExperienceLevels] = useState<{ [key: string]: boolean }>({
    Entry: false,
    Intermediate: false,
    Expert: false,
  });
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [clientRating, setClientRating] = useState('any');
  const [minClientSpend, setMinClientSpend] = useState('any');
  const [connectsRequired, setConnectsRequired] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsData, setJobsData] = useState<UpworkJobSearchData | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [savedRefs, setSavedRefs] = useState<string[]>([]);
  const [skippedRefs, setSkippedRefs] = useState<string[]>([]);
  const [detail, setDetail] = useState<UpworkJobDetail | null>(null);
  const [detailState, setDetailState] = useState<LoadState>('idle');
  const [detailError, setDetailError] = useState<string | null>(null);
  const itemsPerPage = 5;

  useEffect(() => {
    setSavedRefs(loadRefs('uoi_saved_upwork_job_refs'));
    setSkippedRefs(loadRefs('uoi_skipped_upwork_job_refs'));
    void loadRecommended();
  }, []);

  const updateSavedRefs = (refs: string[]) => {
    setSavedRefs(refs);
    saveRefs('uoi_saved_upwork_job_refs', refs);
  };

  const updateSkippedRefs = (refs: string[]) => {
    setSkippedRefs(refs);
    saveRefs('uoi_skipped_upwork_job_refs', refs);
  };

  const loadRecommended = async () => {
    setLoadState('loading');
    setError(null);
    const res = await upworkApiService.getRecommendedJobs(10);
    if (res.success && res.data) {
      setJobsData(res.data);
      setLoadState('loaded');
      setCurrentPage(1);
      return;
    }
    setLoadState('error');
    setError(res.message || 'Unable to load Upwork recommended jobs.');
    if (res.unauthenticated) window.location.reload();
  };

  const runSearch = async () => {
    setLoadState('loading');
    setError(null);
    const budget = Number.parseFloat(minBudget.replace(/[^0-9.]/g, ''));
    const filters: UpworkSearchParams = {
      query: searchQuery.trim() || undefined,
      skills: selectedSkills.length ? selectedSkills : keywords.split(',').map((k) => k.trim()).filter(Boolean),
      category: category === 'all' ? undefined : category,
      job_type: jobType === 'fixed' || jobType === 'hourly' ? jobType : undefined,
      budget_min: Number.isFinite(budget) && budget > 0 ? budget : undefined,
      limit: 10,
    };
    const res = await upworkApiService.searchJobs(filters);
    if (res.success && res.data) {
      setJobsData(res.data);
      setLoadState('loaded');
      setActiveSegment('custom');
      setCurrentPage(1);
      return;
    }
    setLoadState('error');
    setError(res.message || 'Unable to search Upwork jobs.');
    if (res.unauthenticated) window.location.reload();
  };

  const openDetail = async (reference: string | null) => {
    if (!isSafeReference(reference)) {
      setDetailError('This Upwork job does not have a safe public reference.');
      setDetailState('error');
      return;
    }
    setDetail(null);
    setDetailError(null);
    setDetailState('loading');
    const res = await upworkApiService.getJobDetail(reference);
    if (res.success && res.data) {
      setDetail(res.data);
      setDetailState('loaded');
      return;
    }
    setDetailState('error');
    setDetailError(res.message || 'Unable to load Upwork job detail.');
    if (res.unauthenticated) window.location.reload();
  };

  const handleToggleSave = (reference: string | null) => {
    if (!isSafeReference(reference)) return;
    updateSavedRefs(savedRefs.includes(reference) ? savedRefs.filter((ref) => ref !== reference) : [...savedRefs, reference]);
  };

  const handleSkip = (reference: string | null) => {
    if (!isSafeReference(reference)) return;
    updateSkippedRefs(skippedRefs.includes(reference) ? skippedRefs.filter((ref) => ref !== reference) : [...skippedRefs, reference]);
  };

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
    const skill = newSkillInput.trim();
    if (skill && !selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
      setNewSkillInput('');
      setShowAddSkill(false);
    }
  };

  const visibleJobs = useMemo(() => {
    const source = jobsData?.jobs ?? [];
    const filtered = source.filter((job) => {
      if (activeSegment === 'saved' && (!job.reference || !savedRefs.includes(job.reference))) return false;
      if (job.reference && skippedRefs.includes(job.reference) && activeSegment !== 'saved') return false;

      const selectedLevels = Object.entries(experienceLevels).filter(([, active]) => active).map(([level]) => level.toLowerCase());
      if (selectedLevels.length && (!job.experienceLevel || !selectedLevels.includes(job.experienceLevel.toLowerCase()))) return false;
      if (clientRating !== 'any' && (job.client.rating === null || job.client.rating < Number(clientRating))) return false;
      const spend = spendValue(job.client.totalSpent);
      if (minClientSpend === '100k' && (spend === null || spend < 100000)) return false;
      if (minClientSpend === '50k' && (spend === null || spend < 50000)) return false;
      if (minClientSpend === '10k' && (spend === null || spend < 10000)) return false;
      if (connectsRequired === 'under_8' && (job.connectsRequired === null || job.connectsRequired >= 8)) return false;
      if (connectsRequired === '8_12' && (job.connectsRequired === null || job.connectsRequired < 8 || job.connectsRequired > 12)) return false;
      if (connectsRequired === '12_plus' && (job.connectsRequired === null || job.connectsRequired < 12)) return false;
      return true;
    });

    if (sortBy === 'client_spend') {
      return [...filtered].sort((a, b) => (spendValue(b.client.totalSpent) ?? -1) - (spendValue(a.client.totalSpent) ?? -1));
    }
    if (sortBy === 'newest') {
      return [...filtered].sort((a, b) => (b.postedTime ?? '').localeCompare(a.postedTime ?? ''));
    }
    return filtered;
  }, [jobsData, activeSegment, savedRefs, skippedRefs, experienceLevels, clientRating, minClientSpend, connectsRequired, sortBy]);

  const totalPages = Math.max(1, Math.ceil(visibleJobs.length / itemsPerPage));
  const currentJobs = visibleJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stateLabel = (code?: string) => {
    if (code === 'RECONNECT_REQUIRED') return 'Reconnect your Upwork account to load marketplace jobs.';
    if (code === 'ACCOUNT_SELECTION_REQUIRED') return 'Select an eligible Upwork freelancer account before loading jobs.';
    if (code === 'NO_ELIGIBLE_ACCOUNT') return 'No eligible Upwork freelancer account was found.';
    if (code === 'UPWORK_RATE_LIMITED') return 'Upwork rate limited this request. Try again shortly.';
    return error || 'Unable to load real Upwork jobs.';
  };

  const renderJobCard = (job: UpworkJobSummary) => {
    const saved = !!job.reference && savedRefs.includes(job.reference);
    const skipped = !!job.reference && skippedRefs.includes(job.reference);
    return (
      <div key={job.reference ?? job.title ?? Math.random()} className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs transition-all duration-150">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                Analysis pending
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                {job.client.paymentVerified === true ? 'Payment verified' : job.client.paymentVerified === false ? 'Payment not verified' : 'Payment —'}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                {job.jobType ?? 'Type —'}
              </span>
            </div>

            <button onClick={() => openDetail(job.reference)} className="text-left text-base font-semibold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors">
              {emptyLabel(job.title)}
            </button>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium mt-1">
              <span className="text-slate-900 font-semibold">{emptyLabel(job.budget ?? job.hourlyRate)}</span>
              <span>•</span>
              <span>Posted {emptyLabel(job.postedTime)}</span>
              <span>•</span>
              <span>{emptyLabel(job.experienceLevel)} level</span>
              <span>•</span>
              <span>{emptyLabel(job.connectsRequired)} Connects</span>
            </div>

            <p className="mt-3 text-xs text-slate-600 leading-relaxed line-clamp-3">{emptyLabel(job.descriptionSnippet)}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <span>Rating {emptyLabel(job.client.rating)}</span>
              <span>•</span>
              <span>{emptyLabel(job.client.totalSpent)} spent</span>
              <span>•</span>
              <span>{emptyLabel(job.client.location)}</span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {job.skills.length ? job.skills.map((skill) => (
                  <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">{skill}</span>
                )) : <span className="text-xs text-slate-400">Skills —</span>}
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button onClick={() => openDetail(job.reference)} className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium cursor-pointer">Job Details</button>
                <button disabled className="px-3 py-1.5 border border-slate-200 text-slate-400 bg-slate-50 rounded-lg text-xs font-medium cursor-not-allowed">Analysis pending</button>
                <button disabled className="px-3.5 py-1.5 bg-slate-200 text-slate-400 rounded-lg text-xs font-medium cursor-not-allowed">Proposal unavailable</button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button onClick={() => handleToggleSave(job.reference)} className={`p-1.5 rounded-lg transition-colors cursor-pointer ${saved ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100'}`} title={saved ? 'Remove from Saved' : 'Save Job'}>
              <span className="material-symbols-outlined text-lg" style={saved ? { fontVariationSettings: "'FILL' 1" } : {}}>bookmark</span>
            </button>
            <button onClick={() => handleSkip(job.reference)} className={`p-1.5 rounded-lg transition-colors cursor-pointer ${skipped ? 'text-rose-600 bg-rose-50' : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'}`} title={skipped ? 'Unskip Job' : 'Skip Job'}>
              <span className="material-symbols-outlined text-lg">block</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pt-6 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold font-headline text-slate-900 tracking-tight">Job Search &amp; Filter Engine</h1>
          <p className="text-xs text-slate-500 mt-1 font-body">Real read-only Upwork job discovery. Scoring and proposals stay disabled until later slices.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-xs">
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') void runSearch(); }}
                placeholder="Search Upwork jobs by title or keyword..."
                className="w-full text-sm pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            </div>
            <button onClick={() => void runSearch()} className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-xs transition-colors duration-150 flex items-center gap-1.5 cursor-pointer">
              <span className="material-symbols-outlined text-[17px]">search</span>
              <span>Search</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4 border-b border-slate-100">
            <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void runSearch(); }} placeholder="Keywords, comma separated" className="w-full text-xs px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600" />
            <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="w-full text-xs px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer">
              <option value="all">All Types</option>
              <option value="fixed">Fixed Price Only</option>
              <option value="hourly">Hourly Rate Only</option>
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full text-xs px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer">
              <option value="all">All Categories</option>
              <option value="fullstack">Full-Stack Development</option>
              <option value="backend">Backend Development</option>
              <option value="frontend">Frontend Development</option>
              <option value="mobile">Mobile Development</option>
              <option value="ai">AI &amp; Machine Learning</option>
            </select>
            <input type="text" value={minBudget} onChange={(e) => setMinBudget(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void runSearch(); }} placeholder="Minimum budget" className="w-full text-xs px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
            <div className="flex items-center gap-1.5">
              {(['Entry', 'Intermediate', 'Expert'] as const).map((level) => (
                <label key={level} className="flex items-center gap-1.5 px-2 py-1 border rounded text-xs cursor-pointer border-slate-200 text-slate-600 hover:bg-slate-50">
                  <input type="checkbox" checked={experienceLevels[level]} onChange={(e) => setExperienceLevels({ ...experienceLevels, [level]: e.target.checked })} />
                  <span>{level}</span>
                </label>
              ))}
            </div>
            <select value={clientRating} onChange={(e) => setClientRating(e.target.value)} className="w-full text-xs px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-800 cursor-pointer">
              <option value="any">Any Rating</option>
              <option value="4.8">4.8+ Client Rating</option>
              <option value="4.5">4.5+ Client Rating</option>
              <option value="4.0">4.0+ Client Rating</option>
            </select>
            <select value={minClientSpend} onChange={(e) => setMinClientSpend(e.target.value)} className="w-full text-xs px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-800 cursor-pointer">
              <option value="any">Any Spend Level</option>
              <option value="100k">$100k+ Spent</option>
              <option value="50k">$50k+ Spent</option>
              <option value="10k">$10k+ Spent</option>
            </select>
            <select value={connectsRequired} onChange={(e) => setConnectsRequired(e.target.value)} className="w-full text-xs px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-800 cursor-pointer">
              <option value="all">Any Connect Cost</option>
              <option value="under_8">Under 8</option>
              <option value="8_12">8-12</option>
              <option value="12_plus">12+</option>
            </select>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              {selectedSkills.map((skill) => <span key={skill} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md border border-slate-200">{skill}<button onClick={() => setSelectedSkills(selectedSkills.filter((s) => s !== skill))}>×</button></span>)}
              {showAddSkill ? (
                <span className="inline-flex items-center gap-1">
                  <input value={newSkillInput} onChange={(e) => setNewSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleAddSkill(); }} className="w-20 px-1.5 py-0.5 text-[11px] border border-blue-400 rounded outline-none" autoFocus />
                  <button onClick={handleAddSkill} className="text-blue-600 text-xs font-bold cursor-pointer">✓</button>
                </span>
              ) : <button onClick={() => setShowAddSkill(true)} className="text-blue-600 hover:text-blue-700 text-[11px] font-medium px-1.5 py-0.5 cursor-pointer">+ Add Skill</button>}
            </div>
            <button onClick={handleClearFilters} className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer">Clear Filters</button>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-slate-200 mb-4">
          <div className="flex items-center gap-6">
            <button onClick={() => { setActiveSegment('recommended'); void loadRecommended(); }} className={`flex items-center gap-2 pb-3 text-xs cursor-pointer ${activeSegment === 'recommended' ? 'font-semibold text-blue-600 border-b-2 border-blue-600' : 'font-medium text-slate-500 hover:text-slate-900 border-b-2 border-transparent'}`}>Recommended</button>
            <button onClick={() => setActiveSegment('custom')} className={`flex items-center gap-2 pb-3 text-xs cursor-pointer ${activeSegment === 'custom' ? 'font-semibold text-blue-600 border-b-2 border-blue-600' : 'font-medium text-slate-500 hover:text-slate-900 border-b-2 border-transparent'}`}>Custom Search</button>
            <button onClick={() => setActiveSegment('saved')} className={`flex items-center gap-2 pb-3 text-xs cursor-pointer ${activeSegment === 'saved' ? 'font-semibold text-blue-600 border-b-2 border-blue-600' : 'font-medium text-slate-500 hover:text-slate-900 border-b-2 border-transparent'}`}>Saved Jobs ({savedRefs.length})</button>
          </div>
          <div className="text-xs text-slate-400">Real Upwork results only</div>
        </div>

        <div className="flex items-center justify-between mb-4 text-xs">
          <div className="font-medium text-slate-700">
            Showing <span className="font-semibold text-slate-900">{visibleJobs.length}</span> real Upwork jobs
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-200/60 p-0.5 rounded-lg border border-slate-200">
              <button onClick={() => setViewMode('list')} className={`p-1 rounded cursor-pointer ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}><span className="material-symbols-outlined text-[16px]">list</span></button>
              <button onClick={() => setViewMode('grid')} className={`p-1 rounded cursor-pointer ${viewMode === 'grid' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}><span className="material-symbols-outlined text-[16px]">grid_view</span></button>
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-xs font-medium px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 cursor-pointer">
              <option value="best_match">Upwork Order</option>
              <option value="newest">Newest</option>
              <option value="client_spend">Client Spend</option>
            </select>
          </div>
        </div>

        {loadState === 'loading' && <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500 mb-8">Loading real Upwork jobs...</div>}
        {loadState === 'error' && <div className="bg-white border border-rose-200 rounded-xl p-10 text-center text-rose-700 mb-8">{stateLabel()}</div>}
        {loadState !== 'loading' && loadState !== 'error' && currentJobs.length === 0 && <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500 mb-8">No real Upwork jobs found for this view.</div>}

        {loadState !== 'loading' && loadState !== 'error' && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-8' : 'space-y-4 mb-8'}>
            {currentJobs.map(renderJobCard)}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500">
          <div>Showing <span className="font-medium text-slate-900">{currentJobs.length}</span> of <span className="font-medium text-slate-900">{visibleJobs.length}</span></div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-2.5 py-1 border border-slate-200 rounded disabled:text-slate-400">Previous</button>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-2.5 py-1 border border-slate-200 rounded disabled:text-slate-400">Next</button>
          </div>
        </div>
      </div>

      {detailState !== 'idle' && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">{detail?.title ?? 'Original Job Brief'}</h2>
                <p className="text-xs text-slate-500 mt-1">Source-backed Upwork job details. Analysis is not generated in this slice.</p>
              </div>
              <button onClick={() => { setDetailState('idle'); setDetail(null); }} className="text-slate-400 hover:text-slate-700 cursor-pointer">×</button>
            </div>
            {detailState === 'loading' && <div className="py-10 text-center text-sm text-slate-500">Loading job detail...</div>}
            {detailState === 'error' && <div className="py-10 text-center text-sm text-rose-700">{detailError}</div>}
            {detailState === 'loaded' && detail && (
              <div className="pt-4 space-y-4 text-sm">
                <p className="text-slate-700 whitespace-pre-wrap">{emptyLabel(detail.description)}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div><span className="text-slate-400">Type</span><p className="font-medium">{emptyLabel(detail.jobType)}</p></div>
                  <div><span className="text-slate-400">Budget / Rate</span><p className="font-medium">{emptyLabel(detail.budget ?? detail.hourlyRate)}</p></div>
                  <div><span className="text-slate-400">Connects</span><p className="font-medium">{emptyLabel(detail.connectsRequired)}</p></div>
                  <div><span className="text-slate-400">Experience</span><p className="font-medium">{emptyLabel(detail.experienceLevel)}</p></div>
                  <div><span className="text-slate-400">Rating</span><p className="font-medium">{emptyLabel(detail.client.rating)}</p></div>
                  <div><span className="text-slate-400">Spent</span><p className="font-medium">{emptyLabel(detail.client.totalSpent)}</p></div>
                  <div><span className="text-slate-400">Hire rate</span><p className="font-medium">{emptyLabel(detail.client.hireRate)}</p></div>
                  <div><span className="text-slate-400">Location</span><p className="font-medium">{emptyLabel(detail.client.location)}</p></div>
                  <div><span className="text-slate-400">Payment</span><p className="font-medium">{detail.client.paymentVerified === true ? 'Verified' : detail.client.paymentVerified === false ? 'Not verified' : '—'}</p></div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-700 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-1.5">{detail.skills.length ? detail.skills.map((skill) => <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">{skill}</span>) : <span className="text-xs text-slate-400">—</span>}</div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-700 mb-2">Screening Questions</h3>
                  {detail.screeningQuestions.length ? <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">{detail.screeningQuestions.map((q) => <li key={q}>{q}</li>)}</ul> : <span className="text-xs text-slate-400">—</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
