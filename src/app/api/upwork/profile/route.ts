import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      title: 'Full Stack & AI Engineer',
      overview: 'Specializing in Next.js, Laravel, Upwork automation, and AI workflows.',
      hourlyRate: '$65.00/hr',
      skills: ['Next.js', 'React', 'Laravel', 'TypeScript', 'TailwindCSS', 'AI Integration'],
      portfolioHighlights: [
        {
          id: 'proj-1',
          title: 'Upwork Pro Opportunity Intelligence',
          description: 'High-conversion proposal generation engine with real-time profile signal alignment.',
          outcome: 'Increased interview invitation rate by 34%',
        },
      ],
      profileSignals: {
        jobSuccessScore: 99,
        topRated: true,
        connectsBalance: 64,
      },
    },
  });
}
