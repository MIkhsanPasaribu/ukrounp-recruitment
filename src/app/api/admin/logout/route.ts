import { NextRequest, NextResponse } from "next/server";
import { logoutAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Try to get token from multiple sources
    let token: string | null = null;

    // 1. From Authorization header
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    // 2. From cookies
    if (!token) {
      token = request.cookies.get("adminToken")?.value || null;
    }

    if (token) {
      // Logout admin (invalidate session token)
      await logoutAdmin(token);
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Berhasil logout",
    });

    // Clear cookie
    response.cookies.set("adminToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
