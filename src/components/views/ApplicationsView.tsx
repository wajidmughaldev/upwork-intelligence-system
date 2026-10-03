import React, { useState } from 'react';
import { Application, ApplicationStatus } from '../../types';

interface ApplicationsViewProps {
  applications: Application[];
  onUpdateStatus: (appId: string, status: ApplicationStatus) => void;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  applications,
  onUpdateStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'Draft' | 'Submitted' | 'Interview' | 'Hired' | 'Archived'>('Submitted');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(applications[0] || null);
  const [drawerTab, setDrawerTab] = useState<'proposal' | 'analysis' | 'client'>('proposal');
  const [copySuccess, setCopySuccess] = useState(false);

  // Follow-up flow state
  const [followUpStep, setFollowUpStep] = useState<'none' | 'draft' | 'review' | 'sent'>('none');
  const [followUpText, setFollowUpText] = useState(
    'Hi TechCorp team, following up on our recent proposal discussion. I have completed the preliminary architecture blueprint and am ready for a brief sync call.'
  );

  // Withdraw flow state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Notes state
  const [showNotes, setShowNotes] = useState(false);
  const [notesText, setNotesText] = useState('Client prefers morning EST sync calls. Tech stack is verified Laravel 11.');

  // Filtered applications
  const filteredApps = applications.filter((app) => {
    if (activeTab === 'Draft' && app.status !== 'Draft') return false;
    if (activeTab === 'Submitted' && app.status !== 'Submitted') return false;
    if (activeTab === 'Interview' && app.status !== 'Interview') return false;
    if (activeTab === 'Hired' && app.status !== 'Hired') return false;
    if (activeTab === 'Archived' && app.status !== 'Archived') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = app.jobTitle.toLowerCase().includes(q);
      const matchClient = app.clientName.toLowerCase().includes(q);
      if (!matchTitle && !matchClient) return false;
    }
    return true;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Submitted':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-800">
            Submitted
          </span>
        );
      case 'Interview':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-100 text-purple-700 border border-purple-200">
            Interview
          </span>
        );
      case 'Hired':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            Hired
          </span>
        );
      case 'Draft':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
            Draft
          </span>
        );
      case 'Archived':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
            Withdrawn
          </span>
        );
      default:
        return null;
    }
  };

  const handleCopyCoverLetter = () => {
    if (!selectedApp) return;
    navigator.clipboard.writeText(selectedApp.coverLetter);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleConfirmWithdraw = () => {
    if (!selectedApp) return;
    onUpdateStatus(selectedApp.id, 'Archived');
    setShowWithdrawModal(false);
  };

  const handleSendFollowUp = () => {
    setFollowUpStep('sent');
    setTimeout(() => {
      setFollowUpStep('none');
    }, 2500);
  };

  const totalActive = applications.filter((a) => a.status === 'Submitted' || a.status === 'Interview').length;
  const draftCount = applications.filter((a) => a.status === 'Draft').length;
  const submittedCount = applications.filter((a) => a.status === 'Submitted').length;
  const interviewCount = applications.filter((a) => a.status === 'Interview').length;
  const hiredCount = applications.filter((a) => a.status === 'Hired').length;
  const archivedCount = applications.filter((a) => a.status === 'Archived').length;

  return (
    <div className="p-6 space-y-5 bg-slate-50 relative min-h-screen">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold font-headline text-slate-900 tracking-tight">Applications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track submitted proposals, client engagement, interview velocity, and connect ROI.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Exporting Applications CSV...')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-slate-500">file_download</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => alert('Syncing application statuses via Upwork MCP...')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-slate-500">sync</span>
            <span>Sync Status</span>
          </button>
        </div>
      </div>

      {/* METRICS SUMMARY RIBBON (4 Compact Metric Cards) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Active */}
        <div className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Total Active</p>
            <p className="text-2xl font-bold font-headline text-slate-900 mt-0.5">{totalActive}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Proposals pending decision</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <span className="material-symbols-outlined text-[20px]">send</span>
          </div>
        </div>

        {/* Card 2: Client View Rate */}
        <div className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Client View Rate</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold font-headline text-slate-900">60%</span>
              <span className="inline-flex items-center text-[10px] font-semibold text-emerald-600">
                <span className="material-symbols-outlined text-[12px]">trending_up</span>
                +12%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">vs last 30 days avg</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined text-[20px]">visibility</span>
          </div>
        </div>

        {/* Card 3: Interview Velocity */}
        <div className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Interview Velocity</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold font-headline text-slate-900">40%</span>
              <span className="text-[10px] font-medium text-purple-600 bg-purple-50 px-1 rounded">2 active</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">High responsiveness tier</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <span className="material-symbols-outlined text-[20px]">forum</span>
          </div>
        </div>

        {/* Card 4: Connects Invested */}
        <div className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Connects Invested</p>
            <p className="text-2xl font-bold font-headline text-slate-900 mt-0.5">74</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Avg 14.8 connects / bid</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <span className="material-symbols-outlined text-[20px]">token</span>
          </div>
        </div>
      </section>

      {/* FILTER & TOOLBAR SECTION */}
      <section className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs space-y-3">
        {/* Top Toolbar row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-[18px]">
              filter_list
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter applications by keyword, skill, client..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-700">
            <div className="flex items-center border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white cursor-pointer hover:bg-slate-50">
              <span className="text-slate-400 mr-1.5 font-normal">Date:</span>
              <span className="font-medium">Last 30 Days</span>
              <span className="material-symbols-outlined text-sm ml-1 text-slate-400">arrow_drop_down</span>
            </div>
            <div className="flex items-center border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white cursor-pointer hover:bg-slate-50">
              <span className="text-slate-400 mr-1.5 font-normal">Score:</span>
              <span className="font-medium">80+ Match</span>
              <span className="material-symbols-outlined text-sm ml-1 text-slate-400">arrow_drop_down</span>
            </div>
            <div className="flex items-center border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white cursor-pointer hover:bg-slate-50">
              <span className="text-slate-400 mr-1.5 font-normal">Outcome:</span>
              <span className="font-medium">All Outcomes</span>
              <span className="material-symbols-outlined text-sm ml-1 text-slate-400">arrow_drop_down</span>
            </div>
          </div>
        </div>

        {/* Segment Control Filter Tabs */}
        <div className="flex items-center gap-1 border-t border-slate-100 pt-2.5 text-xs font-medium">
          <button
            onClick={() => setActiveTab('Draft')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'Draft'
                ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Draft <span className="ml-1 text-[10px] text-slate-400">({draftCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('Submitted')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'Submitted'
                ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Submitted <span className="ml-1 px-1.5 py-0.2 bg-blue-600 text-white rounded-full text-[10px]">{submittedCount}</span>
          </button>
          <button
            onClick={() => setActiveTab('Interview')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'Interview'
                ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Interview <span className="ml-1 text-[10px] text-slate-400">({interviewCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('Hired')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'Hired'
                ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Hired <span className="ml-1 text-[10px] text-slate-400">({hiredCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('Archived')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'Archived'
                ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Archived <span className="ml-1 text-[10px] text-slate-400">({archivedCount})</span>
          </button>
        </div>
      </section>

      {/* DENSE SAAS TABLE */}
      <section className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4">Job Title &amp; Client</th>
                <th className="py-2.5 px-3">Client Rating &amp; Spend</th>
                <th className="py-2.5 px-3">Opportunity Score</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Connects</th>
                <th className="py-2.5 px-3">Applied</th>
                <th className="py-2.5 px-3">Outcome / Activity</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No applications found in this tab.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const isSelected = selectedApp?.id === app.id;
                  return (
                    <tr
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50/70 border-l-4 border-l-blue-600'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-2">
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" title="Active selection"></div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span className="hover:underline">{app.jobTitle}</span>
                              {isSelected && (
                                <span className="text-[10px] px-1 py-0.2 bg-blue-100 text-blue-700 rounded font-medium">
                                  Drawer open
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                              <span className="font-medium text-slate-700">{app.clientName}</span>
                              <span
                                className="material-symbols-outlined text-[13px] text-blue-600"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                                title="Payment Verified"
                              >
                                verified
                              </span>
                              <span>• United States</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 text-slate-800 font-medium">
                          <span className="text-amber-500 font-bold">{app.clientRating?.toFixed(1) || '4.9'}</span>
                          <span
                            className="material-symbols-outlined text-amber-500 text-[14px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">{app.clientSpent || '$120k+ spend'}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          {app.opportunityScore} / 100 • Strong Match
                        </span>
                      </td>

                      <td className="py-3 px-3">{getStatusBadge(app.status)}</td>

                      <td className="py-3 px-3 font-medium text-slate-700">{app.connectsUsed} Connects</td>

                      <td className="py-3 px-3 text-slate-500">
                        <div>{app.appliedDate}</div>
                        <div className="text-[10px] text-slate-400">Recent</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="inline-flex items-center gap-1 text-blue-700 font-medium bg-blue-100/60 px-2 py-0.5 rounded text-[11px]">
                          <span className="material-symbols-outlined text-[14px]">visibility</span>
                          Viewed 3h ago
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedApp(app);
                            }}
                            className="p-1 rounded hover:bg-blue-100 text-blue-600 cursor-pointer"
                            title="Open Details Drawer"
                          >
                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-medium text-slate-800">1 to {filteredApps.length}</span> of {filteredApps.length} applications
          </div>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-400 cursor-not-allowed text-[11px]">
              Previous
            </button>
            <button className="px-2.5 py-1 rounded bg-blue-600 text-white font-medium text-[11px]">1</button>
            <button className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-400 cursor-not-allowed text-[11px]">
              Next
            </button>
          </div>
        </div>
      </section>

      {/* SLIDE-OVER DETAIL DRAWER OVERLAY & PANEL */}
      {selectedApp && (
        <>
          {/* Dim Backdrop */}
          <div
            onClick={() => setSelectedApp(null)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-[1px] z-40 transition-opacity"
          ></div>

          {/* DRAWER CONTAINER (w-[540px], fixed right, shadow-2xl) */}
          <div className="fixed inset-y-0 right-0 w-full sm:w-[540px] bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl transform transition-transform duration-200 ease-in-out">
            {/* DRAWER HEADER */}
            <div className="px-6 py-4 border-b border-slate-200 bg-white shrink-0">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                      Application Details • {selectedApp.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">APP-#{selectedApp.id.slice(-4)}</span>
                  </div>
                  <h2 className="text-base font-bold font-headline text-slate-900 leading-snug">
                    {selectedApp.jobTitle}
                  </h2>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="font-medium text-slate-700">{selectedApp.clientName}</span>
                    <span>•</span>
                    <span>United States (UTC-5)</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-900">${selectedApp.proposedBid} Fixed Bid</span>
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <a
                    href="https://upwork.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Open on Upwork"
                  >
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  </a>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Close drawer"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              </div>

              {/* Actionable Notification / Client Activity Banner */}
              <div className="mt-3.5 p-2.5 rounded-lg bg-blue-50 border border-blue-200/80 flex items-start gap-2.5 text-xs text-blue-900">
                <span className="material-symbols-outlined text-blue-600 text-[18px] shrink-0 mt-0.5">info</span>
                <div className="text-[11.5px] leading-relaxed">
                  <span className="font-semibold">Client viewed your proposal 3 hours ago.</span>
                  <span className="text-blue-700"> Recommended action: Keep availability window ready; client typically messages within 4h after review.</span>
                </div>
              </div>

              {/* TABS NAVIGATION */}
              <div className="flex border-b border-slate-200 -mb-4 mt-4 text-xs font-medium">
                <button
                  onClick={() => setDrawerTab('proposal')}
                  className={`py-2.5 px-4 flex items-center gap-1.5 border-b-2 cursor-pointer ${
                    drawerTab === 'proposal'
                      ? 'text-blue-600 border-blue-600 font-semibold'
                      : 'text-slate-500 hover:text-slate-800 border-transparent'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">description</span>
                  Submitted Proposal
                </button>
                <button
                  onClick={() => setDrawerTab('analysis')}
                  className={`py-2.5 px-4 flex items-center gap-1.5 border-b-2 cursor-pointer ${
                    drawerTab === 'analysis'
                      ? 'text-blue-600 border-blue-600 font-semibold'
                      : 'text-slate-500 hover:text-slate-800 border-transparent'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">analytics</span>
                  Job Analysis Summary
                </button>
                <button
                  onClick={() => setDrawerTab('client')}
                  className={`py-2.5 px-4 flex items-center gap-1.5 border-b-2 cursor-pointer ${
                    drawerTab === 'client'
                      ? 'text-blue-600 border-blue-600 font-semibold'
                      : 'text-slate-500 hover:text-slate-800 border-transparent'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">history</span>
                  Client History
                </button>
              </div>
            </div>

            {/* DRAWER SCROLLABLE BODY */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
              {drawerTab === 'proposal' && (
                <>
                  {/* STATS RIBBON (Bid Details Grid) */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Proposed Bid</div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">${selectedApp.proposedBid}</div>
                      <div className="text-[10px] text-slate-500">Net after 10% fee</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Connects Spent</div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">{selectedApp.connectsUsed} Connects</div>
                      <div className="text-[10px] text-blue-600 font-medium">Standard submission</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Estimated Response</div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">~4 Hours</div>
                      <div className="text-[10px] text-emerald-600 font-medium">High velocity</div>
                    </div>
                  </div>

                  {/* OPPORTUNITY SCORE BREAKDOWN CARD */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold text-xs">
                          <span className="material-symbols-outlined text-[16px]">target</span>
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900">Opportunity Score Breakdown</h3>
                          <p className="text-[10px] text-slate-500">Algorithmic fit calculated at submission</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-extrabold text-emerald-600 font-headline">
                          {selectedApp.opportunityScore}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">/100</span>
                      </div>
                    </div>

                    {/* Progress Metrics */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-600 font-medium">Technical Match</span>
                          <span className="font-bold text-slate-800">24/25</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '96%' }}></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-600 font-medium">Portfolio Proof</span>
                          <span className="font-bold text-slate-800">14/15</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '93%' }}></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-600 font-medium">Budget &amp; Rate Fit</span>
                          <span className="font-bold text-slate-800">10/10</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-600 font-medium">Connect Efficiency</span>
                          <span className="font-bold text-slate-800">4/5</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '80%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SUBMITTED COVER LETTER CARD */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-500 text-[18px]">notes</span>
                        <h3 className="text-xs font-bold text-slate-900">
                          Submitted Cover Letter <span className="text-[10px] text-blue-600 font-semibold">(AI-Optimized v2.4)</span>
                        </h3>
                      </div>
                      <button
                        onClick={handleCopyCoverLetter}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-50 px-2 py-1 rounded border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {copySuccess ? 'done' : 'content_copy'}
                        </span>
                        <span>{copySuccess ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="whitespace-pre-line text-xs text-slate-700 leading-relaxed font-sans bg-slate-50/70 p-3 rounded border border-slate-100">
                      {selectedApp.coverLetter}
                    </div>
                  </div>

                  {/* SCREENING QUESTIONS & ANSWERS */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-slate-500 text-[18px]">quiz</span>
                      Screening Questions Answered
                    </h3>
                    <div className="p-3 bg-slate-50 rounded border border-slate-200/80 space-y-1.5 text-xs">
                      <div className="font-medium text-slate-800 flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold">Q1:</span>
                        <span>Do you have experience with multi-tenant database indexing in Laravel?</span>
                      </div>
                      <div className="text-[11px] text-slate-600 pl-4 border-l-2 border-blue-200">
                        "Yes, implemented tenant-scoped schemas and optimized compound PostgreSQL indexes for 45k MAU on a production logistics SaaS."
                      </div>
                    </div>
                  </div>

                  {/* ATTACHED ARTIFACTS / PORTFOLIO PROOF */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-slate-500 text-[18px]">attachment</span>
                        Attached Artifacts &amp; Proof
                      </h3>
                      <span className="text-[10px] text-slate-400">1 File</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-red-50 border border-red-200 text-red-600 flex items-center justify-center font-bold text-[10px]">
                          PDF
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-800">SaaS_Architecture_Case_Study.pdf</p>
                          <p className="text-[10px] text-slate-400">1.8 MB • Uploaded &amp; Verified</p>
                        </div>
                      </div>
                      <button
                        onClick={() => alert('Opening preview of SaaS_Architecture_Case_Study.pdf...')}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-100 shadow-2xs transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm text-slate-500">visibility</span>
                        Preview
                      </button>
                    </div>
                  </div>
                </>
              )}

              {drawerTab === 'analysis' && (
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-4 text-xs">
                  <h3 className="font-bold text-slate-900">Job Analysis Summary</h3>
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-blue-900">
                    <p className="font-semibold mb-1">Algorithmic Fit Note:</p>
                    <p>Verified stack synergy with Laravel 11 and React 19 portfolio projects. Strong client feedback history.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">Original Brief Reference:</h4>
                    <p className="text-slate-600 whitespace-pre-line bg-slate-50 p-3 rounded border border-slate-100">
                      {selectedApp.originalJobBrief?.description || 'Looking for an experienced full-stack engineer to build out multi-tenant SaaS features.'}
                    </p>
                  </div>
                </div>
              )}

              {drawerTab === 'client' && (
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-4 text-xs">
                  <h3 className="font-bold text-slate-900">Client History &amp; Profile</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Total Spend</p>
                      <p className="text-sm font-bold text-slate-900">{selectedApp.clientSpent || '$120k+'}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Rating</p>
                      <p className="text-sm font-bold text-amber-500">★ {selectedApp.clientRating?.toFixed(1) || '4.9'}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-100">
                    <p className="font-semibold text-slate-800">Verified Client Sentiment:</p>
                    <p className="text-slate-600 mt-1">Prompt milestone releases, clear requirements, prompt response times.</p>
                  </div>
                </div>
              )}

              {/* Notes Section if toggled */}
              {showNotes && (
                <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-2xs space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">Private Application Notes</h4>
                    <button onClick={() => setShowNotes(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                  </div>
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    rows={3}
                    className="w-full border border-slate-200 rounded p-2 text-xs text-slate-800 outline-none"
                  />
                  <p className="text-[10px] text-slate-400">Notes are saved locally and never shared with the client.</p>
                </div>
              )}

              {/* Follow-up Message Dialog */}
              {followUpStep === 'draft' && (
                <div className="bg-white p-4 rounded-lg border border-blue-300 shadow-md space-y-3 text-xs animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">Draft Follow-Up Message</h4>
                    <button onClick={() => setFollowUpStep('none')} className="text-slate-400 hover:text-slate-600">✕</button>
                  </div>
                  <textarea
                    value={followUpText}
                    onChange={(e) => setFollowUpText(e.target.value)}
                    rows={4}
                    className="w-full border border-slate-200 rounded p-2 text-xs text-slate-800 outline-none"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setFollowUpStep('none')}
                      className="px-3 py-1.5 border border-slate-200 rounded text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setFollowUpStep('review')}
                      className="px-3.5 py-1.5 bg-blue-600 text-white rounded font-medium"
                    >
                      Review &amp; Confirm
                    </button>
                  </div>
                </div>
              )}

              {followUpStep === 'review' && (
                <div className="bg-white p-4 rounded-lg border border-blue-300 shadow-md space-y-3 text-xs animate-in fade-in duration-150">
                  <h4 className="font-bold text-slate-900">Review Follow-Up Message Before Send</h4>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-800 italic">
                    "{followUpText}"
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setFollowUpStep('draft')}
                      className="px-3 py-1.5 border border-slate-200 rounded text-slate-600"
                    >
                      Edit Draft
                    </button>
                    <button
                      onClick={handleSendFollowUp}
                      className="px-4 py-1.5 bg-blue-600 text-white rounded font-semibold"
                    >
                      Confirm &amp; Send Message
                    </button>
                  </div>
                </div>
              )}

              {followUpStep === 'sent' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs text-center font-medium">
                  Follow-up message dispatched to Upwork client chat ✓
                </div>
              )}
            </div>

            {/* DRAWER FIXED FOOTER ACTIONS */}
            <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">cancel</span>
                Withdraw Proposal
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  Edit Notes
                </button>
                <button
                  onClick={() => setFollowUpStep('draft')}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                  Follow-Up Message
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Withdraw Proposal Confirmation Modal */}
      {showWithdrawModal && selectedApp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
              <span className="material-symbols-outlined text-xl">warning</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-headline">Withdraw Proposal</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to withdraw your proposal for <span className="font-semibold text-slate-800">{selectedApp.jobTitle}</span>?
              </p>
            </div>
            <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded border border-rose-100">
              Note: Connects used for this proposal will not be refunded by Upwork upon voluntary withdrawal.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="px-3.5 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWithdraw}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
