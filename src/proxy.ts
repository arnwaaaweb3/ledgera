// src/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function proxy(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;

    // Protected routes - hanya /dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', '/dashboard');
            return NextResponse.redirect(loginUrl);
        }

        try {
            jwt.verify(token, process.env.JWT_SECRET!);
            return NextResponse.next();
        } catch {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Public routes: /, /login, dll - biarkan pass through
    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
};
