import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
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
    const { error } = await supabase
      .from("applicants")
      .update({ status })
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
