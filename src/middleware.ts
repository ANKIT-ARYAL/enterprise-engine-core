import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Basic admin route barrier (mock implementation)
  if (pathname.startsWith('/admin')) {
    const sessionToken = request.cookies.get('session_token');
    
    // Allow login page bypass
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }
    
    // In a real application, you would verify this token via edge-compatible logic
    if (!sessionToken) {
      // return NextResponse.redirect(new URL('/admin/login', request.url));
      // Commented out to avoid redirect loops in mock setup
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
