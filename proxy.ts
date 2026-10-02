import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('access_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  const isLoginPage = pathname === '/login';

  // If user is already authenticated with valid admin role and tries to visit login
  if (isLoginPage && accessToken && userRole && ALLOWED_ROLES.includes(userRole)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is accessing protected routes (excluding login, api, static files)
  if (!isLoginPage) {
    if (!accessToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role check: Only SUPER_ADMIN and ADMIN are authorized
    if (userRole && !ALLOWED_ROLES.includes(userRole)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      response.cookies.delete('user_role');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (/api/...)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - image / asset extensions (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
