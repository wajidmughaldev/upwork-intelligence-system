import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const response = new NextResponse(null, { status: 204 });
  response.cookies.set('XSRF-TOKEN', 'preview-csrf-token', {
    path: '/',
    sameSite: 'lax',
  });
  return response;
}
