import React, { useState } from 'react';
import { ArrowLeft, AlertCircle, Zap, Paperclip, Send, ShieldCheck, DollarSign } from 'lucide-react';
import { Job, SubmissionResultState, SubmissionResultData } from '../../types';
import { ConfirmationDialog } from '../ConfirmationDialog';
import { SubmissionResult } from '../SubmissionResult';

interface ReviewSubmitViewProps {
  job: Job;
  proposalText: string;
  availableConnects: number;
  onBackToEdit: () => void;
  onConfirmSubmission: (bidAmount: string, proposalText: string, connectsUsed: number, simulatedOutcome: SubmissionResultState) => SubmissionResultData;
  onViewApplication: () => void;
}

export const ReviewSubmitView: React.FC<ReviewSubmitViewProps> = ({
  job,
  proposalText,
  availableConnects,
  onBackToEdit,
  onConfirmSubmission,
  onViewApplication
}) => {
  const [proposedBid, setProposedBid] = useState<string>(job.budget);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResultData | null>(null);

  const connectsCost = job.connectsRequired;
  const remainingConnects = availableConnects - connectsCost;

  const handleExecuteSubmission = (simulatedOutcome: SubmissionResultState) => {
    setShowConfirmation(false);
    const result = onConfirmSubmission(proposedBid, proposalText, connectsCost, simulatedOutcome);
    setSubmissionResult(result);
  };

  // If a submission was executed, show the distinct result state screen
  if (submissionResult) {
    return (
      <SubmissionResult
        data={submissionResult}
        onViewApplication={onViewApplication}
        onReturnToReview={() => setSubmissionResult(null)}
        onRetryPreparation={() => {
          setSubmissionResult(null);
          setShowConfirmation(true);
        }}
        onCheckApplications={onViewApplication}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToEdit}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Proposal Studio
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Final Verification Step
          </span>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h4 className="font-bold">Submission Requires Your Explicit Confirmation</h4>
          <p className="leading-relaxed">
            This system assists with proposal drafting and opportunity analysis. It will never submit proposals to Upwork without your explicit review and confirmation.
          </p>
        </div>
      </div>

      {/* Target Job Summary */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-3 shadow-2xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Proposal Review Target</h3>
        <h2 className="text-lg font-bold text-slate-900">{job.title}</h2>
        <div className="flex flex-wrap gap-4 text-xs text-slate-600">
          <span>Client Spend: <strong className="text-slate-800">{job.client.totalSpent}</strong></span>
          <span>•</span>
          <span>Rating: <strong className="text-slate-800">{job.client.rating.toFixed(1)} ★</strong></span>
          <span>•</span>
          <span>Connects Required: <strong className="text-blue-700 font-bold">{connectsCost} Connects</strong></span>
        </div>
      </div>

      {/* Terms & Financials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bid Terms */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Proposed Terms & Pricing
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">Your Proposed Bid Amount</label>
            <input
              type="text"
              value={proposedBid}
              onChange={(e) => setProposedBid(e.target.value)}
              className="w-full p-2.5 rounded border border-slate-300 font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="p-3 rounded bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Proposed Bid:</span>
              <span className="font-bold text-slate-900">{proposedBid}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Estimated Upwork Fee (10%):</span>
              <span>-10%</span>
            </div>
            <div className="pt-1 border-t border-slate-200 flex justify-between font-bold text-emerald-700">
              <span>Estimated Net Earnings:</span>
              <span>Calculated upon engagement</span>
            </div>
          </div>
        </div>

        {/* Connects Calculation */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-blue-600 fill-blue-600" />
            Connects Balance Math
          </h3>

          <div className="p-3 rounded bg-blue-50/70 border border-blue-100 text-xs space-y-2">
            <div className="flex justify-between text-slate-700">
              <span>Connects Required for Proposal:</span>
              <span className="font-bold text-blue-800">{connectsCost} Connects</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Current Available Balance:</span>
              <span className="font-semibold text-slate-900">{availableConnects} Connects</span>
            </div>
            <div className="pt-2 border-t border-blue-200/80 flex justify-between font-extrabold text-blue-900">
              <span>Balance After Submission:</span>
              <span className={remainingConnects >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                {remainingConnects} Connects
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cover Letter Full Preview */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-3 shadow-2xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Cover Letter Text</h3>
        <div className="p-4 rounded border border-slate-200 bg-slate-50 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
          {proposalText}
        </div>
      </div>

      {/* Screening Questions Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-3 shadow-2xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Screening Questions</h3>
        <div className="p-3 rounded border border-slate-200 bg-slate-50 text-xs text-slate-700 space-y-1">
          <div className="font-semibold">Do you have experience with multi-tenant architecture?</div>
          <div className="text-slate-600 italic">"Yes, built multiple multi-tenant SaaS portals handling 50k+ active users."</div>
        </div>
      </div>

      {/* Attachments Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-3 shadow-2xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Paperclip className="w-4 h-4 text-slate-500" />
          Attached Proof & Case Studies
        </h3>
        <div className="p-3 rounded border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 flex items-center justify-between">
          <span>SaaS_Architecture_Case_Study.pdf</span>
          <span className="text-[11px] text-blue-600 font-semibold">Attached</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={onBackToEdit}
          className="px-4 py-2.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
        >
          Back to Proposal Studio
        </button>

        <button
          onClick={() => setShowConfirmation(true)}
          className="px-6 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Prepare Submission
        </button>
      </div>

      {/* Explicit Modal Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmation}
        job={job}
        bidAmount={proposedBid}
        connectsCost={connectsCost}
        availableConnects={availableConnects}
        onCancel={() => setShowConfirmation(false)}
        onConfirm={handleExecuteSubmission}
      />
    </div>
  );
};
