import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Job, UserProfile } from '../../types';
import { ProposalEditor } from '../ProposalEditor';

interface ProposalStudioViewProps {
  job: Job;
  profile: UserProfile;
  proposalText: string;
  onBack: () => void;
  onUpdateProposal: (text: string, tone: string, length: string) => void;
  onContinueToReview: (text: string, tone: string, length: string) => void;
  onRefineProposal: (action: 'improve_opening' | 'make_shorter' | 'different_proof') => string;
  onRegenerate: (tone: string, length: string, customInstructions?: string) => string;
}

export const ProposalStudioView: React.FC<ProposalStudioViewProps> = ({
  job,
  profile,
  proposalText,
  onBack,
  onUpdateProposal,
  onContinueToReview,
  onRefineProposal,
  onRegenerate
}) => {
  return (
    <div className="space-y-6">
      {/* Navigation Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Job Analysis
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Proposal Studio Stage</span>
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
        </div>
      </div>

      {/* Editor Main Section */}
      <ProposalEditor
        job={job}
        profile={profile}
        initialText={proposalText}
        onUpdateProposal={onUpdateProposal}
        onContinueToReview={onContinueToReview}
        onRefineProposal={onRefineProposal}
        onRegenerate={onRegenerate}
      />
    </div>
  );
};
