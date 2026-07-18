// src/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// Ganti nama fungsi dari 'middleware' menjadi 'proxy'
export function proxy(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    
    // Protected routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!token) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        
        try {
            // Verifikasi token JWT
            jwt.verify(token, process.env.JWT_SECRET!);
            return NextResponse.next();
        } catch {
            // Jika token invalid atau expired, redirect ke halaman login
            return NextResponse.redirect(new URL('/', request.url));
        }
    }
    
    return NextResponse.next();
}

// Config matcher tetap sama
export const config = {
    matcher: ['/dashboard/:path*'],
};