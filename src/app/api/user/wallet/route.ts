// src/app/api/user/wallet/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { isAddress } from "viem";

export async function POST(req: NextRequest) {
  try {
    const { userId, walletAddress } = await req.json();

    if (!userId || !walletAddress) {
      return NextResponse.json(
        { success: false, message: "User ID and Wallet Address are required" },
        { status: 400 }
      );
    }

    // ✅ FIX FUNC-3: Validasi format alamat EVM/BNB Chain asli
    if (!isAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, message: "Invalid EVM wallet address format" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { walletAddress },
      select: {
        id: true,
        email: true,
        displayName: true,
        walletAddress: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Wallet update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update wallet address" },
      { status: 500 }
    );
  }
}