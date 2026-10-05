import React, { useState } from 'react';
import { NavItem } from './AppSidebar';

interface AppHeaderProps {
  currentTab: NavItem;
  availableConnects: number | null;
  isConnected: boolean;
  accountName?: string | null;
  userEmail?: string | null;
  onRefreshConnects?: () => void;
  onQuickMatch?: () => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentTab,
  availableConnects,
  isConnected,
  accountName,
  userEmail,
  onRefreshConnects,
  onQuickMatch,
  onOpenSettings,
  onLogout,
  searchQuery = '',
  onSearchChange,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getInitials = (name?: string | null, email?: string | null): string => {
    const src = name || email || '';
    if (!src.trim()) return 'OI';
    const parts = src.trim().split(/[\s@]+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const userInitials = getInitials(accountName, userEmail);

  // Tab Breadcrumbs mapping matching Stitch
  const getBreadcrumbs = () => {
    switch (currentTab) {
      case 'dashboard':
        return { parent: 'Dashboard', page: 'Live Intelligence' };
      case 'jobs':
        return { parent: 'Jobs', page: 'Job Search & Filters' };
      case 'analysis':
        return { parent: 'Jobs', page: 'Job Analysis & Fit' };
      case 'proposal':
        return { parent: 'Proposals', page: 'Proposal Studio' };
      case 'review':
        return { parent: 'Review', page: 'Pre-Flight Submission' };
      case 'applications':
        return { parent: 'Applications', page: 'Overview' };
      case 'profile':
        return { parent: 'Profile', page: 'Profile Intelligence' };
      case 'settings':
        return { parent: 'Settings', page: 'Connection & AI Engine' };
      default:
        return { parent: 'Dashboard', page: 'Overview' };
    }
  };

  const { parent, page } = getBreadcrumbs();

  return (
    <header className="sticky top-0 right-0 h-14 border-b border-slate-200 bg-white/95 backdrop-blur-sm z-20 w-full flex items-center justify-between px-8 select-none">
      {/* Breadcrumb & Global Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500 whitespace-nowrap">
          <span className="hover:text-slate-900 transition-colors">{parent}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-semibold">{page}</span>
        </div>
        <div className="relative w-full max-w-sm ml-2">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search opportunities, clients, or tech..."
            className="w-full pl-8 pr-12 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-white border border-slate-200 rounded shadow-2xs pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Connects Balance Pill */}
        <button
          onClick={onRefreshConnects}
          title="Click to refresh connects"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[15px] text-blue-600">toll</span>
          <span>{availableConnects !== null ? `${availableConnects} Connects` : '— Connects'}</span>
        </button>

        {/* Connected Status Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
          <span>{isConnected ? 'Connected' : 'Offline'}</span>
        </div>

        {/* Quick Match CTA Button */}
        <button
          onClick={onQuickMatch}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">bolt</span>
          <span>Quick Match</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 p-3 z-50 text-xs">
              <div className="font-semibold text-slate-800 pb-2 border-b border-slate-100 flex justify-between items-center">
                <span>Recent Notifications</span>
                <span className="text-[10px] text-blue-600 cursor-pointer" onClick={() => setShowNotifications(false)}>Close</span>
              </div>
              <div className="mt-2 space-y-2">
                <div className="p-2 bg-slate-50 rounded hover:bg-blue-50/50 cursor-pointer">
                  <p className="font-medium text-slate-800">New 95/100 Opportunity Detected</p>
                  <p className="text-[11px] text-slate-500">FastAPI &amp; React project posted 12m ago.</p>
                </div>
                <div className="p-2 bg-slate-50 rounded hover:bg-blue-50/50 cursor-pointer">
                  <p className="font-medium text-slate-800">Client viewed proposal</p>
                  <p className="text-[11px] text-slate-500">TechCorp Inc opened your proposal 3h ago.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tune / Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          title="Engine Configuration"
        >
          <span className="material-symbols-outlined text-[20px]">tune</span>
        </button>

        {/* User Avatar & Logout Dropdown */}
        <div className="relative pl-2 border-l border-slate-200">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs ring-1 ring-slate-300 hover:opacity-90 transition-opacity cursor-pointer"
            title={accountName || userEmail || 'User Menu'}
          >
            {userInitials}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900 truncate">{accountName || 'Authenticated User'}</p>
                {userEmail && <p className="text-[11px] text-slate-500 truncate mt-0.5">{userEmail}</p>}
              </div>
              {onLogout && (
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left mt-1 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-medium transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Sign Out of Engine</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
