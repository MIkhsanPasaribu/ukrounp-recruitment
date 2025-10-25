import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface ApplicationData {
  fullName: string;
  [key: string]: unknown;
}

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
      .from("applicants")
      .select("*")
      .eq("email", email)
      .eq("birthDate", birthDate)
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
      message: `Verifikasi berhasil! Data ditemukan untuk ${
        (application as ApplicationData).fullName
      }`,
      data: application as Record<string, unknown>,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
