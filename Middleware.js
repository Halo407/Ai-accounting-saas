import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// In-memory rate limiting (for dev/testing only - use Redis in production)
const rateLimitMap = new Map();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function rateLimitByIP(req) {
  const clientIP = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 60;

  if (!rateLimitMap.has(clientIP)) {
    rateLimitMap.set(clientIP, []);
  }

  const requests = rateLimitMap.get(clientIP);
  const windowStart = now - windowMs;

  // Filter requests within current window
  const recentRequests = requests.filter(time => time > windowStart);
  
  if (recentRequests.length >= maxRequests) {
    return true; // Rate limit exceeded
  }

  recentRequests.push(now);
  rateLimitMap.set(clientIP, recentRequests);
  return false;
}

async function isAuthenticated(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7);
  
  try {
    const { data, error } = await supabase.auth.getUser(token);
    return !error && data?.user;
  } catch {
    return false;
  }
}

export async function middleware(req) {
  // Rate limiting
  if (rateLimitByIP(req)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // Protected routes
  const isProtected = req.nextUrl.pathname.startsWith('/dashboard') || 
                      req.nextUrl.pathname.startsWith('/app/api');

  if (isProtected) {
    const authenticated = await isAuthenticated(req);
    
    if (!authenticated) {
      if (req.nextUrl.pathname.startsWith('/app/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      } else {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/app/api/:path*'
  ]
};
