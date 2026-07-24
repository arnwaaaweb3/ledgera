// src/app/api/auth/email/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { generateAutoWallet } from "@/src/lib/wallet";

// Helper untuk verifikasi token Cloudflare Turnstile
async function verifyTurnstileToken(token: string, remoteIp?: string | null): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.warn("⚠️ TURNSTILE_SECRET_KEY is not set in environment. Skipping verification for local dev.");
    return true;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });

    const outcome = await res.json();
    return outcome.success === true;
  } catch (error) {
    console.error("Cloudflare Turnstile verification error:", error);
    return false;
  }
}

// Helper untuk generate JWT aman
const generateToken = async (userId: string) => {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error("CRITICAL SECURITY ERROR: JWT_SECRET environment variable is not set!");
  }
  
  const secret = new TextEncoder().encode(secretKey);

  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret);
};

export async function POST(req: NextRequest) {
  try {
    const { email, password, turnstileToken } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // 1. Verifikasi Cloudflare Turnstile Token
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    
    if (turnstileToken) {
      const isValidCaptcha = await verifyTurnstileToken(turnstileToken, clientIp);
      if (!isValidCaptcha) {
        return NextResponse.json(
          { success: false, message: "Failed to verify. Please try again!" },
          { status: 400 }
        );
      }
    } else if (process.env.TURNSTILE_SECRET_KEY) {
      return NextResponse.json(
        { success: false, message: "Security token (Turnstile) is missing" },
        { status: 400 }
      );
    }

    // 2. Cek apakah user sudah ada
    const existingUser = await prisma.user.findUnique({ where: { email } });

    let safeUser: {
      id: string;
      email: string;
      displayName: string | null;
      walletAddress: string;
      googleSub: string | null;
      createdAt: Date;
      updatedAt: Date;
    };

    if (existingUser) {
      if (!existingUser.password) {
        return NextResponse.json(
          { success: false, message: "Akun ini terdaftar via Google/Microsoft. Silakan login dengan opsi tersebut." },
          { status: 401 }
        );
      }

      const isPasswordValid = await bcrypt.compare(password, existingUser.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: "Email atau password salah" },
          { status: 401 }
        );
      }

      safeUser = {
        id: existingUser.id,
        email: existingUser.email,
        displayName: existingUser.displayName,
        walletAddress: existingUser.walletAddress,
        googleSub: existingUser.googleSub,
        createdAt: existingUser.createdAt,
        updatedAt: existingUser.updatedAt,
      };
    } else {
      // 3. Jika user BELUM ada, buat wallet BNB Chain asli & catat user
      const hashedPassword = await bcrypt.hash(password, 10);
      const autoWallet = generateAutoWallet();

      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          walletAddress: autoWallet.address,
        },
        omit: {
          password: true,
        },
      });

      safeUser = newUser;
    }

    // 4. Generate Token
    const token = await generateToken(safeUser.id);

    // 5. Return response
    return NextResponse.json({
      success: true,
      token,
      user: safeUser,
    });

  } catch (error) {
    console.error("Email auth error:", error);
    return NextResponse.json(
      { success: false, message: "There's an error on the server" },
      { status: 500 }
    );
  }
}