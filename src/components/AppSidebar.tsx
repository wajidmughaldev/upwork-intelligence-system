import React from 'react';

export type NavItem = 'dashboard' | 'jobs' | 'analysis' | 'proposal' | 'review' | 'applications' | 'profile' | 'settings';

interface AppSidebarProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  applicationsCount: number;
  jobsCount?: number;
  accountName?: string | null;
  profileTitle?: string | null;
  hourlyRate?: string | null;
  isConnected?: boolean;
  onSync?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentTab,
  onSelectTab,
  applicationsCount,
  jobsCount = 18,
  accountName,
  profileTitle,
  hourlyRate,
  isConnected,
  onSync,
}) => {
  const isJobsActive = currentTab === 'jobs' || currentTab === 'analysis' || currentTab === 'proposal' || currentTab === 'review';

  const getInitials = (name?: string | null): string => {
    if (!name || !name.trim()) return '—';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const displayName = accountName || 'Upwork Account';
  const initials = getInitials(accountName);
  const subText = isConnected
    ? (hourlyRate ? `${profileTitle ? profileTitle + ' • ' : ''}$${hourlyRate}/hr` : (profileTitle || 'Account Connected'))
    : 'Disconnected';

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 border-r border-slate-200 bg-white flex flex-col justify-between z-30 select-none">
      <div className="h-full flex flex-col justify-between p-4">
        {/* Upper Section */}
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 pt-1 pb-1">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                <span className="material-symbols-outlined text-[18px]">psychology</span>
              </div>
              <div>
                <div className="text-sm font-bold font-headline text-slate-900 tracking-tight leading-none">Opportunity Intel</div>
                <div className="text-[11px] font-medium text-slate-500 mt-1 leading-none">Upwork Pro Engine</div>
              </div>
            </div>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
              Sync
            </span>
          </div>

          {/* Sync Upwork CTA Button */}
          <div className="px-1">
            <button
              onClick={onSync}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-sm transition-colors duration-150 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">sync</span>
              <span>Sync Upwork</span>
            </button>
          </div>

          {/* Primary Navigation */}
          <nav className="space-y-1">
            {/* 1. Dashboard */}
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium text-xs transition-colors duration-150 cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={currentTab === 'dashboard' ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  dashboard
                </span>
                <span>Dashboard</span>
              </div>
            </button>

            {/* 2. Jobs */}
            <button
              onClick={() => onSelectTab('jobs')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium text-xs transition-colors duration-150 cursor-pointer ${
                isJobsActive
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={isJobsActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  work
                </span>
                <span>Jobs</span>
              </div>
              <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                isJobsActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {jobsCount}
              </span>
            </button>

            {/* 3. Applications */}
            <button
              onClick={() => onSelectTab('applications')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium text-xs transition-colors duration-150 cursor-pointer ${
                currentTab === 'applications'
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={currentTab === 'applications' ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  send
                </span>
                <span>Applications</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded-full font-bold text-[10px] leading-none ${
                currentTab === 'applications' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {applicationsCount}
              </span>
            </button>

            {/* 4. Profile Intelligence */}
            <button
              onClick={() => onSelectTab('profile')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium text-xs transition-colors duration-150 cursor-pointer ${
                currentTab === 'profile'
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={currentTab === 'profile' ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  psychology
                </span>
                <span>Profile Intelligence</span>
              </div>
            </button>

            {/* 5. Settings */}
            <button
              onClick={() => onSelectTab('settings')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium text-xs transition-colors duration-150 cursor-pointer ${
                currentTab === 'settings'
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={currentTab === 'settings' ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  settings
                </span>
                <span>Settings</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Lower Navigation & User Badge */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="space-y-1">
            <button
              onClick={() => alert('Documentation: Complete reference for Upwork Opportunity Intelligence, MCP schemas, and AI prompts.')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 font-medium text-xs hover:bg-slate-100 transition-colors duration-150 text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
              <span>Documentation</span>
            </button>
            <button
              onClick={() => alert('Help & Support: For assistance or troubleshooting contact support@upwork-intel.internal')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 font-medium text-xs hover:bg-slate-100 transition-colors duration-150 text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">help</span>
              <span>Help &amp; Support</span>
            </button>
          </div>

          {/* User Profile Card */}
          <div
            onClick={() => onSelectTab('profile')}
            className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center shrink-0 ring-1 ring-slate-300">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 truncate">{displayName}</p>
              <p className="text-[10px] text-slate-500 truncate">{subText}</p>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-sm">unfold_more</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
