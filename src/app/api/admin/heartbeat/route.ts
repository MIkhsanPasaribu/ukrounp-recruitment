import { NextRequest, NextResponse } from "next/server";
import { getAuthData } from "@/lib/auth";

/**
 * API endpoint untuk heartbeat - mencegah timeout session
 * Digunakan untuk menjaga koneksi admin tetap aktif
 */

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authData = await getAuthData(request);
    if (!authData.isAuthenticated) {
      return NextResponse.json(
        { success: false, error: "Tidak diizinkan" },
        { status: 401 }
      );
    }

    const { timestamp } = await request.json();

    // Simple heartbeat response
    return NextResponse.json({
      success: true,
      serverTime: new Date().toISOString(),
      clientTime: timestamp ? new Date(timestamp).toISOString() : null,
      message: "Heartbeat berhasil",
    });
  } catch (error) {
    console.error("Error in heartbeat:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memproses heartbeat" },
      { status: 500 }
    );
  }
}
