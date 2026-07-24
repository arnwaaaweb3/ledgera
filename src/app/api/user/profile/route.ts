// src/app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, displayName, username, avatarSeed } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Menyiapkan data yang akan di-update secara dinamis
    const updateData: {
      displayName?: string;
      username?: string;
      avatarSeed?: string;
    } = {};

    // 1. Validasi & Set Display Name
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

    // 2. Validasi & Set Username (@handle)
    if (username !== undefined && username.trim()) {
      let cleanUsername = username.trim().toLowerCase();
      // Hilangkan awalan '@' jika ada
      cleanUsername = cleanUsername.replace(/^@/, "");

      if (cleanUsername.length > 30) {
        return NextResponse.json(
          { success: false, message: "Username cannot exceed 30 characters" },
          { status: 400 }
        );
      }

      // Opsional: Cek apakah username sudah dipakai user lain
      const existingUser = await prisma.user.findFirst({
        where: {
          username: cleanUsername,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "Username is already taken" },
          { status: 400 }
        );
      }

      updateData.username = cleanUsername;
    }

    // 3. Set Avatar Seed
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
        username: true, // 👈 PENTING: Ikut kembalikan username ke frontend!
        avatarSeed: true,
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