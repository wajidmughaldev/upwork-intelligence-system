import React, { useState } from 'react';
import { AlertTriangle, Zap, CheckCircle2, X, Sliders } from 'lucide-react';
import { Job, SubmissionResultState } from '../types';

interface ConfirmationDialogProps {
  isOpen: boolean;
  job: Job;
  bidAmount: string;
  connectsCost: number;
  availableConnects: number;
  onCancel: () => void;
  onConfirm: (simulatedOutcome: SubmissionResultState) => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  job,
  bidAmount,
  connectsCost,
  availableConnects,
  onCancel,
  onConfirm
}) => {
  const [simulatedOutcome, setSimulatedOutcome] = useState<SubmissionResultState>('success');

  if (!isOpen) return null;

  const remainingConnects = availableConnects - connectsCost;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-amber-100 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Confirm Proposal Submission</h3>
              <p className="text-xs text-slate-500 font-medium">Explicit User Confirmation Required</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm font-semibold text-slate-800">
            You are about to submit this proposal using <strong className="text-blue-700">{connectsCost} Connects</strong>.
          </p>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2.5">
            <div className="flex justify-between items-start text-xs border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-medium">Target Job:</span>
              <span className="font-bold text-slate-900 text-right max-w-xs">{job.title}</span>
            </div>

            <div className="flex justify-between items-center text-xs border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-medium">Proposed Bid / Rate:</span>
              <span className="font-bold text-emerald-700">{bidAmount}</span>
            </div>

            <div className="flex justify-between items-center text-xs border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-medium">Connects Cost:</span>
              <span className="font-bold text-blue-700 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-blue-600" />
                {connectsCost} Connects
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Remaining Connects Balance:</span>
              <span className="font-semibold text-slate-700">{remainingConnects} Connects</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2.5 text-xs text-amber-900">
            <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Once confirmed, this proposal will be logged in your <strong>Submitted Applications</strong> ledger and Connects will be deducted.
            </p>
          </div>

          {/* Prototype Simulation Selector */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              Simulate Outcome:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSimulatedOutcome('success')}
                className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors ${
                  simulatedOutcome === 'success'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Success
              </button>
              <button
                type="button"
                onClick={() => setSimulatedOutcome('failed')}
                className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors ${
                  simulatedOutcome === 'failed'
                    ? 'bg-rose-50 border-rose-500 text-rose-700'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Failed
              </button>
              <button
                type="button"
                onClick={() => setSimulatedOutcome('unknown')}
                className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors ${
                  simulatedOutcome === 'unknown'
                    ? 'bg-amber-50 border-amber-500 text-amber-700'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Ambiguous
              </button>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(simulatedOutcome)}
            className="px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Confirm & Submit
          </button>
        </div>
      </div>
    </div>
  );
};
