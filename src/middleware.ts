import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const authCookie = request.cookies.get('auth_token');
    const isLoginPage = request.nextUrl.pathname === '/login';
    const isAdminPage = request.nextUrl.pathname.startsWith('/admin');

    if (isAdminPage && !authCookie) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isLoginPage && authCookie) {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/login'],
};
