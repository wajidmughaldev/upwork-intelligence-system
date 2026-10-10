import React, { useState } from 'react';
import { UserProfile, PortfolioItem } from '../../types';
import { UpworkProfileData, UpworkConnectionStatus } from '../../services/UpworkApiService';

interface ProfileIntelligenceViewProps {
  profile: UserProfile;
  realProfile?: UpworkProfileData | null;
  connectionStatus?: UpworkConnectionStatus | null;
  onResyncUpwork?: () => void;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export const ProfileIntelligenceView: React.FC<ProfileIntelligenceViewProps> = ({
  profile,
  realProfile,
  connectionStatus,
  onResyncUpwork,
  onUpdateProfile,
}) => {
  // Local state for editable fields
  const [minFixedBudget, setMinFixedBudget] = useState(
    profile.preferences?.minFixedBudget?.toString() || '1500'
  );
  const [minHourlyRate, setMinHourlyRate] = useState(
    profile.preferences?.minHourlyRate?.toString() || '75'
  );
  const [preferredJobTypes, setPreferredJobTypes] = useState<string[]>(
    profile.preferences?.preferredJobTypes || ['Fixed Price', 'Hourly']
  );
  const [strongestSkills, setStrongestSkills] = useState<string[]>(
    profile.preferences?.strongestSkills || ['Laravel 11', 'React 19', 'Next.js App Router', 'Tailwind CSS']
  );
  const [preferredIndustries, setPreferredIndustries] = useState<string[]>(
    profile.preferences?.preferredIndustries || ['SaaS', 'FinTech', 'Cloud Tools']
  );
  const [avoidedCategories, setAvoidedCategories] = useState<string[]>(
    profile.preferences?.avoidedCategories || ['WordPress Themes', 'Unfiltered Data Scraping']
  );

  // Portfolio items
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(
    profile.portfolio && profile.portfolio.length > 0
      ? profile.portfolio
      : [
          {
            id: 'p1',
            title: 'Multi-Tenant SaaS Dashboard',
            technologies: ['Laravel 11', 'Next.js 14', 'Tailwind', 'Stripe'],
            description: 'Built dashboard handling 50k MAU with <100ms API response time.',
            outcome: '99.9% Uptime • 45k Active Users • High Conversion Proof'
          },
          {
            id: 'p2',
            title: 'High-Throughput REST API Microservice',
            technologies: ['Laravel', 'Redis', 'Docker', 'PostgreSQL'],
            description: 'Refactored legacy backend to process 2M daily webhook requests.',
            outcome: '70% Latency Reduction • 2M Daily Webhooks'
          },
          {
            id: 'p3',
            title: 'Real-Time Collaboration Portal',
            technologies: ['React', 'Node.js', 'WebSockets', 'Redis'],
            description: 'Designed interactive canvas for team workflow automation.',
            outcome: 'Zero-lag Sync • 12 Enterprise Teams'
          }
        ]
  );

  // New tag inputs
  const [newTech, setNewTech] = useState('');
  const [showAddTech, setShowAddTech] = useState(false);
  const [newIndustry, setNewIndustry] = useState('');
  const [showAddIndustry, setShowAddIndustry] = useState(false);
  const [newNegative, setNewNegative] = useState('');
  const [showAddNegative, setShowAddNegative] = useState(false);

  // Add Portfolio Modal state
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [newPortTitle, setNewPortTitle] = useState('');
  const [newPortTechs, setNewPortTechs] = useState('');
  const [newPortDesc, setNewPortDesc] = useState('');
  const [newPortOutcome, setNewPortOutcome] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveAll = () => {
    onUpdateProfile({
      preferences: {
        ...profile.preferences,
        minFixedBudget: parseFloat(minFixedBudget) || 1500,
        minHourlyRate: parseFloat(minHourlyRate) || 75,
        preferredJobTypes,
        strongestSkills,
        preferredIndustries,
        avoidedCategories,
      },
      portfolio,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleAddPortfolioItem = () => {
    if (!newPortTitle.trim()) return;
    const newItem: PortfolioItem = {
      id: `port-${Date.now()}`,
      title: newPortTitle.trim(),
      technologies: newPortTechs.split(',').map((t) => t.trim()).filter(Boolean),
      description: newPortDesc.trim() || 'Custom portfolio verified implementation.',
      outcome: newPortOutcome.trim() || 'Verified production release.'
    };
    const updated = [...portfolio, newItem];
    setPortfolio(updated);
    setNewPortTitle('');
    setNewPortTechs('');
    setNewPortDesc('');
    setNewPortOutcome('');
    setShowAddPortfolio(false);
  };

  const handleDeletePortfolioItem = (id: string) => {
    setPortfolio(portfolio.filter((p) => p.id !== id));
  };

  const toggleJobType = (type: string) => {
    if (preferredJobTypes.includes(type)) {
      setPreferredJobTypes(preferredJobTypes.filter((t) => t !== type));
    } else {
      setPreferredJobTypes([...preferredJobTypes, type]);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
        {/* Page Title & Top Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold font-headline text-slate-900 tracking-tight">Profile Intelligence</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Configure your algorithmic matching persona, synced Upwork credentials, and high-conversion portfolio proof snippets.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onResyncUpwork || (() => alert('Upwork profile refreshed.'))}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-slate-500">sync</span>
              <span>Re-sync Upwork Profile</span>
            </button>
            <button
              onClick={handleSaveAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">save</span>
              <span>{saveSuccess ? 'Settings Saved ✓' : 'Save Intelligence Settings'}</span>
            </button>
          </div>
        </div>

        {/* Main Content 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= LEFT COLUMN (5/12 width) ================= */}
          <div className="lg:col-span-5 space-y-6">
            {/* Section 1: Upwork Verified Profile */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">verified_user</span>
                  <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Upwork Verified Profile
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${connectionStatus?.connected ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                  {connectionStatus?.connected ? 'Synced' : 'Not Connected'}
                </span>
              </div>

              <div className="p-5 space-y-4">
                {/* Title & Hourly Rate Header */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {realProfile?.title ?? '—'}
                      </h3>
                      {connectionStatus?.accountName && (
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                          {connectionStatus.accountName}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap">
                      <span>{realProfile?.hourlyRate ? `$${realProfile.hourlyRate} / hr` : '—'}</span>
                    </div>
                  </div>
                  <div className="mt-2.5">
                    {realProfile?.profileSignals ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="material-symbols-outlined text-amber-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                        {realProfile.profileSignals.jobSuccessScore !== null
                          ? `${realProfile.profileSignals.jobSuccessScore}% Job Success`
                          : 'Job Success N/A'}
                        {realProfile.profileSignals.topRated ? ' • Top Rated' : ''}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No profile signals returned</span>
                    )}
                  </div>
                </div>

                {/* Overview Snippet */}
                {realProfile?.overview && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {realProfile.overview}
                    </p>
                  </div>
                )}

                {/* Synced Skills Pills */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Synced Skills ({realProfile?.skills?.length ?? 0})
                    </span>
                    <span className="text-[11px] text-slate-400">From Upwork Roster</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {realProfile?.skills && realProfile.skills.length > 0 ? (
                      realProfile.skills.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium border border-slate-200/60"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No skills listed</span>
                    )}
                  </div>
                </div>

                {/* Profile Sync Note Callout */}
                <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-blue-600 shrink-0 mt-0.5 text-[16px]">info</span>
                  <p className="text-[11px] text-blue-900 leading-relaxed">
                    Changes made directly on Upwork will automatically reflect within 15 minutes or upon manual sync.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: AI Matching Persona Summary */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">tune</span>
                  <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    AI Matching Persona Summary
                  </h3>
                </div>
                <span className="text-[10px] font-semibold bg-blue-100/70 text-blue-700 px-2 py-0.5 rounded">
                  Active Agent
                </span>
              </div>

              {/* Tone Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Preferred Proposal Tone</label>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-300 text-blue-700 font-medium rounded-lg text-xs">
                    <span className="material-symbols-outlined fill text-blue-600 text-[14px]">check_circle</span>
                    Direct, Technical, Problem-First
                  </span>
                  <button
                    onClick={() => alert('Proposal tone can be customized per proposal in Proposal Studio or globally in Settings.')}
                    className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Availability */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Availability Window</label>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
                  <span className="material-symbols-outlined text-emerald-600 text-[16px]">event_available</span>
                  <span>30+ hours / week (Ready for Immediate Contract)</span>
                </div>
              </div>

              {/* Risk Filter Summary */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Enforced Opportunity Guardrails</label>
                <div className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="material-symbols-outlined text-amber-600 shrink-0 mt-0.5 text-[16px]">shield</span>
                  <span>Auto-skip low spend (&lt;$5k) or &lt;4.5 star clients</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN (7/12 width) ================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* Custom AI Intelligence Parameters */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 md:p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Custom AI Intelligence Parameters</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tailor the Opportunity Scoring algorithm to your exact project criteria.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                  Config Mode
                </span>
              </div>

              <div className="space-y-4">
                {/* Preferred Job Types & Pricing Thresholds */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Job Type Checkboxes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Preferred Job Types</label>
                    <div className="flex items-center gap-2.5">
                      <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 cursor-pointer hover:bg-slate-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={preferredJobTypes.includes('Fixed Price')}
                          onChange={() => toggleJobType('Fixed Price')}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                        />
                        <span>Fixed Price</span>
                      </label>
                      <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 cursor-pointer hover:bg-slate-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={preferredJobTypes.includes('Hourly')}
                          onChange={() => toggleJobType('Hourly')}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                        />
                        <span>Hourly ($75+/hr)</span>
                      </label>
                    </div>
                  </div>

                  {/* Min Budget / Hourly Rate Inputs */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Min. Fixed Budget</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                        <input
                          type="text"
                          value={minFixedBudget}
                          onChange={(e) => setMinFixedBudget(e.target.value)}
                          className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg pl-6 pr-2.5 py-1.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Min. Hourly Rate</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                        <input
                          type="text"
                          value={minHourlyRate}
                          onChange={(e) => setMinHourlyRate(e.target.value)}
                          className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg pl-6 pr-2.5 py-1.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Strongest Tech Stack */}
                <div className="pt-3 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Strongest Tech Stack (High Opportunity Affinity)
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {strongestSkills.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium"
                      >
                        {tech}
                        <button
                          onClick={() => setStrongestSkills(strongestSkills.filter((t) => t !== tech))}
                          className="hover:text-blue-950 font-bold ml-0.5 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {showAddTech ? (
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="text"
                          value={newTech}
                          onChange={(e) => setNewTech(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newTech.trim()) {
                              setStrongestSkills([...strongestSkills, newTech.trim()]);
                              setNewTech('');
                              setShowAddTech(false);
                            }
                          }}
                          placeholder="Tech..."
                          className="w-20 px-1.5 py-0.5 text-xs border border-blue-400 rounded outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            if (newTech.trim()) {
                              setStrongestSkills([...strongestSkills, newTech.trim()]);
                              setNewTech('');
                              setShowAddTech(false);
                            }
                          }}
                          className="text-blue-600 text-xs font-bold cursor-pointer"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddTech(true)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-dashed border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-400 text-xs font-medium transition-colors bg-white cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                        Add Tech
                      </button>
                    )}
                  </div>
                </div>

                {/* Preferred Industries */}
                <div className="pt-3 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Preferred Industries &amp; Verticals
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {preferredIndustries.map((ind) => (
                      <span
                        key={ind}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium"
                      >
                        {ind}
                        <button
                          onClick={() => setPreferredIndustries(preferredIndustries.filter((i) => i !== ind))}
                          className="hover:text-emerald-950 font-bold ml-0.5 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {showAddIndustry ? (
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="text"
                          value={newIndustry}
                          onChange={(e) => setNewIndustry(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newIndustry.trim()) {
                              setPreferredIndustries([...preferredIndustries, newIndustry.trim()]);
                              setNewIndustry('');
                              setShowAddIndustry(false);
                            }
                          }}
                          placeholder="Industry..."
                          className="w-20 px-1.5 py-0.5 text-xs border border-emerald-400 rounded outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            if (newIndustry.trim()) {
                              setPreferredIndustries([...preferredIndustries, newIndustry.trim()]);
                              setNewIndustry('');
                              setShowAddIndustry(false);
                            }
                          }}
                          className="text-emerald-600 text-xs font-bold cursor-pointer"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddIndustry(true)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-dashed border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-400 text-xs font-medium transition-colors bg-white cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                        Add Industry
                      </button>
                    )}
                  </div>
                </div>

                {/* Avoided Job Categories (Negative Filter) */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Avoided Job Categories (Negative Filter)
                    </label>
                    <span className="text-[10px] text-amber-700 font-medium">Penalty: -40 Score</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {avoidedCategories.map((neg) => (
                      <span
                        key={neg}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"
                      >
                        {neg}
                        <button
                          onClick={() => setAvoidedCategories(avoidedCategories.filter((n) => n !== neg))}
                          className="hover:text-rose-950 font-bold ml-0.5 cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    {showAddNegative ? (
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="text"
                          value={newNegative}
                          onChange={(e) => setNewNegative(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newNegative.trim()) {
                              setAvoidedCategories([...avoidedCategories, newNegative.trim()]);
                              setNewNegative('');
                              setShowAddNegative(false);
                            }
                          }}
                          placeholder="Category..."
                          className="w-24 px-1.5 py-0.5 text-xs border border-rose-400 rounded outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            if (newNegative.trim()) {
                              setAvoidedCategories([...avoidedCategories, newNegative.trim()]);
                              setNewNegative('');
                              setShowAddNegative(false);
                            }
                          }}
                          className="text-rose-600 text-xs font-bold cursor-pointer"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddNegative(true)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-dashed border-rose-300 text-rose-600 hover:text-rose-800 hover:border-rose-400 text-xs font-medium transition-colors bg-white cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                        Add Negative Filter
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Portfolio Proof & Evidence Snippets */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 md:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Portfolio Proof &amp; Evidence Snippets</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {portfolio.length} Active Proofs
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Injected directly into proposal generations when matching job requirements are detected.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddPortfolio(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                  <span>+ Add Portfolio Item</span>
                </button>
              </div>

              <div className="space-y-3">
                {portfolio.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                          {idx === 0 && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                              Primary Match
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {item.technologies.map((t) => (
                            <span
                              key={t}
                              className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => alert(`Editing item: ${item.title}`)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeletePortfolioItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100">
                      "{item.description}"
                    </p>

                    <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                      <span className="material-symbols-outlined text-emerald-600 text-[14px]">check</span>
                      <span>{item.outcome}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add Portfolio Item */}
      {showAddPortfolio && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-headline">Add Portfolio Proof Item</h3>
              <button onClick={() => setShowAddPortfolio(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Project / Case Study Title</label>
                <input
                  type="text"
                  value={newPortTitle}
                  onChange={(e) => setNewPortTitle(e.target.value)}
                  placeholder="e.g. Distributed Payment Gateway"
                  className="w-full border border-slate-200 rounded p-2 text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={newPortTechs}
                  onChange={(e) => setNewPortTechs(e.target.value)}
                  placeholder="e.g. Laravel 11, Redis, Vue 3, AWS"
                  className="w-full border border-slate-200 rounded p-2 text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Proof Quote / Pitch Snippet</label>
                <textarea
                  value={newPortDesc}
                  onChange={(e) => setNewPortDesc(e.target.value)}
                  placeholder="e.g. Designed asynchronous queue workers handling 100k transactions..."
                  rows={2}
                  className="w-full border border-slate-200 rounded p-2 text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Metrics &amp; Outcome</label>
                <input
                  type="text"
                  value={newPortOutcome}
                  onChange={(e) => setNewPortOutcome(e.target.value)}
                  placeholder="e.g. 99.99% Uptime • Zero Data Loss"
                  className="w-full border border-slate-200 rounded p-2 text-slate-800 outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAddPortfolio(false)}
                className="px-3.5 py-2 border border-slate-300 rounded text-slate-700 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPortfolioItem}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer"
              >
                Add Proof
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
