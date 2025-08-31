import { NextRequest, NextResponse } from "next/server";
import { logoutInterviewer } from "@/lib/auth-interviewer";

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
      token = request.cookies.get("interviewerToken")?.value || null;
    }

    if (token) {
      // Logout interviewer (invalidate session token)
      await logoutInterviewer(token);
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Berhasil logout",
    });

    // Clear cookie
    response.cookies.set("interviewerToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Interviewer logout error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
