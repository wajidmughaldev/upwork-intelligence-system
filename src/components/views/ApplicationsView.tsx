import React, { useState } from 'react';
import { Application, ApplicationStatus } from '../../types';
import { OpportunityScore } from '../OpportunityScore';
import { ConfidenceBadge } from '../ConfidenceBadge';
import { Eye, X, Zap, ArrowRight, AlertTriangle, CheckCircle2, Archive, Trash2 } from 'lucide-react';

interface ApplicationsViewProps {
  applications: Application[];
  onUpdateStatus?: (appId: string, newStatus: ApplicationStatus) => void;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  applications,
  onUpdateStatus
}) => {
  const [activeTab, setActiveTab] = useState<ApplicationStatus>('Submitted');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [confirmWithdrawAppId, setConfirmWithdrawAppId] = useState<string | null>(null);

  const filteredApps = applications.filter(a => a.status === activeTab);

  const statusCounts: Record<ApplicationStatus, number> = {
    Draft: applications.filter(a => a.status === 'Draft').length,
    Submitted: applications.filter(a => a.status === 'Submitted').length,
    Interview: applications.filter(a => a.status === 'Interview').length,
    Hired: applications.filter(a => a.status === 'Hired').length,
    Archived: applications.filter(a => a.status === 'Archived').length,
  };

  const handleStatusChange = (appId: string, nextStatus: ApplicationStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(appId, nextStatus);
    }
    if (selectedApp && selectedApp.id === appId) {
      setSelectedApp({ ...selectedApp, status: nextStatus });
    }
  };

  const handleConfirmWithdraw = () => {
    if (confirmWithdrawAppId && onUpdateStatus) {
      onUpdateStatus(confirmWithdrawAppId, 'Archived');
      setConfirmWithdrawAppId(null);
      if (selectedApp?.id === confirmWithdrawAppId) {
        setSelectedApp(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Applications Ledger</h2>
          <p className="text-xs text-slate-500">Track, review, and inspect submitted proposals and client interactions</p>
        </div>

        {/* Tabs Row */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          {(['Submitted', 'Interview', 'Draft', 'Hired', 'Archived'] as ApplicationStatus[]).map((st) => (
            <button
              key={st}
              onClick={() => setActiveTab(st)}
              className={`px-3.5 py-1.5 rounded-md font-bold text-xs transition-colors flex items-center gap-1.5 ${
                activeTab === st
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{st}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === st ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {statusCounts[st]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
        {filteredApps.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No applications recorded under <strong>{activeTab}</strong> tab.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">Job Title & Client</th>
                  <th className="p-3.5">Proposed Bid</th>
                  <th className="p-3.5">Opportunity Fit</th>
                  <th className="p-3.5">Connects Used</th>
                  <th className="p-3.5">Applied Date</th>
                  <th className="p-3.5">Status / Activity</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">{app.jobTitle}</div>
                      <div className="text-[11px] text-slate-500">Client: {app.clientName} ({app.clientSpent})</div>
                    </td>
                    <td className="p-3.5 font-bold text-emerald-700">{app.proposedBid}</td>
                    <td className="p-3.5">
                      <div className="flex flex-col gap-1">
                        <OpportunityScore score={app.opportunityScore} size="sm" showLabel={false} />
                        <ConfidenceBadge confidence={app.confidence || 'High'} size="sm" />
                      </div>
                    </td>
                    <td className="p-3.5 font-semibold text-blue-700">
                      <span className="inline-flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-blue-600" />
                        {app.connectsUsed}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">{app.appliedDate}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {app.outcome}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 ml-auto transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect Proposal
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Inspection Drawer */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto p-6 space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Application Detail</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedApp.jobTitle}</h3>
                <p className="text-xs text-slate-500">Client: {selectedApp.clientName} ({selectedApp.clientSpent})</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-500">Proposed Bid:</span>
                  <div className="font-bold text-emerald-700 text-sm">{selectedApp.proposedBid}</div>
                </div>
                <div>
                  <span className="text-slate-500">Connects Spent:</span>
                  <div className="font-bold text-blue-700 text-sm">{selectedApp.connectsUsed} Connects</div>
                </div>
                <div>
                  <span className="text-slate-500">Opportunity Score:</span>
                  <div className="font-bold text-slate-900">{selectedApp.opportunityScore} / 100 (Profile Fit)</div>
                </div>
                <div>
                  <span className="text-slate-500">Current Status:</span>
                  <div className="font-bold text-blue-800">{selectedApp.status}</div>
                </div>
              </div>

              {/* Status Transition Prototype Buttons */}
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                  Prototype Status Transition:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedApp.status === 'Submitted' && (
                    <button
                      onClick={() => handleStatusChange(selectedApp.id, 'Interview')}
                      className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
                    >
                      Advance to Interview
                    </button>
                  )}
                  {selectedApp.status === 'Interview' && (
                    <button
                      onClick={() => handleStatusChange(selectedApp.id, 'Hired')}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
                    >
                      Mark as Hired / Offer Accepted
                    </button>
                  )}
                  {selectedApp.status !== 'Archived' && (
                    <button
                      onClick={() => setConfirmWithdrawAppId(selectedApp.id)}
                      className="px-2.5 py-1 rounded border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition-colors"
                    >
                      Withdraw Proposal
                    </button>
                  )}
                </div>
              </div>

              {/* Submitted Proposal Text */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800">Submitted Cover Letter</h4>
                <div className="p-4 rounded border border-slate-200 font-mono bg-slate-50 text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedApp.coverLetter}
                </div>
              </div>

              {/* Screening Answers */}
              {selectedApp.screeningAnswers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800">Screening Questions & Answers</h4>
                  {selectedApp.screeningAnswers.map((sq, i) => (
                    <div key={i} className="p-3 rounded border border-slate-200 bg-slate-50 space-y-1">
                      <div className="font-semibold text-slate-900">Q: {sq.question}</div>
                      <div className="text-slate-700">A: {sq.answer}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-md"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Write Actions (e.g. Withdraw Proposal) */}
      {confirmWithdrawAppId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900">Confirm Proposal Withdrawal</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to withdraw this proposal? It will be archived and will no longer be considered by the client. Connects will not be refunded.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmWithdrawAppId(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWithdraw}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
