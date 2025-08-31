import { NextRequest, NextResponse } from "next/server";
import { loginInterviewer } from "@/lib/auth-interviewer";

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: "Username/email dan password harus diisi" },
        { status: 400 }
      );
    }

    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    console.log("Login attempt for interviewer:", identifier);

    const result = await loginInterviewer(identifier, password, ipAddress);

    if (result.success && result.token && result.interviewer) {
      console.log("🔐 Interviewer auth result:", {
        success: result.success,
        hasToken: !!result.token,
        hasInterviewer: !!result.interviewer,
        message: result.message,
      });

      // Create response with token in body
      const response = NextResponse.json({
        success: true,
        message: result.message,
        token: result.token,
        interviewer: {
          id: result.interviewer.id,
          username: result.interviewer.username,
          email: result.interviewer.email,
          fullName: result.interviewer.fullName,
          role: result.interviewer.role,
        },
      });

      // Set httpOnly cookie for backend authentication
      response.cookies.set("interviewerToken", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 8 * 60 * 60, // 8 hours
        path: "/",
      });

      return response;
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Interviewer login error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
