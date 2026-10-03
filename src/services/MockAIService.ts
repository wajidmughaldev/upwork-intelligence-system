import { Job, UserProfile, AnalysisConfidence, DetailedBreakdown } from '../types';

export interface ProposalGenerationOptions {
  tone: string; // 'Direct' | 'Technical' | 'Business-focused'
  length: string; // 'Short' | 'Balanced'
  customInstructions?: string;
}

export interface JobAnalysisResult {
  opportunityScore: number;
  matchLevel: 'Strong Match' | 'Good Match' | 'Moderate' | 'Low';
  confidence: AnalysisConfidence;
  confidenceExplanation: string;
  scoreBreakdown: DetailedBreakdown;
  whyMatches: string[];
  whySkip: string[];
  suggestedApproach: string;
}

export class MockAIService {
  public calculateConfidence(job: Job, profile: UserProfile): { confidence: AnalysisConfidence; explanation: string } {
    const hasClientHistory = job.client && job.client.rating >= 4.7 && job.client.jobsPosted > 10;
    const hasOriginalBrief = job.originalBrief && job.originalBrief.deliverables.length > 0;
    const hasMatchingPortfolio = profile.portfolio.some(p =>
      p.technologies.some(t => job.skillTags.some(s => s.toLowerCase().includes(t.toLowerCase())))
    );

    if (hasClientHistory && hasOriginalBrief && hasMatchingPortfolio) {
      return {
        confidence: 'High',
        explanation: 'High confidence because sufficient job details, verified client history, matching skills, and relevant portfolio evidence are available.'
      };
    } else if (hasClientHistory || hasOriginalBrief) {
      return {
        confidence: 'Medium',
        explanation: 'Medium confidence due to moderate client spend history or partial portfolio stack overlap.'
      };
    } else {
      return {
        confidence: 'Low',
        explanation: 'Low confidence due to minimal client history or brief scope specification.'
      };
    }
  }

  public analyzeJob(job: Job, profile: UserProfile): JobAnalysisResult {
    const { confidence, explanation } = this.calculateConfidence(job, profile);
    return {
      opportunityScore: job.opportunityScore,
      matchLevel: job.matchLevel,
      confidence,
      confidenceExplanation: explanation,
      scoreBreakdown: job.scoreBreakdown,
      whyMatches: job.whyMatches,
      whySkip: job.whySkip,
      suggestedApproach: job.suggestedApproach
    };
  }

  public selectRelevantProof(job: Job, profile: UserProfile) {
    const matched = profile.portfolio.find(p =>
      p.technologies.some(t => job.skillTags.some(st => st.toLowerCase().includes(t.toLowerCase())))
    );
    return matched || profile.portfolio[0] || {
      id: 'default-proof',
      title: 'Enterprise Web Application',
      technologies: ['Laravel', 'React'],
      description: 'Delivered high-throughput SaaS portal with zero downtime.',
      outcome: 'Improved performance by 60%.'
    };
  }

  public generateProposal(job: Job, profile: UserProfile, options: ProposalGenerationOptions): string {
    const primaryProof = this.selectRelevantProof(job, profile);

    let opening = '';
    let problemAnalysis = '';
    let solutionArch = '';
    let proofText = '';
    let cta = '';

    if (options.tone === 'Technical') {
      opening = `Hi, I reviewed your requirements for "${job.title}". As a senior engineer specializing in ${job.skillTags.slice(0, 3).join(', ')}, I can build this cleanly with strict architecture standards and reliable throughput.`;
      problemAnalysis = `Technical Challenge: Managing seamless data synchronization and high-concurrency requests without compromising database throughput.`;
      solutionArch = `Technical Solution: Implementing modular ${job.skillTags[0] || 'Laravel'} REST API controllers backed by ${job.skillTags[1] || 'React'} Query caching and clean TypeScript type validation.`;
      proofText = `Relevant Proof: On a recent project ("${primaryProof.title}"), I engineered a production portal where we ${primaryProof.outcome.toLowerCase()}`;
      cta = `Question: Do you currently have database schemas finalized, or would you like me to include schema design in the initial architecture milestone?`;
    } else if (options.tone === 'Business-focused') {
      opening = `Hello, I saw your job for "${job.title}". I specialize in building high-ROI web products that scale smoothly while keeping operating costs low.`;
      problemAnalysis = `Business Context: You need a reliable, production-ready solution that launches quickly and provides a seamless user experience for your customers.`;
      solutionArch = `Execution Strategy: Rapidly deploy battle-tested ${job.skillTags.slice(0, 2).join(' & ')} architecture to meet your deliverables ahead of schedule.`;
      proofText = `Track Record: Previously built "${primaryProof.title}", delivering ${primaryProof.outcome.toLowerCase()}`;
      cta = `Next Step: Are you available for a brief 10-minute chat this week to align on milestone scope and start date?`;
    } else {
      // Default: Direct
      opening = `Hi, I reviewed your post for "${job.title}". I have built several production ${job.skillTags.slice(0, 2).join(' + ')} applications and can start immediately.`;
      problemAnalysis = `Understanding the Requirement: You need clean, scalable code built without tech debt or overhead.`;
      solutionArch = `Proposed Approach: ${job.suggestedApproach}`;
      proofText = `Relevant Experience: Built "${primaryProof.title}" (${primaryProof.technologies.join(', ')}), where I ${primaryProof.outcome.toLowerCase()}`;
      cta = `Let's connect: Are you free to discuss your specific technical requirements?`;
    }

    if (options.customInstructions) {
      solutionArch += `\nNote on specific focus: ${options.customInstructions}`;
    }

    if (options.length === 'Short') {
      return `${opening}\n\n${solutionArch}\n\n${proofText}\n\n${cta}`;
    }

    return `${opening}\n\n${problemAnalysis}\n\n${solutionArch}\n\n${proofText}\n\n${cta}`;
  }

  public improveProposal(currentProposal: string, profile: UserProfile): string {
    const paragraphs = currentProposal.split('\n\n');
    paragraphs[0] = `Hi! I saw your project call and immediately recognized the core bottleneck in scaling this stack. Having completed 40+ production projects in ${profile.skills.slice(0, 3).join(', ')}, I can deliver this cleanly and efficiently.`;
    return paragraphs.join('\n\n');
  }

  public shortenProposal(currentProposal: string): string {
    const paragraphs = currentProposal.split('\n\n');
    return paragraphs.filter((_, i) => i !== 1).join('\n\n');
  }

  public refineProposal(
    currentProposal: string,
    action: 'improve_opening' | 'make_shorter' | 'different_proof',
    profile: UserProfile
  ): string {
    if (action === 'improve_opening') {
      return this.improveProposal(currentProposal, profile);
    } else if (action === 'make_shorter') {
      return this.shortenProposal(currentProposal);
    } else if (action === 'different_proof') {
      const paragraphs = currentProposal.split('\n\n');
      const altProof = profile.portfolio[1] || profile.portfolio[0];
      const proofIdx = paragraphs.findIndex(p =>
        p.toLowerCase().includes('proof') || p.toLowerCase().includes('experience') || p.toLowerCase().includes('track record')
      );
      if (proofIdx !== -1) {
        paragraphs[proofIdx] = `Relevant Proof: In "${altProof.title}" (${altProof.technologies.join(', ')}), I ${altProof.outcome.toLowerCase()}`;
      }
      return paragraphs.join('\n\n');
    }
    return currentProposal;
  }
}

export const aiService = new MockAIService();
