import { NextRequest, NextResponse } from "next/server";
import { logoutAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Token tidak ditemukan" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Logout admin (invalidate session token)
    await logoutAdmin(token);

    return NextResponse.json({
      success: true,
      message: "Berhasil logout",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
