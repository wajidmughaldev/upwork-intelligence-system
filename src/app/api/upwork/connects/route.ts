import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      available: 64,
      membershipType: 'Freelancer Plus',
    },
  });
}
