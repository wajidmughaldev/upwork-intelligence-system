'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import { AppSidebar, NavItem } from '../components/AppSidebar';
import { AppHeader } from '../components/AppHeader';
import { AuthGate } from '../components/AuthGate';
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
import { AuthUser, authApiService } from '../services/AuthApiService';
import {
  upworkApiService,
  UpworkConnectionStatus,
  UpworkConnectsData,
  UpworkProfileData,
} from '../services/UpworkApiService';
import { Job, Application, UserProfile, ApplicationStatus, SubmissionResultState, SubmissionResultData } from '../types';
import { Loader2 } from 'lucide-react';

export default function Home() {
  // Auth state
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  // App & Navigation State
  const [currentTab, setCurrentTab] = useState<NavItem>('dashboard');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [proposalText, setProposalText] = useState<string>('');
  const [proposalTone, setProposalTone] = useState<string>('Direct');
  const [proposalLength, setProposalLength] = useState<string>('Balanced');
  const [applications, setApplications] = useState<Application[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(upworkService.getUserProfile());

  // Real Upwork API State
  const [connectionStatus, setConnectionStatus] = useState<UpworkConnectionStatus | null>(null);
  const [connectsData, setConnectsData] = useState<UpworkConnectsData | null>(null);
  const [realProfileData, setRealProfileData] = useState<UpworkProfileData | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Derived values for this slice
  const isConnected = connectionStatus?.connected ?? false;
  const availableConnects = connectsData?.available ?? realProfileData?.connectsBalance ?? null;
  const accountName = connectionStatus?.accountName ?? null;

  // Real Upwork Data Fetcher
  const fetchRealUpworkData = useCallback(async () => {
    try {
      const [statusRes, connectsRes, profileRes] = await Promise.all([
        upworkApiService.getStatus(),
        upworkApiService.getConnects(),
        upworkApiService.getProfile(),
      ]);

      setConnectionStatus(statusRes);

      if (connectsRes.success && connectsRes.data) {
        setConnectsData(connectsRes.data);
      } else {
        setConnectsData(null);
      }

      if (profileRes.success && profileRes.data) {
        setRealProfileData(profileRes.data);
      } else {
        setRealProfileData(null);
      }
    } catch {
      // Keep state safe
    }
  }, []);

  // 1. Initial Session Auth Check
  useEffect(() => {
    const checkAuthSession = async () => {
      const user = await authApiService.getCurrentUser();
      if (user) {
        setAuthUser(user);
        setAuthStatus('authenticated');
      } else {
        setAuthStatus('unauthenticated');
      }
    };

    checkAuthSession();
  }, []);

  // 2. Hydrate mock jobs & local preferences + fetch real Upwork data when authenticated
  useEffect(() => {
    if (authStatus !== 'authenticated') return;

    const loadedJobs = upworkService.getJobs();
    setJobs(loadedJobs);
    setApplications(upworkService.getApplications());
    setUserProfile(upworkService.getUserProfile());

    if (loadedJobs.length > 0 && !selectedJob) {
      setSelectedJob(loadedJobs[0]);
    }

    fetchRealUpworkData();

    // Check OAuth return params in URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('upwork_connected') === '1') {
        setSyncNotice('Successfully connected to Upwork!');
        setTimeout(() => setSyncNotice(null), 4000);
        window.history.replaceState({}, document.title, window.location.pathname);
        fetchRealUpworkData();
      } else if (params.get('upwork_account_selection') === '1') {
        setSyncNotice('Upwork account selection is required. Please select your candidate account.');
        setTimeout(() => setSyncNotice(null), 6000);
        window.history.replaceState({}, document.title, window.location.pathname);
        fetchRealUpworkData();
      }
    }
  }, [authStatus, fetchRealUpworkData]);

  // Auth Handlers
  const handleLoginSuccess = (user: AuthUser) => {
    setAuthUser(user);
    setAuthStatus('authenticated');
  };

  const handleLogout = async () => {
    await authApiService.logout();
    setAuthUser(null);
    setAuthStatus('unauthenticated');
  };

  // Upwork Connection Handlers
  const handleSyncUpwork = async () => {
    await fetchRealUpworkData();
    setSyncNotice('Upwork account and profile refreshed.');
    setTimeout(() => setSyncNotice(null), 3000);
  };

  const handleConnectOAuth = () => {
    if (typeof window !== 'undefined') {
      window.location.href = upworkApiService.getOAuthConnectUrl();
    }
  };

  const handleDisconnectUpwork = async () => {
    await upworkApiService.disconnect();
    setConnectionStatus({
      connected: false,
      accountName: null,
      role: null,
      status: 'disconnected',
    });
    setConnectsData(null);
    setRealProfileData(null);
    setSyncNotice('Upwork account disconnected.');
    setTimeout(() => setSyncNotice(null), 3000);
  };

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
      length: proposalLength,
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
    const updated = upworkService.getJobs();
    setJobs([...updated]);
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
      customInstructions,
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
        availableConnects: availableConnects ?? 0,
        remainingConnects: availableConnects ?? 0,
        errorReason: 'No job was selected for submission.',
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
            answer: 'Yes, built multiple multi-tenant SaaS portals handling 50k+ active users.',
          },
        ],
        attachments: ['SaaS_Architecture_Case_Study.pdf'],
        tone: proposalTone,
        length: proposalLength,
        originalJobBrief: selectedJob.originalBrief,
      },
      simulatedOutcome
    );

    if (result.state === 'success') {
      setApplications([...upworkService.getApplications()]);
      fetchRealUpworkData();
    }

    return result;
  };

  const handleUpdateApplicationStatus = (appId: string, newStatus: ApplicationStatus) => {
    upworkService.updateApplicationStatus(appId, newStatus);
    setApplications([...upworkService.getApplications()]);
  };

  // Render checking session state
  if (authStatus === 'checking') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-xs text-xs font-medium text-slate-700">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          <span>Verifying engine session...</span>
        </div>
      </div>
    );
  }

  // Render Auth Gate if unauthenticated
  if (authStatus === 'unauthenticated') {
    return <AuthGate onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      {/* 1:1 Stitch Fixed Sidebar */}
      <AppSidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        applicationsCount={applications.length}
        jobsCount={jobs.length}
        accountName={accountName}
        profileTitle={realProfileData?.title}
        hourlyRate={realProfileData?.hourlyRate}
        isConnected={isConnected}
        onSync={handleSyncUpwork}
      />

      {/* Main Wrapper offset by sidebar w-64 */}
      <div className="pl-64 flex-1 flex flex-col min-h-screen min-w-0">
        {/* 1:1 Stitch Sticky Header */}
        <AppHeader
          currentTab={currentTab}
          availableConnects={availableConnects}
          isConnected={isConnected}
          accountName={accountName}
          userEmail={authUser?.email}
          onRefreshConnects={handleSyncUpwork}
          onLogout={handleLogout}
          onQuickMatch={() => {
            const bestJob = [...jobs].sort((a, b) => b.opportunityScore - a.opportunityScore)[0];
            if (bestJob) {
              handleViewAnalysis(bestJob);
            } else {
              setCurrentTab('jobs');
            }
          }}
          onOpenSettings={() => setCurrentTab('settings')}
        />

        {/* Sync / Action Banner Toast */}
        {syncNotice && (
          <div className="bg-slate-900 text-white text-xs px-8 py-2 flex items-center justify-between shadow-xs">
            <span>{syncNotice}</span>
            <button onClick={() => setSyncNotice(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* View Canvas */}
        <main className="flex-1">
          {currentTab === 'dashboard' && (
            <DashboardView
              availableConnects={availableConnects}
              connectionStatus={connectionStatus}
              connectsData={connectsData}
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
              availableConnects={availableConnects ?? 0}
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
              realProfile={realProfileData}
              connectionStatus={connectionStatus}
              onResyncUpwork={handleSyncUpwork}
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
              connectionStatus={connectionStatus}
              connectsData={connectsData}
              realProfile={realProfileData}
              onRefreshConnection={handleSyncUpwork}
              onConnectOAuth={handleConnectOAuth}
              onDisconnectUpwork={handleDisconnectUpwork}
              onToggleDisconnect={handleDisconnectUpwork}
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
