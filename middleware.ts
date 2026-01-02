import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_TOKEN_KEY } from '@/lib/utils/constants';

// Routes that don't require authentication
const publicRoutes = ['/login', '/forgot-password'];

// Routes that require authentication
const protectedRoutes = [
  '/overview',
  '/inventory',
  '/receiving',
  '/issuing',
  '/cleaning',
  '/approvals',
  '/reports',
  '/settings',
  '/profile',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_TOKEN_KEY)?.value;

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing login with token
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/overview', request.url));
  }

  // Redirect root to overview if authenticated, login if not
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/overview', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};
