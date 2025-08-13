import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { email, birthDate } = await request.json();

    if (!email || !birthDate) {
      return NextResponse.json(
        { success: false, message: "Email dan tanggal lahir harus diisi" },
        { status: 400 }
      );
    }

    // Query database untuk mencari aplikasi dengan email dan tanggal lahir yang cocok
    const { data: application, error } = await supabase
      .from("applications")
      .select("email, tanggal_lahir, nama_lengkap")
      .eq("email", email)
      .eq("tanggal_lahir", birthDate)
      .single();

    if (error || !application) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Data tidak ditemukan. Pastikan email dan tanggal lahir sudah benar.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Verifikasi berhasil! Selamat datang ${application.nama_lengkap}`,
      data: {
        nama: application.nama_lengkap,
        email: application.email,
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
