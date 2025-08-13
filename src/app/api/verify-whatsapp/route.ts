import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { email, birthDate, step } = await request.json();

    // Step 1: Cek email dan kembalikan data aplikasi jika ditemukan
    if (step === "check_email") {
      if (!email) {
        return NextResponse.json(
          { success: false, message: "Email diperlukan" },
          { status: 400 }
        );
      }

      // Cari aplikasi berdasarkan email menggunakan table applicants (sama seperti cek status)
      const { data: applications, error } = await supabase
        .from("applicants")
        .select("id, email, fullName, birthDate, status")
        .eq("email", email)
        .limit(1);

      if (error) {
        console.error("Error checking email:", error);
        return NextResponse.json(
          { success: false, message: "Gagal memeriksa data aplikasi" },
          { status: 500 }
        );
      }

      if (!applications || applications.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Email tidak terdaftar dalam sistem kami",
          },
          { status: 404 }
        );
      }

      const application = applications[0];

      return NextResponse.json({
        success: true,
        message:
          "Email ditemukan! Silakan masukkan tanggal lahir untuk verifikasi.",
        data: {
          fullName: application.fullName,
          email: application.email,
          status: application.status,
        },
      });
    }

    // Step 2: Verifikasi tanggal lahir
    if (step === "verify_birthdate") {
      if (!email || !birthDate) {
        return NextResponse.json(
          { success: false, message: "Email dan tanggal lahir harus diisi" },
          { status: 400 }
        );
      }

      // Cari aplikasi dan verifikasi tanggal lahir
      const { data: applications, error } = await supabase
        .from("applicants")
        .select("id, email, fullName, birthDate, status")
        .eq("email", email)
        .eq("birthDate", birthDate)
        .limit(1);

      if (error) {
        console.error("Error verifying birthdate:", error);
        return NextResponse.json(
          { success: false, message: "Gagal memverifikasi data" },
          { status: 500 }
        );
      }

      if (!applications || applications.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Tanggal lahir tidak sesuai. Pastikan tanggal lahir sudah benar.",
          },
          { status: 404 }
        );
      }

      const application = applications[0];

      return NextResponse.json({
        success: true,
        message: `Verifikasi berhasil! Selamat datang ${application.fullName}`,
        data: {
          fullName: application.fullName,
          email: application.email,
          status: application.status,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: "Step tidak valid" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
