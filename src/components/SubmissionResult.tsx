import React from 'react';
import { CheckCircle2, AlertOctagon, HelpCircle, ArrowRight, RotateCcw, FileText, Zap } from 'lucide-react';
import { SubmissionResultData } from '../types';

interface SubmissionResultProps {
  data: SubmissionResultData;
  onViewApplication: () => void;
  onReturnToReview: () => void;
  onRetryPreparation: () => void;
  onCheckApplications: () => void;
}

export const SubmissionResult: React.FC<SubmissionResultProps> = ({
  data,
  onViewApplication,
  onReturnToReview,
  onRetryPreparation,
  onCheckApplications
}) => {
  if (data.state === 'success') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-xl mx-auto space-y-6 text-center shadow-lg animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Proposal Submitted Successfully</h2>
          <p className="text-xs text-slate-500">
            Your tailored proposal has been recorded in your local applications ledger.
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-5 border border-slate-200 text-left space-y-3 text-xs">
          <div className="flex justify-between items-start border-b border-slate-200/60 pb-2.5">
            <span className="text-slate-500 font-medium">Job Title:</span>
            <span className="font-bold text-slate-900 text-right max-w-xs">{data.jobTitle}</span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-200/60 pb-2.5">
            <span className="text-slate-500 font-medium">Proposed Bid:</span>
            <span className="font-bold text-emerald-700">{data.bid}</span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-200/60 pb-2.5">
            <span className="text-slate-500 font-medium">Connects Used:</span>
            <span className="font-bold text-blue-700 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-blue-600" />
              {data.connectsCost} Connects
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Remaining Connects Balance:</span>
            <span className="font-bold text-slate-800">{data.remainingConnects} Connects</span>
          </div>
        </div>

        <button
          onClick={onViewApplication}
          className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          <span>View in Submitted Applications</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (data.state === 'failed') {
    return (
      <div className="bg-white rounded-xl border border-rose-200 p-8 max-w-xl mx-auto space-y-6 text-center shadow-lg animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertOctagon className="w-9 h-9" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Proposal Was Not Submitted</h2>
          <p className="text-xs text-rose-700 font-medium">
            {data.errorReason || 'Submission could not be completed. No Connects were deducted.'}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
          <div className="text-slate-600">
            <strong>Target:</strong> {data.jobTitle}
          </div>
          <div className="text-slate-600">
            <strong>Connects Protected:</strong> {data.connectsCost} Connects remain intact in your account.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onReturnToReview}
            className="flex-1 py-2.5 px-4 rounded-md border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Return to Review
          </button>
          <button
            onClick={onRetryPreparation}
            className="flex-1 py-2.5 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry Preparation
          </button>
        </div>
      </div>
    );
  }

  // State: unknown / ambiguous
  return (
    <div className="bg-white rounded-xl border border-amber-200 p-8 max-w-xl mx-auto space-y-6 text-center shadow-lg animate-in zoom-in-95 duration-200">
      <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
        <HelpCircle className="w-9 h-9" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Submission Status Could Not Be Confirmed</h2>
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 space-y-1">
          <h4 className="font-bold">Caution: Ambiguous Gateway Response</h4>
          <p className="leading-relaxed">
            Do not submit again until the proposal status and Connects balance have been verified. Duplicate submissions may waste Connects.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-left text-xs space-y-2 text-slate-700">
        <div><strong>Target Job:</strong> {data.jobTitle}</div>
        <div><strong>Proposal Bid:</strong> {data.bid}</div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onReturnToReview}
          className="flex-1 py-2.5 px-4 rounded-md border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Return to Review
        </button>
        <button
          onClick={onCheckApplications}
          className="flex-1 py-2.5 px-4 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
        >
          <FileText className="w-3.5 h-3.5" />
          Check Applications
        </button>
      </div>
    </div>
  );
};
