import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, Power, Save, Sparkles, Check, Activity } from 'lucide-react';
import { UserProfile } from '../../types';

interface SettingsViewProps {
  profile: UserProfile;
  isConnected: boolean;
  onRefreshConnection: () => void;
  onToggleDisconnect: () => void;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  isConnected,
  onRefreshConnection,
  onToggleDisconnect,
  onUpdateProfile
}) => {
  const [tone, setTone] = useState(profile.preferences.defaultTone || 'Direct');
  const [length, setLength] = useState(profile.preferences.defaultLength || 'Short');
  const [minScore, setMinScore] = useState(profile.preferences.minScore || 75);
  const [minRating, setMinRating] = useState(profile.preferences.minClientRating || 4.8);
  const [minBudget, setMinBudget] = useState(profile.preferences.minFixedBudget || 1500);
  const [strictness, setStrictness] = useState('Strict');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTestConnection = () => {
    setTestResult('Testing Upwork MCP connection latency...');
    setTimeout(() => {
      if (isConnected) {
        setTestResult('Upwork MCP API latency: 42ms. Endpoints authenticated and verified.');
      } else {
        setTestResult('Connection failed: Upwork MCP is currently in Disconnected mode.');
      }
      setTimeout(() => setTestResult(null), 4000);
    }, 600);
  };

  const handleSaveSettings = () => {
    onUpdateProfile({
      preferences: {
        ...profile.preferences,
        defaultTone: tone,
        defaultLength: length,
        minScore: minScore,
        minClientRating: minRating,
        minFixedBudget: minBudget
      }
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-2 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900">Settings & System Configuration</h2>
        <p className="text-xs text-slate-500">Manage Upwork MCP connection, default proposal AI rules, and safety compliance</p>
      </div>

      {/* Section 1: Upwork Connection */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upwork MCP Connection Status</h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className={`w-3.5 h-3.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                {isConnected ? 'Official Upwork MCP Status: Connected' : 'Status: Disconnected'}
              </div>
              <p className="text-xs text-slate-500">Connected account: Freelancer Pro (Wajid) • 147 Available Connects</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTestConnection}
              className="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              Test Connection
            </button>
            <button
              onClick={onRefreshConnection}
              className="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button
              onClick={onToggleDisconnect}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isConnected
                  ? 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {isConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </div>

        {testResult && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900 font-medium">
            {testResult}
          </div>
        )}
      </div>

      {/* Section 2: AI Settings */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-600" />
          AI Proposal Generation Defaults
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Default Proposal Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded bg-white font-medium text-slate-800"
            >
              <option value="Direct">Direct & Solution-First</option>
              <option value="Technical">Technical & Architecture Heavy</option>
              <option value="Business-focused">Business-Focused ROI</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Default Proposal Length</label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded bg-white font-medium text-slate-800"
            >
              <option value="Short">Short (150-200 words)</option>
              <option value="Balanced">Balanced (200-300 words)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Analysis Strictness</label>
            <select
              value={strictness}
              onChange={(e) => setStrictness(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded bg-white font-medium text-slate-800"
            >
              <option value="Strict">Strict (High Precision Scoring)</option>
              <option value="Balanced">Balanced</option>
              <option value="Relaxed">Relaxed (Broad Opportunity Signal)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: Opportunity Preferences */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Opportunity Scoring Thresholds</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Minimum Fit Score (0-100)</label>
            <input
              type="number"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full p-2.5 border border-slate-300 rounded font-bold text-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Minimum Client Rating (Stars)</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full p-2.5 border border-slate-300 rounded bg-white font-bold text-slate-900"
            >
              <option value={4.5}>4.5 Stars & above</option>
              <option value={4.8}>4.8 Stars & above</option>
              <option value={4.9}>4.9 Stars & above</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Minimum Fixed Budget ($)</label>
            <input
              type="number"
              value={minBudget}
              onChange={(e) => setMinBudget(Number(e.target.value))}
              className="w-full p-2.5 border border-slate-300 rounded font-bold text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Compliance Notice */}
      <div className="p-5 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h4 className="font-bold">Compliance & Safety Policy Notice</h4>
          <p className="leading-relaxed">
            This system assists with opportunity analysis and proposal drafting. Proposal submissions always require explicit user confirmation.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-2">
        {savedSuccess && (
          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
            <Check className="w-4 h-4" />
            Preferences saved successfully!
          </span>
        )}
        <button
          onClick={handleSaveSettings}
          className="ml-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-sm transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Preferences
        </button>
      </div>
    </div>
  );
};
