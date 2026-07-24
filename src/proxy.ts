// src/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function proxy(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;

    // Protected routes - hanya /dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', '/dashboard');
            return NextResponse.redirect(loginUrl);
        }

        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');
            await jwtVerify(token, secret);
            return NextResponse.next();
        } catch {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Public routes: biarkan pass through
    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
};