import React from 'react';
import { LayoutDashboard, Briefcase, FileText, UserCheck, Settings, ShieldCheck } from 'lucide-react';

export type NavItem = 'dashboard' | 'jobs' | 'analysis' | 'proposal' | 'review' | 'applications' | 'profile' | 'settings';

interface AppSidebarProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  applicationsCount: number;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ currentTab, onSelectTab, applicationsCount }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: FileText, badge: applicationsCount },
    { id: 'profile', label: 'Profile Intelligence', icon: UserCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col min-h-screen border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            Upwork Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Opportunity & Proposal Suite</p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
          Workspace Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id || 
            (item.id === 'jobs' && (currentTab === 'analysis' || currentTab === 'proposal' || currentTab === 'review'));
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as NavItem)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  isActive ? 'bg-blue-800 text-blue-100' : 'bg-slate-800 text-slate-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Safety Notice Footer */}
      <div className="p-4 m-3 bg-slate-800/80 rounded-lg border border-slate-700/60">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          User Confirmation Mode
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Proposals require manual confirmation. No auto-submissions.
        </p>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30">
          W
        </div>
        <div className="truncate">
          <p className="text-xs font-medium text-white truncate">Wajid (Freelancer)</p>
          <p className="text-[11px] text-emerald-400 font-medium">Upwork: Connected</p>
        </div>
      </div>
    </aside>
  );
};
