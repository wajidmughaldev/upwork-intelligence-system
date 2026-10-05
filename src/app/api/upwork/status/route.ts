import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    connected: true,
    accountName: 'Wajid Mughal (Freelancer)',
    role: 'Full Stack & AI Engineer',
    status: 'connected',
  });
}
