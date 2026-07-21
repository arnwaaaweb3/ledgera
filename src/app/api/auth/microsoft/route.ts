import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/src/lib/prisma'; // Sesuaikan path prisma kamu

export async function POST(request: NextRequest) {
  try {
    // 1. Safe JSON Parsing
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid or empty request body' }, { status: 400 });
    }

    const { code, turnstile_token } = body;

    // 2. Validasi Input Dasar
    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }
    if (!turnstile_token) {
      return NextResponse.json({ error: 'Security token (Turnstile) is missing' }, { status: 400 });
    }

    // 3. Verifikasi Cloudflare Turnstile (skip if in bypass mode)
    if (turnstile_token !== "error_bypass") {
      const secretKey = process.env.TURNSTILE_SECRET_KEY || "1x00000000000000000000AA";
      const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: secretKey, response: turnstile_token }),
      });

      const turnstileOutcome = await turnstileResponse.json();
      if (!turnstileOutcome.success) {
        console.warn('Cloudflare Turnstile verification failed:', turnstileOutcome);
        return NextResponse.json({ error: 'Security verification failed. Please refresh the page and try again.' }, { status: 403 });
      }
      console.log('Cloudflare Turnstile verified successfully.');
    } else {
      console.warn('⚠️ [TURNSTILE BYPASS] Allowing login without Turnstile verification (Turnstile had errors)');
    }

    // 4. Tukar 'code' dengan 'access_token' dari Microsoft
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        code: code,
        redirect_uri: process.env.NEXT_PUBLIC_MICROSOFT_REDIRECT_URI!,
        grant_type: 'authorization_code',
        scope: 'openid profile email User.Read',
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Microsoft token exchange failed:', tokenData);
      return NextResponse.json({ error: 'Failed to exchange code for access token' }, { status: 401 });
    }

    // 5. Ambil Data User dari Microsoft Graph API
    const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userInfoResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch user info from Microsoft' }, { status: 401 });
    }

    const userInfo = await userInfoResponse.json();
    const { id: microsoftId, mail, userPrincipalName, displayName } = userInfo;
    const email = (mail || userPrincipalName).toLowerCase(); // Pastikan email lowercase agar konsisten

    if (!email || !microsoftId) {
      return NextResponse.json({ error: 'Token payload is missing essential fields' }, { status: 400 });
    }

    console.log('✅ Microsoft verification successful:', { email, displayName });

    // 6. LOGIKA DATABASE YANG DIPERBAIKI (Merge Identity)
    // Cek apakah user dengan email ini sudah ada (misal: dulu daftar pakai Email/Google)
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    let user;
    if (existingUser) {
      // User sudah ada, UPDATE saja untuk menambahkan microsoftSub (Linking account)
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          microsoftSub: microsoftId,
          displayName: displayName || existingUser.displayName,
          updatedAt: new Date(),
        },
      });
      console.log('🔄 Existing user updated with Microsoft Sub:', user.id);
    } else {
      // User benar-benar baru, CREATE akun baru
      user = await prisma.user.create({
        data: {
          email: email,
          displayName: displayName || email.split('@')[0],
          microsoftSub: microsoftId,
          walletAddress: `tbd_${microsoftId.substring(0, 10)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log('🆕 New user created:', user.id);
    }

    // 7. Buat JWT Token
    const sessionToken = jwt.sign(
      { userId: user.id, email: user.email, displayName: user.displayName },
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
        picture: null,
      },
      message: 'Login successful',
    });

  } catch (error) {
    console.error('❌ Microsoft auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}