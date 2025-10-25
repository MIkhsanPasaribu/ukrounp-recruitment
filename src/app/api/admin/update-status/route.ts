import { NextRequest, NextResponse } from "next/server";
import { supabaseUntyped } from "@/lib/supabase";
import { getAuthData } from "@/lib/auth";

interface StatusUpdateData {
  status: string;
  [key: string]: unknown;
}

async function updateStatus(request: NextRequest) {
  try {
    // Check authentication
    const authData = await getAuthData(request);
    if (!authData.isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized - Token tidak valid atau tidak ada",
        },
        { status: 401 }
      );
    }

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "ID dan status diperlukan" },
        { status: 400 }
      );
    }

    // Validasi status
    const validStatuses = [
      "SEDANG_DITINJAU",
      "DAFTAR_PENDEK",
      "INTERVIEW",
      "DITERIMA",
      "DITOLAK",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Status tidak valid" },
        { status: 400 }
      );
    }

    // Update status aplikasi menggunakan Supabase
    const updateData: StatusUpdateData = { status };
    const { error } = await supabaseUntyped
      .from("applicants")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error memperbarui status:", error);
      return NextResponse.json(
        { success: false, message: "Gagal memperbarui status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Status berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error memperbarui status:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui status" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return updateStatus(request);
}

export async function PUT(request: NextRequest) {
  return updateStatus(request);
}
