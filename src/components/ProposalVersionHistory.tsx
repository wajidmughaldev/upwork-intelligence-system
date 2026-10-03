import React, { useState } from 'react';
import { History, Eye, RotateCcw, Clock, Check, X } from 'lucide-react';
import { ProposalVersion } from '../types';

interface ProposalVersionHistoryProps {
  versions: ProposalVersion[];
  activeVersionId: string;
  onRestoreVersion: (version: ProposalVersion) => void;
}

export const ProposalVersionHistory: React.FC<ProposalVersionHistoryProps> = ({
  versions,
  activeVersionId,
  onRestoreVersion
}) => {
  const [inspectingVersion, setInspectingVersion] = useState<ProposalVersion | null>(null);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-blue-600" />
          Version History ({versions.length})
        </h4>
        <span className="text-[11px] text-slate-500 font-medium">Local Snapshots</span>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {versions.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">No previous versions yet.</p>
        ) : (
          versions.map((ver) => {
            const isCurrent = ver.id === activeVersionId;
            return (
              <div
                key={ver.id}
                className={`p-2.5 rounded-md border transition-all text-xs flex items-center justify-between gap-2 ${
                  isCurrent
                    ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                }`}
              >
                <div className="truncate">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>{ver.label}</span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.2 rounded">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>{ver.timestamp}</span>
                    <span>•</span>
                    <span className="truncate italic">{ver.sourceAction}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setInspectingVersion(ver)}
                    className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-white transition-colors"
                    title="View snapshot"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  {!isCurrent && (
                    <button
                      onClick={() => onRestoreVersion(ver)}
                      className="px-2 py-1 rounded bg-white hover:bg-blue-600 hover:text-white border border-slate-200 font-semibold text-[11px] text-slate-700 transition-colors flex items-center gap-1 shadow-2xs"
                      title="Restore this version"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restore
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Inspect Modal */}
      {inspectingVersion && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-5 w-full max-w-lg space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Preview Version: {inspectingVersion.label}</span>
                  <span className="text-xs font-normal text-slate-500">({inspectingVersion.sourceAction})</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Recorded at {inspectingVersion.timestamp}</p>
              </div>
              <button
                onClick={() => setInspectingVersion(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded border border-slate-200 bg-slate-50 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">
              {inspectingVersion.text}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Tone: <strong>{inspectingVersion.tone}</strong> • Length: <strong>{inspectingVersion.length}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInspectingVersion(null)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onRestoreVersion(inspectingVersion);
                    setInspectingVersion(null);
                  }}
                  className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs"
                >
                  <RotateCcw className="w-3 h-3" />
                  Restore This Version
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
