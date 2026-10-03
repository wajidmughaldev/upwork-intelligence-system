'use client';

import React, { useState, useEffect } from 'react';
import { AppSidebar, NavItem } from '../components/AppSidebar';
import { AppHeader } from '../components/AppHeader';
import { DashboardView } from '../components/views/DashboardView';
import { JobSearchView } from '../components/views/JobSearchView';
import { JobAnalysisView } from '../components/views/JobAnalysisView';
import { ProposalStudioView } from '../components/views/ProposalStudioView';
import { ReviewSubmitView } from '../components/views/ReviewSubmitView';
import { ApplicationsView } from '../components/views/ApplicationsView';
import { ProfileIntelligenceView } from '../components/views/ProfileIntelligenceView';
import { SettingsView } from '../components/views/SettingsView';

import { upworkService } from '../services/MockUpworkService';
import { aiService } from '../services/MockAIService';
import { Job, Application, UserProfile, ApplicationStatus, SubmissionResultState, SubmissionResultData } from '../types';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<NavItem>('dashboard');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [proposalText, setProposalText] = useState<string>('');
  const [proposalTone, setProposalTone] = useState<string>('Direct');
  const [proposalLength, setProposalLength] = useState<string>('Short');
  const [availableConnects, setAvailableConnects] = useState<number>(147);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(upworkService.getUserProfile());

  // Hydrate state from mock service (backed by localStorage)
  useEffect(() => {
    setJobs(upworkService.getJobs());
    setAvailableConnects(upworkService.getAvailableConnects());
    setIsConnected(upworkService.isConnected());
    setApplications(upworkService.getApplications());
    setUserProfile(upworkService.getUserProfile());
  }, []);

  // Navigation handlers
  const handleSelectTab = (tab: NavItem) => {
    setCurrentTab(tab);
  };

  const handleViewAnalysis = (job: Job) => {
    setSelectedJob(job);
    setCurrentTab('analysis');
  };

  const handleGenerateProposal = (job: Job) => {
    setSelectedJob(job);
    const initialText = aiService.generateProposal(job, userProfile, {
      tone: proposalTone,
      length: proposalLength
    });
    setProposalText(initialText);
    setCurrentTab('proposal');
  };

  const handleToggleSave = (jobId: string) => {
    upworkService.toggleSaveJob(jobId);
    setJobs([...upworkService.getJobs()]);
  };

  const handleSkipJob = (jobId: string) => {
    upworkService.skipJob(jobId);
    setJobs([...upworkService.getJobs()]);
    if (selectedJob && selectedJob.id === jobId && currentTab === 'analysis') {
      setCurrentTab('jobs');
    }
  };

  const handleUpdateProposal = (text: string, tone: string, length: string) => {
    setProposalTone(tone);
    setProposalLength(length);
    if (text !== proposalText) {
      setProposalText(text);
    }
  };

  const handleRegenerateProposal = (tone: string, length: string, customInstructions?: string): string => {
    if (!selectedJob) return proposalText;
    const newText = aiService.generateProposal(selectedJob, userProfile, {
      tone,
      length,
      customInstructions
    });
    setProposalText(newText);
    setProposalTone(tone);
    setProposalLength(length);
    return newText;
  };

  const handleRefineProposal = (action: 'improve_opening' | 'make_shorter' | 'different_proof'): string => {
    const refined = aiService.refineProposal(proposalText, action, userProfile);
    setProposalText(refined);
    return refined;
  };

  const handleContinueToReview = (text: string, tone: string, length: string) => {
    setProposalText(text);
    setProposalTone(tone);
    setProposalLength(length);
    setCurrentTab('review');
  };

  const handleConfirmSubmission = (
    bidAmount: string,
    text: string,
    connectsUsed: number,
    simulatedOutcome: SubmissionResultState
  ): SubmissionResultData => {
    if (!selectedJob) {
      return {
        state: 'failed',
        jobTitle: 'Unknown Job',
        bid: bidAmount,
        connectsCost: connectsUsed,
        availableConnects,
        remainingConnects: availableConnects,
        errorReason: 'No job was selected for submission.'
      };
    }

    const result = upworkService.submitProposal(
      {
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        clientName: selectedJob.client.location,
        clientSpent: selectedJob.client.totalSpent,
        clientRating: selectedJob.client.rating,
        opportunityScore: selectedJob.opportunityScore,
        confidence: selectedJob.confidence,
        proposedBid: bidAmount,
        connectsUsed: connectsUsed,
        coverLetter: text,
        screeningAnswers: [
          {
            question: 'Do you have experience with multi-tenant architecture?',
            answer: 'Yes, built multiple multi-tenant SaaS portals handling 50k+ active users.'
          }
        ],
        attachments: ['SaaS_Architecture_Case_Study.pdf'],
        tone: proposalTone,
        length: proposalLength,
        originalJobBrief: selectedJob.originalBrief
      },
      simulatedOutcome
    );

    if (result.state === 'success') {
      setApplications([...upworkService.getApplications()]);
      setAvailableConnects(upworkService.getAvailableConnects());
    }

    return result;
  };

  const handleUpdateApplicationStatus = (appId: string, newStatus: ApplicationStatus) => {
    upworkService.updateApplicationStatus(appId, newStatus);
    setApplications([...upworkService.getApplications()]);
  };

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-900 antialiased">
      {/* App Sidebar */}
      <AppSidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        applicationsCount={applications.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          availableConnects={availableConnects}
          isConnected={isConnected}
          onRefreshConnects={() => setAvailableConnects(upworkService.getAvailableConnects())}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              availableConnects={availableConnects}
              jobs={jobs}
              applicationsCount={applications.length}
              onViewAnalysis={handleViewAnalysis}
              onGenerateProposal={handleGenerateProposal}
              onToggleSave={handleToggleSave}
              onSkipJob={handleSkipJob}
              onGoToSearch={() => setCurrentTab('jobs')}
            />
          )}

          {currentTab === 'jobs' && (
            <JobSearchView
              jobs={jobs}
              onViewAnalysis={handleViewAnalysis}
              onGenerateProposal={handleGenerateProposal}
              onToggleSave={handleToggleSave}
              onSkipJob={handleSkipJob}
            />
          )}

          {currentTab === 'analysis' && selectedJob && (
            <JobAnalysisView
              job={selectedJob}
              profile={userProfile}
              onBack={() => setCurrentTab('jobs')}
              onGenerateProposal={handleGenerateProposal}
              onToggleSave={handleToggleSave}
              onSkipJob={handleSkipJob}
            />
          )}

          {currentTab === 'proposal' && selectedJob && (
            <ProposalStudioView
              job={selectedJob}
              profile={userProfile}
              proposalText={proposalText}
              onBack={() => setCurrentTab('analysis')}
              onUpdateProposal={handleUpdateProposal}
              onContinueToReview={handleContinueToReview}
              onRefineProposal={handleRefineProposal}
              onRegenerate={handleRegenerateProposal}
            />
          )}

          {currentTab === 'review' && selectedJob && (
            <ReviewSubmitView
              job={selectedJob}
              proposalText={proposalText}
              availableConnects={availableConnects}
              onBackToEdit={() => setCurrentTab('proposal')}
              onConfirmSubmission={handleConfirmSubmission}
              onViewApplication={() => setCurrentTab('applications')}
            />
          )}

          {currentTab === 'applications' && (
            <ApplicationsView
              applications={applications}
              onUpdateStatus={handleUpdateApplicationStatus}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileIntelligenceView
              profile={userProfile}
              onUpdateProfile={(updated) => {
                const newProfile = upworkService.updateUserProfile(updated);
                setUserProfile(newProfile);
              }}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              profile={userProfile}
              isConnected={isConnected}
              onRefreshConnection={() => {
                upworkService.refreshConnection();
                setIsConnected(true);
              }}
              onToggleDisconnect={() => {
                if (isConnected) {
                  upworkService.disconnect();
                  setIsConnected(false);
                } else {
                  upworkService.refreshConnection();
                  setIsConnected(true);
                }
              }}
              onUpdateProfile={(updated) => {
                const newProfile = upworkService.updateUserProfile(updated);
                setUserProfile(newProfile);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
