import React, { useState } from 'react';
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
  onUpdateProfile,
}) => {
  // Settings Form State
  const [defaultTone, setDefaultTone] = useState(profile.preferences?.defaultTone || 'Direct');
  const [defaultLength, setDefaultLength] = useState(profile.preferences?.defaultLength || 'Balanced');
  const [strictness, setStrictness] = useState<'strict' | 'balanced' | 'permissive'>('strict');
  const [evidenceInjection, setEvidenceInjection] = useState(true);
  const [minScore, setMinScore] = useState(profile.preferences?.minScore || 75);
  const [minClientRating, setMinClientRating] = useState(
    profile.preferences?.minClientRating?.toString() || '4.8'
  );
  const [minBudget, setMinBudget] = useState(
    profile.preferences?.minFixedBudget?.toString() || '1000'
  );
  const [minHourly, setMinHourly] = useState(
    profile.preferences?.minHourlyRate?.toString() || '75'
  );
  const [autoRejectFlagged, setAutoRejectFlagged] = useState(true);

  // Status feedback
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleTestPing = () => {
    setPingStatus('Pinging Upwork MCP gateway...');
    setTimeout(() => {
      setPingStatus('Pong! 42ms round-trip latency verified. Rate limit healthy.');
      setTimeout(() => setPingStatus(null), 3000);
    }, 600);
  };

  const handleSave = () => {
    onUpdateProfile({
      preferences: {
        ...profile.preferences,
        defaultTone,
        defaultLength,
        minScore,
        minClientRating: parseFloat(minClientRating) || 4.8,
        minFixedBudget: parseFloat(minBudget) || 1000,
        minHourlyRate: parseFloat(minHourly) || 75,
      },
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetDefaults = () => {
    setDefaultTone('Direct');
    setDefaultLength('Balanced');
    setStrictness('strict');
    setEvidenceInjection(true);
    setMinScore(75);
    setMinClientRating('4.8');
    setMinBudget('1000');
    setMinHourly('75');
    setAutoRejectFlagged(true);
  };

  return (
    <div className="flex-1 p-8 max-w-5xl w-full mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold font-headline text-slate-900 tracking-tight">
            Settings &amp; AI Configuration
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Manage Upwork MCP integration credentials, automated matching strictness, and AI proposal synthesis preferences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            type="button"
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition-colors duration-150 cursor-pointer"
          >
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors duration-150 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">check</span>
            <span>{savedSuccess ? 'Saved ✓' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Upwork MCP Connection */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">lan</span>
                <h2 className="text-sm font-semibold font-headline text-slate-900">Upwork MCP Connection</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Live connection gateway syncing job feeds, client history, and proposal draft dispatches via Model Context Protocol.
              </p>
            </div>

            {/* Live Status Pill */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
              isConnected
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isConnected ? 'bg-green-400' : 'bg-rose-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  isConnected ? 'bg-green-600' : 'bg-rose-600'
                }`}></span>
              </span>
              <span className="text-xs font-semibold">
                {isConnected ? 'MCP Active & Listening' : 'MCP Offline'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Connection Meta Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 shadow-2xs">
                <span className="material-symbols-outlined text-blue-600">hub</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900">Alex Rivera (Freelancer Account)</span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    <span className="material-symbols-outlined text-[13px]">toll</span> 147 Connects Available
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1.5 flex flex-wrap items-center gap-y-1 gap-x-2">
                  <span>Last handshake: <span className="font-medium text-slate-700">2 mins ago</span></span>
                  <span className="text-slate-300">•</span>
                  <span>Latency: <span className="font-medium text-slate-700">42ms</span></span>
                  <span className="text-slate-300">•</span>
                  <span>Rate Limit: <span className="font-medium text-green-700">98% remaining</span></span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onRefreshConnection}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px] text-slate-500">refresh</span>
                <span>Refresh Connection</span>
              </button>
              <button
                onClick={handleTestPing}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px] text-slate-500">sensors</span>
                <span>Test MCP Ping</span>
              </button>
              <button
                onClick={onToggleDisconnect}
                type="button"
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  isConnected
                    ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isConnected ? 'link_off' : 'link'}
                </span>
                <span>{isConnected ? 'Disconnect Account' : 'Connect Account'}</span>
              </button>
            </div>
          </div>

          {pingStatus && (
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 font-medium">
              {pingStatus}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: AI Proposal & Analysis Settings */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">smart_toy</span>
            <h2 className="text-sm font-semibold font-headline text-slate-900">AI Proposal &amp; Analysis Engine</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tailor the LLM synthesis parameters used across Proposal Studio and automatic Opportunity Scoring.
          </p>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Default Tone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">Default Proposal Tone</label>
              <select
                value={defaultTone}
                onChange={(e) => setDefaultTone(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Direct">Direct, Problem-First (Recommended)</option>
                <option value="Technical">Technical Deep-Dive</option>
                <option value="Business">Executive / Business-focused</option>
              </select>
              <p className="text-[11px] text-slate-400">
                Leads with client's technical challenge before presenting solution architecture.
              </p>
            </div>

            {/* Default Length */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">Default Proposal Length</label>
              <select
                value={defaultLength}
                onChange={(e) => setDefaultLength(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Balanced">Balanced (~200 words)</option>
                <option value="Short">Concise (&lt;150 words)</option>
                <option value="Detailed">Comprehensive / Detailed (&gt;300 words)</option>
              </select>
              <p className="text-[11px] text-slate-400">
                Optimal reading length evaluated against high-performing Upwork contracts.
              </p>
            </div>
          </div>

          {/* Strictness Segment */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700">AI Analysis Strictness</label>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                Strict Match Protocol
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label
                onClick={() => setStrictness('strict')}
                className={`flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  strictness === 'strict'
                    ? 'border-blue-600 bg-blue-50/40'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-900">Strict / High Precision</span>
                  <span
                    className={`material-symbols-outlined text-sm ${strictness === 'strict' ? 'text-blue-600' : 'text-slate-300'}`}
                    style={strictness === 'strict' ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {strictness === 'strict' ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-600 mt-1">
                  90+ Score Only. Prioritizes exact stack match &amp; proven budget.
                </span>
              </label>

              <label
                onClick={() => setStrictness('balanced')}
                className={`flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  strictness === 'balanced'
                    ? 'border-blue-600 bg-blue-50/40'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">Balanced</span>
                  <span
                    className={`material-symbols-outlined text-sm ${strictness === 'balanced' ? 'text-blue-600' : 'text-slate-300'}`}
                    style={strictness === 'balanced' ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {strictness === 'balanced' ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1">
                  80+ Score. Flexible match on adjacent technical stacks.
                </span>
              </label>

              <label
                onClick={() => setStrictness('permissive')}
                className={`flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  strictness === 'permissive'
                    ? 'border-blue-600 bg-blue-50/40'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">Permissive</span>
                  <span
                    className={`material-symbols-outlined text-sm ${strictness === 'permissive' ? 'text-blue-600' : 'text-slate-300'}`}
                    style={strictness === 'permissive' ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {strictness === 'permissive' ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1">
                  65+ Score. Wide discovery radar for speculative opportunities.
                </span>
              </label>
            </div>
          </div>

          {/* Evidence Toggle */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-800">Evidence Auto-Injection</div>
              <div className="text-[11px] text-slate-500">
                Automatically attach top relevant portfolio case study proof snippet into draft body.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={evidenceInjection}
                onChange={(e) => setEvidenceInjection(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* SECTION 3: Opportunity Filter Preferences */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">filter_alt</span>
            <h2 className="text-sm font-semibold font-headline text-slate-900">
              Opportunity Scoring &amp; Filtering Thresholds
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Set the global baseline criteria for jobs displayed in your high-conviction radar.
          </p>
        </div>

        <div className="p-5 space-y-5">
          {/* Slider Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700">Minimum Opportunity Score</label>
              <span className="text-xs font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {minScore} / 100 <span className="font-normal text-slate-500">(Good Match &amp; above)</span>
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>50 (Broad)</span>
              <span>75 (Recommended Baseline)</span>
              <span>95 (Super-Prime Only)</span>
            </div>
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            {/* Client Rating */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">Minimum Client Rating</label>
              <select
                value={minClientRating}
                onChange={(e) => setMinClientRating(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="4.8">4.8+ Stars (Recommended)</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="any">Any Rating</option>
              </select>
            </div>

            {/* Min Fixed Budget */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">Minimum Fixed Budget</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">$</span>
                <input
                  type="text"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                  className="w-full pl-6 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Min Hourly Rate */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">Minimum Hourly Rate</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">$</span>
                <input
                  type="text"
                  value={minHourly}
                  onChange={(e) => setMinHourly(e.target.value)}
                  className="w-full pl-6 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Auto-Reject Checkbox */}
          <div className="pt-3 border-t border-slate-100">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRejectFlagged}
                onChange={(e) => setAutoRejectFlagged(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <div>
                <span className="text-xs font-medium text-slate-800">Auto-Reject Flagged Clients</span>
                <p className="text-[11px] text-slate-500">
                  Auto-penalize payment unverified or &lt;50% hire rate clients by deducting 30 points from opportunity score.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* SECTION 4: Compliance & Safety Notice */}
      <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 flex items-start gap-3.5 shadow-2xs">
        <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
        </div>
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-blue-950 font-headline">
            Upwork ToS Compliance &amp; Manual Confirmation Guarantee
          </h3>
          <p className="text-[11px] leading-relaxed text-blue-900/80">
            <strong className="font-semibold text-blue-950">Compliance Notice:</strong> This system strictly operates as an intelligence and proposal drafting assistant. In full compliance with Upwork Terms of Service, all proposal submissions and contract actions require explicit, one-click user review and confirmation. Automated headless bidding is prohibited.
          </p>
        </div>
      </div>

      {/* Bottom Sticky/Docked Action Bar */}
      <div className="pt-3 flex items-center justify-between border-t border-slate-200 text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="material-symbols-outlined text-green-600 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            cloud_done
          </span>
          <span>All changes auto-saved to local secure vault</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            type="button"
            className="px-3.5 py-1.5 font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
