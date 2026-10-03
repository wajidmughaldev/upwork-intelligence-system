import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, RefreshCw, Wand2, Scissors, FileCode, Check } from 'lucide-react';
import { Job, UserProfile, ProposalVersion } from '../types';
import { ProposalVersionHistory } from './ProposalVersionHistory';

interface ProposalEditorProps {
  job: Job;
  profile: UserProfile;
  initialText: string;
  onUpdateProposal: (text: string, tone: string, length: string) => void;
  onContinueToReview: (text: string, tone: string, length: string) => void;
  onRefineProposal: (action: 'improve_opening' | 'make_shorter' | 'different_proof') => string;
  onRegenerate: (tone: string, length: string, customInstructions?: string) => string;
}

export const ProposalEditor: React.FC<ProposalEditorProps> = ({
  job,
  profile,
  initialText,
  onUpdateProposal,
  onContinueToReview,
  onRefineProposal,
  onRegenerate
}) => {
  const [proposalText, setProposalText] = useState<string>(initialText);
  const [tone, setTone] = useState<string>('Direct');
  const [length, setLength] = useState<string>('Short');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [versions, setVersions] = useState<ProposalVersion[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<string>('');

  // Load versions from localStorage on mount / job change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storageKey = `uoi_versions_${job.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: ProposalVersion[] = JSON.parse(saved);
        setVersions(parsed);
        if (parsed.length > 0) {
          setActiveVersionId(parsed[0].id);
        }
      } else {
        // Initialize version 1 with initialText
        const v1: ProposalVersion = {
          id: `ver-${Date.now()}-1`,
          versionNumber: 1,
          label: 'v1 — Current',
          text: initialText,
          tone: 'Direct',
          length: 'Short',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sourceAction: 'Initial AI Generation'
        };
        const initialList = [v1];
        setVersions(initialList);
        setActiveVersionId(v1.id);
        localStorage.setItem(storageKey, JSON.stringify(initialList));
      }
    } catch (e) {
      console.error('Error loading versions from storage:', e);
    }
  }, [job.id, initialText]);

  // Synchronize proposal text if initialText changes from parent
  useEffect(() => {
    setProposalText(initialText);
  }, [initialText]);

  const saveNewVersion = (newText: string, actionName: string, newTone = tone, newLength = length) => {
    if (typeof window === 'undefined') return;
    const storageKey = `uoi_versions_${job.id}`;
    const nextVerNum = versions.length > 0 ? Math.max(...versions.map(v => v.versionNumber)) + 1 : 1;

    // Relabel previous current
    const updatedPrev = versions.map(v => ({
      ...v,
      label: v.label.replace(' — Current', '')
    }));

    const newVer: ProposalVersion = {
      id: `ver-${Date.now()}-${nextVerNum}`,
      versionNumber: nextVerNum,
      label: `v${nextVerNum} — Current`,
      text: newText,
      tone: newTone,
      length: newLength,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sourceAction: actionName
    };

    const newVersionList = [newVer, ...updatedPrev];
    setVersions(newVersionList);
    setActiveVersionId(newVer.id);
    localStorage.setItem(storageKey, JSON.stringify(newVersionList));
  };

  const wordCount = proposalText.trim() ? proposalText.trim().split(/\s+/).length : 0;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updated = e.target.value;
    setProposalText(updated);
    onUpdateProposal(updated, tone, length);
  };

  const handleToneChange = (newTone: string) => {
    setTone(newTone);
    onUpdateProposal(proposalText, newTone, length);
  };

  const handleLengthChange = (newLength: string) => {
    setLength(newLength);
    onUpdateProposal(proposalText, tone, newLength);
  };

  const handleRegenerateAction = () => {
    const newText = onRegenerate(tone, length, customInstructions);
    setProposalText(newText);
    saveNewVersion(newText, `Regenerated (${tone}, ${length})`, tone, length);
  };

  const handleRefine = (action: 'improve_opening' | 'make_shorter' | 'different_proof') => {
    const refinedText = onRefineProposal(action);
    setProposalText(refinedText);
    const actionLabel =
      action === 'improve_opening'
        ? 'Improved Opening Hook'
        : action === 'make_shorter'
        ? 'Shortened Content'
        : 'Swapped Portfolio Proof';
    saveNewVersion(refinedText, actionLabel);
  };

  const handleRestoreVersion = (ver: ProposalVersion) => {
    setProposalText(ver.text);
    setTone(ver.tone);
    setLength(ver.length);
    setActiveVersionId(ver.id);
    onUpdateProposal(ver.text, ver.tone, ver.length);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Main Proposal Workspace */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Proposal Cover Letter Workspace</h3>
              <p className="text-xs text-slate-500">Edit, structure, and refine before submission review</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500">
                Word Count: <strong className="text-slate-800">{wordCount}</strong>
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                AI Assisted • Client-Focused
              </span>
            </div>
          </div>

          {/* Textarea */}
          <div className="space-y-1.5">
            <textarea
              rows={14}
              value={proposalText}
              onChange={handleTextChange}
              className="w-full p-4 rounded-md border border-slate-300 font-mono text-sm text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Write or generate your tailored proposal..."
            />
          </div>

          {/* Quick Refine Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Quick Refinements:</span>
              <button
                onClick={() => handleRefine('improve_opening')}
                className="px-2.5 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center gap-1 transition-colors"
              >
                <Wand2 className="w-3 h-3 text-blue-600" />
                Improve Opening
              </button>
              <button
                onClick={() => handleRefine('make_shorter')}
                className="px-2.5 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center gap-1 transition-colors"
              >
                <Scissors className="w-3 h-3 text-amber-600" />
                Make Shorter
              </button>
              <button
                onClick={() => handleRefine('different_proof')}
                className="px-2.5 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center gap-1 transition-colors"
              >
                <FileCode className="w-3 h-3 text-emerald-600" />
                Use Different Proof
              </button>
            </div>

            <button
              onClick={handleRegenerateAction}
              className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Regenerate
            </button>
          </div>
        </div>

        {/* Version History Component */}
        <ProposalVersionHistory
          versions={versions}
          activeVersionId={activeVersionId}
          onRestoreVersion={handleRestoreVersion}
        />
      </div>

      {/* Right Sidebar Controls */}
      <div className="space-y-4">
        {/* Target Job Summary */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-2.5 shadow-2xs">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Job</h4>
          <h5 className="text-sm font-bold text-slate-900">{job.title}</h5>
          <div className="text-xs text-slate-600 font-medium">
            Budget: <span className="font-bold text-slate-900">{job.budget}</span> • Connects: <span className="font-bold text-blue-700">{job.connectsRequired}</span>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] text-slate-500 font-medium mb-1">Recommended Portfolio Evidence:</div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800">
              {profile.portfolio[0]?.title || 'Multi-Tenant SaaS Platform'}
            </div>
          </div>
        </div>

        {/* AI Parameters (No hardcoded model name, shows generic "AI Proposal Engine") */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              AI Proposal Engine
            </h4>
            <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
              AI Assisted
            </span>
          </div>

          {/* Tone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Proposal Tone</label>
            <div className="grid grid-cols-3 gap-1.5">
              {['Direct', 'Technical', 'Business-focused'].map((t) => (
                <button
                  key={t}
                  onClick={() => handleToneChange(t)}
                  className={`py-1.5 px-2 rounded text-xs font-semibold border transition-all ${
                    tone === t
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Length */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Target Length</label>
            <div className="grid grid-cols-2 gap-2">
              {['Short', 'Balanced'].map((l) => (
                <button
                  key={l}
                  onClick={() => handleLengthChange(l)}
                  className={`py-1.5 px-2 rounded text-xs font-semibold border transition-all ${
                    length === l
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Custom Prompt Focus (Optional)</label>
            <textarea
              rows={3}
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g. Emphasize REST API experience..."
              className="w-full p-2.5 rounded border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Primary Continue Button */}
        <button
          onClick={() => onContinueToReview(proposalText, tone, length)}
          className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>Continue to Review & Submit</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
