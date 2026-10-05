import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    authenticated: true,
    user: {
      id: 1,
      name: 'Wajid Mughal',
      email: 'wajidmughalwm2001@gmail.com',
    },
  });
}
