// src/app/api/auth/email/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma"; // Sesuaikan dengan path alias prisma kamu
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

// Helper untuk generate JWT
const generateToken = async (userId: string) => {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-super-secret-dev-key");
  
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret);
};

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // 1. Cek apakah user sudah ada
    const existingUser = await prisma.user.findUnique({ where: { email } });

    // 2. Definisikan tipe untuk user yang AMAN dikirim ke frontend (tanpa password)
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
      // Jika user ada, verifikasi password
      if (!existingUser.password) {
        return NextResponse.json(
          { success: false, message: "Akun ini terdaftar via Google. Silakan login dengan Google." },
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

      // Map manual untuk memastikan password TIDAK masuk ke safeUser
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
      // 3. Jika user BELUM ada, buat user baru (Auto-Register)
      const hashedPassword = await bcrypt.hash(password, 10);
      const dummyWalletAddress = `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`;

      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          walletAddress: dummyWalletAddress, 
        },
        omit: {
          password: true, 
        },
      });

      safeUser = newUser;
    }

    // 4. Generate Token (TypeScript sekarang 100% tahu safeUser.id ada dan bukan null)
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