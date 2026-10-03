import React, { useState } from 'react';
import { Job, SubmissionResultState, SubmissionResultData } from '../../types';

interface ReviewSubmitViewProps {
  job: Job;
  proposalText: string;
  availableConnects: number;
  onBackToEdit: () => void;
  onConfirmSubmission: (
    bidAmount: string,
    text: string,
    connectsUsed: number,
    simulatedOutcome: SubmissionResultState
  ) => SubmissionResultData;
  onViewApplication: () => void;
}

export const ReviewSubmitView: React.FC<ReviewSubmitViewProps> = ({
  job,
  proposalText,
  availableConnects,
  onBackToEdit,
  onConfirmSubmission,
  onViewApplication,
}) => {
  const [bidAmount, setBidAmount] = useState<string>(
    job.rawBudget?.toString() || job.budget?.replace(/[^0-9]/g, '') || '1800'
  );
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [simulatedOutcome, setSimulatedOutcome] = useState<SubmissionResultState>('success');
  const [submissionResult, setSubmissionResult] = useState<SubmissionResultData | null>(null);
  const [attachments, setAttachments] = useState<string[]>(['SaaS_Architecture_Case_Study.pdf']);
  const [showDevPanel, setShowDevPanel] = useState<boolean>(false);

  const numericBid = parseFloat(bidAmount) || 1800;
  const upworkFee = numericBid * 0.1;
  const netEarnings = numericBid - upworkFee;
  const connectsRequired = job.connectsRequired || 16;
  const remainingConnects = availableConnects - connectsRequired;

  const handleFinalSubmit = () => {
    setShowConfirmModal(false);
    const result = onConfirmSubmission(bidAmount, proposalText, connectsRequired, simulatedOutcome);
    setSubmissionResult(result);
  };

  const handleRemoveAttachment = (filename: string) => {
    setAttachments(attachments.filter((a) => a !== filename));
  };

  // If already submitted and outcome state is present, render submission outcome modal/card
  if (submissionResult) {
    return (
      <div className="py-12 px-6 max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 space-y-5">
          {submissionResult.state === 'success' && (
            <>
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 mx-auto">
                <span className="material-symbols-outlined text-2xl">check_circle</span>
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold text-slate-900 font-headline">Proposal Successfully Submitted</h2>
                <p className="text-xs text-slate-500">
                  Your proposal for <span className="font-semibold text-slate-800">{job.title}</span> has been dispatched via Upwork MCP.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Submitted Bid:</span>
                  <span className="font-semibold text-slate-900">${numericBid.toLocaleString()} Fixed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Connects Debited:</span>
                  <span className="font-semibold text-blue-600">-{connectsRequired} Connects</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">New Available Balance:</span>
                  <span className="font-semibold text-slate-900">{remainingConnects} Connects</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Upwork Dispatch Timestamp:</span>
                  <span className="font-mono text-slate-600">Just now ({new Date().toLocaleTimeString()})</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={onViewApplication}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  View in Applications Pipeline
                </button>
              </div>
            </>
          )}

          {submissionResult.state === 'failed' && (
            <>
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 mx-auto">
                <span className="material-symbols-outlined text-2xl">error</span>
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold text-slate-900 font-headline">Submission Failed</h2>
                <p className="text-xs text-rose-600 font-medium">
                  {submissionResult.errorReason || 'Upwork MCP returned an error code.'}
                </p>
              </div>

              <p className="text-xs text-slate-500 text-center">
                No connects were debited. Please verify your proposal contents and retry.
              </p>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => setSubmissionResult(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Back to Review
                </button>
                <button
                  onClick={() => {
                    setSubmissionResult(null);
                    setShowConfirmModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Retry Submission
                </button>
              </div>
            </>
          )}

          {submissionResult.state === 'unknown' && (
            <>
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 mx-auto">
                <span className="material-symbols-outlined text-2xl">help</span>
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold text-slate-900 font-headline">Submission Pending / Ambiguous</h2>
                <p className="text-xs text-amber-700 font-medium">
                  MCP dispatch timed out awaiting confirmation packet from Upwork gateway.
                </p>
              </div>

              <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
                The proposal was queued. The system will auto-sync status within 5 minutes to verify if the proposal was registered.
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={onViewApplication}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Check Applications Status
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="max-w-6xl mx-auto px-8 py-6 space-y-6">
        {/* Back Action Link */}
        <div>
          <button
            onClick={onBackToEdit}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back to Proposal Studio</span>
          </button>
        </div>

        {/* Title & Headline */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-headline text-slate-900 tracking-tight">
              Review &amp; Submit Proposal
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Carefully review terms, pricing, proposal narrative, and connect allocation before final submission.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Step 3 of 3</span>
            <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full w-full rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Warning Callout Banner */}
        <div className="rounded-lg bg-amber-50/70 border border-amber-200/80 p-3.5 flex items-start gap-3 text-xs text-amber-900">
          <span className="material-symbols-outlined text-amber-600 mt-0.5">shield</span>
          <div>
            <span className="font-semibold text-amber-950">Submission Safety Guarantee:</span> Submission requires your explicit confirmation. This system will never automatically submit proposals without your direct input.
          </div>
        </div>

        {/* Job Summary Header Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-semibold text-slate-900">{job.title}</h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="material-symbols-outlined text-xs text-emerald-700">check_circle</span>
                  {job.opportunityScore}/100 • Strong Match
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="font-semibold text-slate-700">${numericBid.toLocaleString()} Client Budget</span>
                <span>•</span>
                <span>{connectsRequired} Connects</span>
                <span>•</span>
                <span>Posted {job.postedTime}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-slate-700">
                  <span className="material-symbols-outlined text-amber-500 text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  {job.client.rating.toFixed(1)} Verified Payment
                </span>
                <span>•</span>
                <span className="text-blue-600 font-medium">Enterprise Tier</span>
              </div>
            </div>

            <a
              href={`https://www.upwork.com/jobs/${job.id}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>View Original Posting</span>
              <span className="material-symbols-outlined text-xs">open_in_new</span>
            </a>
          </div>
        </div>

        {/* 2-Column Review Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Financials & Connects (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Financials Panel */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-500">payments</span>
                  <h4 className="text-sm font-semibold text-slate-900">Bid &amp; Payout Breakdown</h4>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                  Fixed Price
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Proposed Bid Amount</span>
                  <div className="flex items-center gap-1">
                    <span>$</span>
                    <input
                      type="text"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-20 px-1.5 py-0.5 border border-slate-200 rounded font-semibold text-slate-900 text-right text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Upwork Service Fee (10%)</span>
                  <span className="text-rose-600 font-medium">-${upworkFee.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                  <div>
                    <span className="font-semibold text-slate-900 text-xs">Net You Receive</span>
                    <p className="text-[10px] text-slate-400">Estimated after standard escrow fee</p>
                  </div>
                  <span className="text-base font-bold text-emerald-600 font-headline">
                    ${netEarnings.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Milestone Preview */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Milestone Schedule (2 Phases)
                </p>
                <div className="space-y-2">
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-medium text-slate-800">Milestone 1: MVP Architecture</span>
                      <p className="text-[10px] text-slate-500">Database schema, auth, multi-tenant setup</p>
                    </div>
                    <span className="font-semibold text-slate-900">${(numericBid / 2).toFixed(2)}</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-medium text-slate-800">Milestone 2: Production Release</span>
                      <p className="text-[10px] text-slate-500">React Query dashboards, tests, deployment</p>
                    </div>
                    <span className="font-semibold text-slate-900">${(numericBid / 2).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Connects Calculation Panel */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-500">toll</span>
                  <h4 className="text-sm font-semibold text-slate-900">Connects Balance &amp; Consumption</h4>
                </div>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  Safe Buffer
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-1 text-center">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Required</span>
                  <span className="text-sm font-bold text-slate-900 font-headline">{connectsRequired}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Current</span>
                  <span className="text-sm font-bold text-slate-600 font-headline">{availableConnects}</span>
                </div>
                <div className="p-2.5 rounded bg-blue-50 border border-blue-100">
                  <span className="text-[10px] text-blue-600 block">Remaining</span>
                  <span className="text-sm font-bold text-blue-700 font-headline">{remainingConnects}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                </div>
                <div className="text-xs">
                  <p className="font-medium text-slate-900">High Conviction Score</p>
                  <p className="text-[11px] text-slate-500">Projected Value ROI: ~$142 per Connect spent</p>
                </div>
              </div>
            </div>

            {/* Attachments Panel */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-3">
              <h4 className="text-sm font-semibold text-slate-900">Attached Artifacts</h4>
              {attachments.length === 0 ? (
                <p className="text-xs text-slate-400">No attachments included.</p>
              ) : (
                attachments.map((file) => (
                  <div
                    key={file}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-rose-100 text-rose-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-800">{file}</p>
                        <p className="text-[10px] text-slate-400">1.8 MB • Uploaded &amp; Scanned</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => alert(`Previewing artifact: ${file}`)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                        title="Preview"
                      >
                        <span className="material-symbols-outlined text-xs">visibility</span>
                      </button>
                      <button
                        onClick={() => handleRemoveAttachment(file)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        title="Remove"
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Proposal Content & Screening (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Full Proposal Preview Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-500">article</span>
                  <h4 className="text-sm font-semibold text-slate-900">Proposal Narrative (AI Optimized)</h4>
                </div>
                <button
                  onClick={onBackToEdit}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  Edit in Studio
                </button>
              </div>

              <div className="whitespace-pre-line text-xs text-slate-800 leading-relaxed font-sans bg-slate-50/70 p-4 rounded-lg border border-slate-100">
                {proposalText}
              </div>
            </div>

            {/* Screening Questions & Answers */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <span className="material-symbols-outlined text-slate-500">quiz</span>
                <h4 className="text-sm font-semibold text-slate-900">Client Screening Questions</h4>
              </div>
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded bg-slate-50 border border-slate-100 space-y-2">
                  <p className="font-medium text-slate-800">
                    <span className="text-blue-600 font-semibold mr-1">Q1:</span>
                    Do you have experience with multi-tenant database indexing in Laravel?
                  </p>
                  <div className="pl-4 border-l-2 border-blue-400 py-0.5 text-slate-600">
                    Yes, implemented tenant-scoped schemas and optimized compound PostgreSQL indexes for 45k MAU on a production logistics SaaS.
                  </div>
                </div>

                <div className="p-3 rounded bg-slate-50 border border-slate-100 space-y-2">
                  <p className="font-medium text-slate-800">
                    <span className="text-blue-600 font-semibold mr-1">Q2:</span>
                    What is your availability for 9:00 AM EST sync calls?
                  </p>
                  <div className="pl-4 border-l-2 border-blue-400 py-0.5 text-slate-600">
                    Fully available Monday through Friday for daily standups in US Eastern timezone.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Screen Sticky Bottom Bar */}
      <div className="fixed bottom-0 right-0 left-64 bg-white border-t border-slate-200 px-8 py-3.5 flex items-center justify-between z-10 shadow-md">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <span className="material-symbols-outlined text-xs">verified_user</span>
            Compliance checks passed
          </span>
          <span>•</span>
          <span>Estimated connect debit: {connectsRequired} Connects</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToEdit}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Back to Edit
          </button>
          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Prepare Submission</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal matching Stitch 1:1 dialog */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[480px] bg-white rounded-xl shadow-2xl border border-slate-200 p-6 z-50 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Top Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <span className="material-symbols-outlined text-xl">verified</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold font-headline text-slate-900">Confirm Proposal Submission</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    You are about to submit this proposal using {connectsRequired} Connects.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Modal Body Details Box */}
            <div className="my-5 rounded-lg bg-slate-50 border border-slate-200/80 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Target Job:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[240px]">{job.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Bid Amount:</span>
                <span className="font-semibold text-slate-900">
                  ${numericBid.toLocaleString()} Fixed{' '}
                  <span className="text-emerald-600 font-normal">(Net ${netEarnings.toFixed(0)})</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Connect Cost:</span>
                <span className="font-semibold text-slate-900">
                  {connectsRequired} Connects{' '}
                  <span className="text-slate-400 font-normal">({remainingConnects} remaining)</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Estimated Upwork Response:</span>
                <span className="font-medium text-slate-700">Typically within 4 hours</span>
              </div>
            </div>

            {/* Explicit confirmation notice */}
            <div className="mb-5 flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-blue-900">
              <span className="material-symbols-outlined text-blue-600 mt-0.5 text-sm">info</span>
              <p className="leading-relaxed">
                This action deducts {connectsRequired} connects from your Upwork balance and sends your proposal directly to the client.
              </p>
            </div>

            {/* Modal Action Footer */}
            <div className="flex items-center justify-between pt-2">
              {/* Unobtrusive dev helper */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDevPanel(!showDevPanel)}
                  className="text-[10px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                >
                  [Dev: {simulatedOutcome}]
                </button>
                {showDevPanel && (
                  <div className="absolute left-0 bottom-6 bg-white border border-slate-200 rounded shadow-md p-2 text-[10px] z-50 space-y-1">
                    <p className="font-bold text-slate-700">Simulate Response:</p>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        checked={simulatedOutcome === 'success'}
                        onChange={() => { setSimulatedOutcome('success'); setShowDevPanel(false); }}
                      />
                      <span>Success (200 OK)</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        checked={simulatedOutcome === 'failed'}
                        onChange={() => { setSimulatedOutcome('failed'); setShowDevPanel(false); }}
                      />
                      <span>Failed (Connects exhausted)</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        checked={simulatedOutcome === 'unknown'}
                        onChange={() => { setSimulatedOutcome('unknown'); setShowDevPanel(false); }}
                      />
                      <span>Unknown / Timeout</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinalSubmit}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                  <span>Confirm &amp; Submit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
