import React, { useState, useEffect } from 'react';
import { Job, UserProfile, ProposalVersion } from '../../types';

interface ProposalStudioViewProps {
  job: Job;
  profile: UserProfile;
  proposalText: string;
  onBack: () => void;
  onUpdateProposal: (text: string, tone: string, length: string) => void;
  onContinueToReview: (text: string, tone: string, length: string) => void;
  onRefineProposal: (action: 'improve_opening' | 'make_shorter' | 'different_proof') => string;
  onRegenerate: (tone: string, length: string, customInstructions?: string) => string;
}

export const ProposalStudioView: React.FC<ProposalStudioViewProps> = ({
  job,
  proposalText,
  onBack,
  onUpdateProposal,
  onContinueToReview,
  onRefineProposal,
  onRegenerate,
}) => {
  const [content, setContent] = useState(proposalText);
  const [tone, setTone] = useState<'Direct' | 'Technical' | 'Business'>('Direct');
  const [length, setLength] = useState<'Short' | 'Balanced'>('Balanced');
  const [customInstructions, setCustomInstructions] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [selectedCaseStudy, setSelectedCaseStudy] = useState(0);

  // Version History management
  const [versions, setVersions] = useState<ProposalVersion[]>([
    {
      id: 'v-initial',
      versionNumber: 1,
      label: 'v1 — Initial AI Synthesis',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: proposalText,
      tone: 'Direct',
      length: 'Balanced',
      sourceAction: 'Initial AI Synthesis'
    }
  ]);

  useEffect(() => {
    setContent(proposalText);
  }, [proposalText]);

  const recordVersion = (newText: string, actionLabel: string, activeTone = tone, activeLength = length) => {
    const nextNum = versions.length + 1;
    const newVersion: ProposalVersion = {
      id: `v-${Date.now()}`,
      versionNumber: nextNum,
      label: `v${nextNum} — ${actionLabel}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: newText,
      tone: activeTone,
      length: activeLength,
      sourceAction: actionLabel
    };
    setVersions((prev) => [newVersion, ...prev]);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onUpdateProposal(e.target.value, tone, length);
  };

  const handleCopyProposal = () => {
    navigator.clipboard.writeText(content);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSaveDraft = () => {
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2500);
  };

  const handleRegenerateAction = () => {
    const newText = onRegenerate(tone, length, customInstructions);
    setContent(newText);
    recordVersion(newText, `Regenerated (${tone}, ${length})`);
  };

  const handleRefineAction = (action: 'improve_opening' | 'make_shorter' | 'different_proof', label: string) => {
    const refined = onRefineProposal(action);
    setContent(refined);
    recordVersion(refined, label);
  };

  const handleRestoreVersion = (ver: ProposalVersion) => {
    setContent(ver.text);
    if (ver.tone === 'Direct' || ver.tone === 'Technical' || ver.tone === 'Business') {
      setTone(ver.tone);
    }
    if (ver.length === 'Short' || ver.length === 'Balanced') {
      setLength(ver.length);
    }
    onUpdateProposal(ver.text, ver.tone, ver.length);
    setShowVersionHistory(false);
  };

  // Formatting helpers
  const handleFormatText = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('proposal-canvas-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const sel = content.substring(start, end);
    const replacement = `${prefix}${sel || 'text'}${suffix}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    onUpdateProposal(newContent, tone, length);
  };

  // Word and character counts
  const wordsCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charsCount = content.length;
  const readTime = (wordsCount / 180).toFixed(1);

  const caseStudies = [
    {
      title: 'Multi-Tenant SaaS Dashboard (B2B FinTech)',
      subtitle: '99.9% uptime, 150ms p95 latency, 45k MAU across microservices.',
      link: 'portfolio-live-demo.dev'
    },
    {
      title: 'High-Throughput E-commerce REST API',
      subtitle: 'Processed 2M daily webhooks with Redis queue workers on AWS.',
      link: 'github.com/alexrivera/high-throughput-api'
    },
    {
      title: 'Real-Time Telehealth Dashboard (React 18)',
      subtitle: 'HIPAA compliant video consultation with zero-lag WebSocket sync.',
      link: 'telehealth-suite-preview.app'
    }
  ];

  return (
    <div className="pb-24">
      <div className="max-w-[1440px] mx-auto px-8 py-6 space-y-6">
        {/* Header Strip Inside Workspace */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="space-y-1">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors mb-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              <span>Back to Job Analysis</span>
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold font-headline text-slate-900 tracking-tight">Proposal Studio</h1>
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-700 border border-slate-200">
                v2.4 Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 font-body">
              AI-assisted structured proposal drafting tailored to job requirements and client history
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-2">
              <span className="material-symbols-outlined text-[16px] text-slate-400">check_circle</span>
              <span>{draftSaved ? 'Saved to Local Vault' : 'Draft Auto-saved 1m ago'}</span>
            </div>

            <button
              onClick={handleCopyProposal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copySuccess ? 'done' : 'content_copy'}
              </span>
              <span>{copySuccess ? 'Copied!' : 'Copy Proposal'}</span>
            </button>

            <a
              href={`https://www.upwork.com/jobs/${job.id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              <span>Preview on Upwork</span>
            </a>
          </div>
        </div>

        {/* Two-Column Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Main Structured Editor (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden flex flex-col">
              {/* Top Editor Toolbar */}
              <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    Draft
                  </span>
                  <div className="h-3.5 w-px bg-slate-300"></div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span><strong className="text-slate-800 font-medium">{wordsCount}</strong> words</span>
                    <span>•</span>
                    <span><strong className="text-slate-800 font-medium">{charsCount}</strong> chars</span>
                    <span>•</span>
                    <span>~{readTime} min read</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Version History Toggle */}
                  <button
                    onClick={() => setShowVersionHistory(!showVersionHistory)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-medium transition-colors cursor-pointer"
                    title="View Proposal Snapshots"
                  >
                    <span className="material-symbols-outlined text-[15px] text-blue-600">history</span>
                    <span>History ({versions.length})</span>
                  </button>

                  {/* AI Score Optimization Pill */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-xs font-semibold">
                    <span className="material-symbols-outlined text-[16px] text-green-600">auto_awesome</span>
                    <span>Optimized for {job.opportunityScore} Match Score</span>
                  </div>
                </div>
              </div>

              {/* Formatting Sub-toolbar */}
              <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleFormatText('**', '**')}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Bold"
                  >
                    <span className="material-symbols-outlined text-[18px]">format_bold</span>
                  </button>
                  <button
                    onClick={() => handleFormatText('_', '_')}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Italic"
                  >
                    <span className="material-symbols-outlined text-[18px]">format_italic</span>
                  </button>
                  <div className="h-4 w-px bg-slate-200 mx-1"></div>
                  <button
                    onClick={() => handleFormatText('\n- ')}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Bullet List"
                  >
                    <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                  </button>
                  <button
                    onClick={() => handleFormatText('\n1. ')}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Numbered List"
                  >
                    <span className="material-symbols-outlined text-[18px]">format_list_numbered</span>
                  </button>
                  <div className="h-4 w-px bg-slate-200 mx-1"></div>
                  <button
                    onClick={() => handleFormatText('\nProof snippet: 99.9% uptime across 45k MAU on multi-tenant cluster.\n')}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Insert Snippet"
                  >
                    <span className="material-symbols-outlined text-[16px]">data_object</span>
                    <span>Insert Snippet</span>
                  </button>
                </div>

                <button
                  onClick={() => { setContent(''); onUpdateProposal('', tone, length); }}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 px-2 py-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">clear_all</span>
                  <span>Clear</span>
                </button>
              </div>

              {/* Version History Drawer (Compact overlay within editor) */}
              {showVersionHistory && (
                <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs animate-in fade-in duration-150">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      Proposal Version History
                    </span>
                    <button
                      onClick={() => setShowVersionHistory(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {versions.map((ver, idx) => (
                      <div
                        key={ver.id}
                        className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between hover:border-blue-300 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">
                              {ver.label || ver.sourceAction || `Version ${versions.length - idx}`}
                            </span>
                            <span className="text-[10px] text-slate-400">{ver.timestamp}</span>
                            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px]">
                              {ver.tone} • {ver.length}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{ver.text}</p>
                        </div>
                        <button
                          onClick={() => handleRestoreVersion(ver)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors cursor-pointer"
                        >
                          Restore
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cover Letter Proposal Editor Canvas */}
              <div className="p-6 bg-white min-h-[440px] flex flex-col">
                <textarea
                  id="proposal-canvas-textarea"
                  value={content}
                  onChange={handleTextChange}
                  placeholder="Hi, I noticed you need a developer for this project..."
                  rows={16}
                  className="w-full flex-1 text-sm text-slate-800 leading-relaxed font-sans bg-transparent outline-none resize-none placeholder-slate-400"
                  spellCheck={false}
                />
              </div>

              {/* Injected Elements / Verified Match Highlights Footer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
                  Injected Signals:
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-green-50 text-green-700 border border-green-200 text-xs font-medium">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                  Matched {job.skillTags?.[0] || 'Technical Stack'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-green-50 text-green-700 border border-green-200 text-xs font-medium">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                  Matched {job.skillTags?.[1] || 'Framework'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  Injected Enterprise SaaS Proof
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                  <span className="material-symbols-outlined text-[14px]">call_made</span>
                  Low-friction Call to Action
                </span>
              </div>
            </div>

            {/* Tip / Guideline Callout */}
            <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100 flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-600 text-[20px] mt-0.5">info</span>
              <div className="text-xs text-blue-900 leading-relaxed">
                <span className="font-semibold text-blue-950">Proposal Intelligence Note:</span> This client typically awards proposals within 4 hours if a relevant past repository or metrics snippet is provided in the first 3 sentences. Keep the hook direct and concise.
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar Controls & Job Context (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* 1. Job Summary Card */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Target Opportunity</span>
                  <h3
                    onClick={onBack}
                    className="text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors leading-snug"
                  >
                    {job.title}
                  </h3>
                </div>
                <span className="px-2 py-1 rounded bg-green-50 text-green-700 border border-green-200 text-[11px] font-bold whitespace-nowrap">
                  {job.opportunityScore}/100 • Strong Match
                </span>
              </div>

              <div className="flex items-baseline gap-2 pt-1 border-t border-slate-100">
                <span className="text-base font-bold text-slate-900">
                  {job.budget}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {job.budgetType === 'fixed' ? 'Fixed-Price' : 'Hourly'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500">Est. 2 weeks</span>
              </div>

              {/* Client Info Snippet */}
              <div className="p-2.5 rounded bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center gap-1.5 font-medium text-slate-800">
                  <span className="material-symbols-outlined text-[16px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  <span>{job.client.rating.toFixed(1)} ({job.client.reviewsCount || 48} reviews)</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-green-600 font-semibold">{job.client.hireRate || 94}% hire rate</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  <span>{job.client.location}</span>
                  <span className="text-slate-300">•</span>
                  <span>{job.client.totalSpent} total spent</span>
                </div>
              </div>

              {/* Key Job Signals */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Submission Cost:</span>
                  <span className="font-medium text-slate-800">{job.connectsRequired} Connects</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Tech Stack:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[190px]">
                    {job.skillTags?.join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. AI Proposal Tuning Card */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">auto_awesome</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-headline">
                    AI Proposal Tuning
                  </h3>
                </div>
                <span className="text-[10px] font-medium text-slate-400">AI Assisted</span>
              </div>

              {/* Tone Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Tone</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
                  {(['Direct', 'Technical', 'Business'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`py-1 px-2 text-xs rounded transition-all text-center cursor-pointer ${
                        tone === t
                          ? 'font-semibold bg-white text-blue-600 shadow-xs'
                          : 'font-medium text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Length Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Length</label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg">
                  <button
                    onClick={() => setLength('Short')}
                    className={`py-1 px-2 text-xs rounded transition-all text-center cursor-pointer ${
                      length === 'Short'
                        ? 'font-semibold bg-white text-blue-600 shadow-xs'
                        : 'font-medium text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Short (&lt;150w)
                  </button>
                  <button
                    onClick={() => setLength('Balanced')}
                    className={`py-1 px-2 text-xs rounded transition-all text-center cursor-pointer ${
                      length === 'Balanced'
                        ? 'font-semibold bg-white text-blue-600 shadow-xs'
                        : 'font-medium text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Balanced (~200w)
                  </button>
                </div>
              </div>

              {/* Custom Instructions Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Custom Instructions / Focus</label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Emphasize React Query experience and zero-downtime database migration..."
                  rows={2}
                  className="w-full text-xs rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none text-slate-700 p-2"
                />
              </div>

              {/* Generator Quick Action Buttons 2x2 Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleRegenerateAction}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-500">refresh</span>
                  <span>Regenerate</span>
                </button>
                <button
                  onClick={() => handleRefineAction('improve_opening', 'Improved Opening Hook')}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-blue-600">bolt</span>
                  <span>Improve Opening</span>
                </button>
                <button
                  onClick={() => handleRefineAction('make_shorter', 'Made Shorter')}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-500">compress</span>
                  <span>Make Shorter</span>
                </button>
                <button
                  onClick={() => handleRefineAction('different_proof', 'Used Alternate Proof')}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-500">swap_horiz</span>
                  <span>Use Diff Proof</span>
                </button>
              </div>
            </div>

            {/* 3. Relevant Portfolio Proof Selector Card */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-headline">
                  Referenced Case Study
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 rounded">
                  Selected
                </span>
              </div>

              {/* Active Selected Proof Item */}
              <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/30 flex items-start gap-3">
                <input
                  type="radio"
                  checked={true}
                  readOnly
                  className="mt-1 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 border-slate-300"
                />
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                    {caseStudies[selectedCaseStudy].title}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    {caseStudies[selectedCaseStudy].subtitle}
                  </p>
                  <div className="pt-1 flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] text-slate-400">link</span>
                      {caseStudies[selectedCaseStudy].link}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => setSelectedCaseStudy((prev) => (prev + 1) % caseStudies.length)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Cycle proof asset ({caseStudies.length - 1} more available)</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Floating Bar / Footer Action Bar */}
      <div className="fixed bottom-0 right-0 left-64 bg-white/95 backdrop-blur-sm border-t border-slate-200 py-3 px-8 z-30 shadow-md">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          {/* Left side Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span className="material-symbols-outlined text-green-600 text-[18px]">verified_user</span>
              <span>
                <strong className="text-slate-900">{job.connectsRequired} Connects</strong> required upon submission
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">147 Available in Balance</span>
            </div>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
              Safe Match Verified
            </span>
          </div>

          {/* Right side Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Discard
            </button>
            <button
              onClick={handleSaveDraft}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              {draftSaved ? 'Draft Saved ✓' : 'Save Draft'}
            </button>
            <button
              onClick={() => onContinueToReview(content, tone, length)}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <span>Continue to Review</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
