// src/app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, displayName } = await req.json();

    if (!userId || !displayName || !displayName.trim()) {
      return NextResponse.json(
        { success: false, message: "User ID and valid name are required" },
        { status: 400 }
      );
    }

    const cleanName = displayName.trim();

    // ✅ FIX BP-6: Batasi panjang nama maksimal 50 karakter
    if (cleanName.length > 50) {
      return NextResponse.json(
        { success: false, message: "Display name cannot exceed 50 characters" },
        { status: 400 }
      );
    }

    // Update displayName di database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { displayName: cleanName },
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
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user profile" },
      { status: 500 }
    );
  }
}