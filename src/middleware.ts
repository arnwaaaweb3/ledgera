// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    
    // Protected routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!token) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        
        try {
            jwt.verify(token, process.env.JWT_SECRET!);
            return NextResponse.next();
        } catch {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
};