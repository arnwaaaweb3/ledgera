// src/app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, displayName, avatarSeed } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Menyiapkan data yang akan di-update secara dinamis
    const updateData: { displayName?: string; avatarSeed?: string } = {};

    if (displayName !== undefined && displayName.trim()) {
      const cleanName = displayName.trim();
      if (cleanName.length > 50) {
        return NextResponse.json(
          { success: false, message: "Display name cannot exceed 50 characters" },
          { status: 400 }
        );
      }
      updateData.displayName = cleanName;
    }

    if (avatarSeed !== undefined) {
      updateData.avatarSeed = avatarSeed;
    }

    // Update di database Prisma
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarSeed: true, // 👈 Sertakan avatarSeed dalam return response
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