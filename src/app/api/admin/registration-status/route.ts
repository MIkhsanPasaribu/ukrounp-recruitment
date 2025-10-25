import { NextResponse } from "next/server";
import { supabase, supabaseUntyped } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

interface SettingData {
  key: string;
  value: string;
  [key: string]: unknown;
}

interface SettingRecord {
  value: string;
  [key: string]: unknown;
}

export async function GET() {
  try {
    console.log("🔍 Mengambil status pendaftaran...");

    // Ambil status pendaftaran dari Supabase
    const { data: settings, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "registrationOpen")
      .limit(1);

    if (error) {
      console.error("❌ Error mengambil status pendaftaran:", error);
      // Fallback ke true jika ada error
      return NextResponse.json({
        success: true,
        isOpen: true,
        message: "Menggunakan status default: pendaftaran terbuka",
      });
    }

    // Jika tabel settings tidak ada atau tidak ada data, default ke true
    if (!settings || settings.length === 0) {
      console.log(
        "⚠️ Tabel settings tidak ditemukan atau tidak ada data, default ke pendaftaran terbuka"
      );

      // Buat entry default
      const settingData: SettingData = {
        key: "registrationOpen",
        value: "true",
      };
      const { error: insertError } = await supabaseUntyped
        .from("settings")
        .upsert(settingData);

      if (insertError) {
        console.error("❌ Error membuat setting default:", insertError);
      } else {
        console.log("✅ Setting default berhasil dibuat");
      }

      return NextResponse.json({
        success: true,
        isOpen: true,
        message: "Status default dibuat: pendaftaran terbuka",
      });
    }

    const isOpen = (settings[0] as SettingRecord).value === "true";
    console.log(
      `✅ Status pendaftaran berhasil diambil: ${
        isOpen ? "Terbuka" : "Tertutup"
      }`
    );

    return NextResponse.json({
      success: true,
      isOpen: isOpen,
      message: `Pendaftaran saat ini ${isOpen ? "terbuka" : "tertutup"}`,
    });
  } catch (error) {
    console.error("❌ Error mengambil status pendaftaran:", error);
    // Fallback ke true jika ada error
    return NextResponse.json({
      success: true,
      isOpen: true,
      message: "Error terjadi, menggunakan status default: pendaftaran terbuka",
    });
  }
}

export async function POST(request: Request) {
  try {
    console.log("🔄 Memproses permintaan perubahan status pendaftaran...");

    // Verifikasi token admin
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("❌ Token authorization tidak valid");
      return NextResponse.json(
        { success: false, message: "Token authorization diperlukan" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      console.error("❌ Token tidak valid atau telah kedaluwarsa");
      return NextResponse.json(
        { success: false, message: "Token tidak valid atau telah kedaluwarsa" },
        { status: 401 }
      );
    }

    // Periksa apakah token masih valid di database
    const { data: tokenData, error: tokenError } = await supabase
      .from("session_tokens")
      .select("*")
      .eq("token", token)
      .eq("isRevoked", false)
      .gt("expiresAt", new Date().toISOString())
      .single();

    if (tokenError || !tokenData) {
      console.error(
        "❌ Token tidak ditemukan atau telah kedaluwarsa di database"
      );
      return NextResponse.json(
        {
          success: false,
          message: "Sesi telah kedaluwarsa. Silakan login kembali.",
        },
        { status: 401 }
      );
    }

    const { isOpen } = await request.json();

    if (typeof isOpen !== "boolean") {
      console.error(
        "❌ Parameter isOpen harus berupa boolean, diterima:",
        typeof isOpen
      );
      return NextResponse.json(
        {
          success: false,
          message: "Parameter isOpen harus berupa boolean (true/false)",
        },
        { status: 400 }
      );
    }

    console.log(`🔄 ${isOpen ? "Membuka" : "Menutup"} pendaftaran...`);

    // Upsert status pendaftaran menggunakan Supabase
    const upsertData: SettingData = {
      key: "registrationOpen",
      value: isOpen.toString(),
    };
    const { error } = await supabaseUntyped.from("settings").upsert(upsertData);

    if (error) {
      console.error("❌ Error memperbarui status pendaftaran:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Gagal memperbarui status pendaftaran di database",
          error: error.message,
        },
        { status: 500 }
      );
    }

    const successMessage = `Pendaftaran berhasil ${
      isOpen ? "dibuka" : "ditutup"
    }`;
    console.log(`✅ ${successMessage} oleh admin: ${decoded.username}`);

    return NextResponse.json({
      success: true,
      message: successMessage,
      isOpen: isOpen,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error memproses permintaan status pendaftaran:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal server. Silakan coba lagi.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
