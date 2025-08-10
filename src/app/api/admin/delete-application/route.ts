import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID diperlukan" },
        { status: 400 }
      );
    }

    // Hapus aplikasi menggunakan Supabase
    const { error } = await supabase.from("applicants").delete().eq("id", id);

    if (error) {
      console.error("Error menghapus aplikasi:", error);
      return NextResponse.json(
        { success: false, message: "Gagal menghapus aplikasi" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Aplikasi berhasil dihapus",
    });
  } catch (error) {
    console.error("Error menghapus aplikasi:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus aplikasi" },
      { status: 500 }
    );
  }
}
