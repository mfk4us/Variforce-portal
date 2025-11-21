import { NextResponse } from 'next/server'

export async function GET() {
  // Client should also call supabase.auth.signOut(), but this clears server cookies too if you set any later.
  const res = NextResponse.redirect(new URL('/portal/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
  // If you set auth cookies manually later, clear them here.
  return res
}