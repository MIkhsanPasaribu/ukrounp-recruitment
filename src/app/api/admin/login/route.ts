import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin, getClientIP } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: "Username/email dan password harus diisi" },
        { status: 400 }
      );
    }

    // Get client info for audit logging
    const ipAddress = getClientIP(request);
    const userAgent = request.headers.get("user-agent") || undefined;

    // Authenticate admin
    const authResult = await authenticateAdmin(
      identifier,
      password,
      ipAddress,
      userAgent
    );

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: 401 }
      );
    }

    // Create response with token and admin info
    const response = NextResponse.json({
      success: true,
      message: authResult.message,
      token: authResult.token,
      admin: {
        id: authResult.admin?.id,
        username: authResult.admin?.username,
        email: authResult.admin?.email,
        fullName: authResult.admin?.fullName,
        role: authResult.admin?.role,
      },
    });

    // Set httpOnly cookie for additional security
    if (authResult.token) {
      response.cookies.set("adminToken", authResult.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60, // 24 hours
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
