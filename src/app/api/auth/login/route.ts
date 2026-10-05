import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body || {};
    return NextResponse.json({
      success: true,
      user: {
        id: 1,
        name: 'Demo Freelancer',
        email: email || 'demo@example.com',
      },
    });
  } catch {
    return NextResponse.json({
      success: true,
      user: {
        id: 1,
        name: 'Demo Freelancer',
        email: 'demo@example.com',
      },
    });
  }
}
