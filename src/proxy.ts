import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const sessionToken = request.cookies.get('engine_admin_session')?.value;
    if (pathname === '/admin/login') {
      if (sessionToken) return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      return NextResponse.next();
    }
    if (!sessionToken) return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
