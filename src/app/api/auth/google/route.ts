// src/app/api/auth/google/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import prisma from '@/src/lib/prisma'; 

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);

export async function POST(request: NextRequest) {
  try {
    const { access_token } = await request.json();

    if (!access_token) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    // ✅ Verifikasi access token dengan getTokenInfo
    const tokenInfo = await googleClient.getTokenInfo(access_token);

    // TokenInfo hanya punya: email, sub (googleId), aud, exp, iat, iss, etc.
    const { 
      email, 
      sub: googleId,
    } = tokenInfo;

    if (!email || !googleId) {
      return NextResponse.json(
        { error: 'Token payload is missing essential fields' },
        { status: 400 }
      );
    }

    // ✅ Dapatkan user info dari endpoint Google People API
    let displayName = email?.split('@')[0] || 'User';
    let picture: string | null = null;

    try {
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json();
        displayName = userInfo.name || displayName;
        picture = userInfo.picture || null;
      }
    } catch (userInfoError) {
      console.warn('⚠️ Could not fetch user info from Google API:', userInfoError);
      // Lanjutkan dengan displayName dari email
    }

    console.log('✅ Google verification successful:', { email, displayName });

    // Cari atau buat user di database
    const user = await prisma.user.upsert({
      where: { googleSub: googleId },
      update: {
        email: email,
        displayName: displayName,
        updatedAt: new Date(),
      },
      create: {
        id: googleId,
        email: email,
        displayName: displayName,
        googleSub: googleId,
        walletAddress: `tbd_${googleId.substring(0, 10)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('👤 User saved:', { userId: user.id, email: user.email });

    // Buat JWT token untuk session
    const sessionToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        displayName: user.displayName,
      },
      process.env.JWT_SECRET!, 
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      token: sessionToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        walletAddress: user.walletAddress,
        picture: picture,
      },
      message: 'Login successful',
    });

  } catch (error) {
    console.error('❌ Google auth error:', error);
    
    let errorMessage = 'Authentication failed';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('invalid_token') || error.message.includes('Invalid Token')) {
        errorMessage = 'Invalid Google access token';
        statusCode = 401;
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please try again.';
        statusCode = 503;
      } else if (error.message.includes('JWT')) {
        errorMessage = 'Invalid JWT configuration';
        statusCode = 500;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}