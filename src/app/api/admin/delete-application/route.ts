import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthData } from "@/lib/auth";

async function deleteApplication(request: NextRequest) {
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

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID data pendaftaran diperlukan" },
        { status: 400 }
      );
    }

    // Hapus aplikasi menggunakan Supabase
    const { error } = await supabase.from("applicants").delete().eq("id", id);

    if (error) {
      console.error("Error menghapus data pendaftaran:", error);
      return NextResponse.json(
        { success: false, message: "Gagal menghapus data pendaftaran" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data pendaftaran berhasil dihapus",
    });
  } catch (error) {
    console.error("Error menghapus data pendaftaran:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus data pendaftaran" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return deleteApplication(request);
}

export async function DELETE(request: NextRequest) {
  return deleteApplication(request);
}
