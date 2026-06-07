// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production-min-32'
);

const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];
const DASHBOARD_ROUTES = ['/dashboard', '/deposit', '/withdraw', '/transactions', '/investments', '/notifications', '/profile'];
const ADMIN_ROUTES = ['/admin'];

async function getPayload(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('cv_session')?.value;

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https:;"
  );

  const payload = token ? await getPayload(token) : null;

  // Redirect authenticated users away from auth pages
  if (AUTH_ROUTES.some(route => pathname === route)) {
    if (payload) {
      const role = payload.role as string;
      return NextResponse.redirect(
        new URL(role === 'ADMIN' ? '/admin' : '/dashboard', request.url)
      );
    }
    return response;
  }

  // Protect dashboard routes
  if (DASHBOARD_ROUTES.some(route => pathname.startsWith(route))) {
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  // Protect admin routes
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if ((payload.role as string) !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|uploads|public).*)',
  ],
};
