import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const sessionToken = request.cookies.get('engine_admin_session')?.value;
    
    // Allow login page bypass
    if (pathname === '/admin/login') {
      if (sessionToken) return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      return NextResponse.next();
    }
    
    // Require authentication for all other /admin routes
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // RBAC: Restrict Admins from Superadmin features
    if (sessionToken === 'ADMIN') {
      const superAdminRoutes = ['/admin/dashboard/design-system', '/admin/dashboard/global'];
      if (superAdminRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    }
  }

  const response = NextResponse.next();

  // Automated Security Headers (CSP)
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
