import React from 'react';
import { Zap, RefreshCw } from 'lucide-react';

interface AppHeaderProps {
  availableConnects: number;
  isConnected: boolean;
  onRefreshConnects: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ availableConnects, isConnected, onRefreshConnects }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-xs">
      <div>
        <h2 className="text-base font-bold text-slate-900 tracking-tight">Upwork Opportunity Intelligence</h2>
        <p className="text-xs text-slate-500">Internal AI Opportunity Analysis & Proposal Workspace</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Connection Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
          <span>{isConnected ? 'Upwork MCP Connected' : 'Disconnected'}</span>
        </div>

        {/* Connects Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-900">
          <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
          <span>Available Connects: <strong className="text-blue-700 font-bold">{availableConnects}</strong></span>
          <button 
            onClick={onRefreshConnects}
            title="Refresh Connects Balance"
            className="ml-1 text-blue-500 hover:text-blue-700 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>
    </header>
  );
};
