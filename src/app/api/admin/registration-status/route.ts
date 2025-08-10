import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Ambil status pendaftaran dari Supabase
    const { data: settings, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "registrationOpen")
      .limit(1);

    if (error) {
      console.error("Error mengambil status pendaftaran:", error);
      // Fallback ke true jika ada error
      return NextResponse.json({
        success: true,
        isOpen: true,
      });
    }

    // Jika tabel settings tidak ada atau tidak ada data, default ke true
    if (!settings || settings.length === 0) {
      console.log(
        "Tabel settings tidak ditemukan atau tidak ada data, default ke pendaftaran terbuka"
      );
      return NextResponse.json({
        success: true,
        isOpen: true, // Default ke true jika tidak ada setting
      });
    }

    return NextResponse.json({
      success: true,
      isOpen: settings[0].value === "true",
    });
  } catch (error) {
    console.error("Error mengambil status pendaftaran:", error);
    // Fallback ke true jika ada error
    return NextResponse.json({
      success: true,
      isOpen: true,
    });
  }
}

export async function POST(request: Request) {
  try {
    const { isOpen } = await request.json();

    if (typeof isOpen !== "boolean") {
      return NextResponse.json(
        { success: false, message: "isOpen harus berupa boolean" },
        { status: 400 }
      );
    }

    // Upsert status pendaftaran menggunakan Supabase
    const { error } = await supabase.from("settings").upsert(
      {
        key: "registrationOpen",
        value: isOpen.toString(),
      },
      {
        onConflict: "key",
      }
    );

    if (error) {
      console.error("Error memperbarui status pendaftaran:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Gagal memperbarui status pendaftaran",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Pendaftaran berhasil ${isOpen ? "dibuka" : "ditutup"}`,
    });
  } catch (error) {
    console.error("Error memproses permintaan status pendaftaran:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memproses permintaan status pendaftaran",
      },
      { status: 500 }
    );
  }
}
