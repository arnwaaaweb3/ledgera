// src/app/api/auth/google/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import prisma from '@/src/lib/prisma'; 

// ✅ Init Google OAuth Client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);

export async function POST(request: NextRequest) {
  try {
    // 1. Dapatkan access_token dari request
    const { access_token } = await request.json();

    if (!access_token) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    // 2. Verifikasi token ke Google
    const ticket = await googleClient.verifyIdToken({
      idToken: access_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    // 3. Dapatkan user info dari token
    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { 
      email, 
      name, 
      picture, 
      sub: googleId 
    } = payload;

    console.log('✅ Google verification successful:', { email, name });

    // 4. Cari atau buat user di database dengan Prisma
    // ✅ Pake prisma dari lib
    const user = await prisma.user.upsert({
      where: { googleId },
      update: {
        email: email || '',
        name: name || '',
        picture: picture || '',
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        googleId: googleId || '',
        email: email || '',
        name: name || '',
        picture: picture || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      },
    });

    console.log('👤 User saved:', { userId: user.id, email: user.email });

    // 5. Buat JWT token untuk session
    const sessionToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        name: user.name,
        picture: user.picture,
      },
      process.env.JWT_SECRET!, // 🔑 Pastikan JWT_SECRET ada di .env.local
      { expiresIn: '7d' }
    );

    // 6. Kirim response dengan token
    return NextResponse.json({
      success: true,
      token: sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
      message: 'Login successful',
    });

  } catch (error) {
    console.error('❌ Google auth error:', error);
    
    // ✅ Error handling lebih detail
    let errorMessage = 'Authentication failed';
    let statusCode = 500;

    if (error instanceof jwt.JsonWebTokenError) {
      errorMessage = 'Invalid JWT configuration';
      statusCode = 500;
    } else if (error instanceof Error) {
      if (error.message.includes('invalid_token')) {
        errorMessage = 'Invalid Google token';
        statusCode = 401;
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please try again.';
        statusCode = 503;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}