import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface ApplicationData {
  id: string;
  email: string;
  fullName: string;
  status: string;
  submittedAt: string;
  birthDate: string;
  [key: string]: unknown;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email diperlukan" },
        { status: 400 }
      );
    }

    // Ambil aplikasi berdasarkan email menggunakan Supabase
    const { data: applications, error } = await supabase
      .from("applicants")
      .select("id, email, fullName, status, submittedAt, birthDate")
      .eq("email", email)
      .limit(1);

    if (error) {
      console.error("Error memeriksa status:", error);
      return NextResponse.json(
        { success: false, message: "Gagal memeriksa status aplikasi" },
        { status: 500 }
      );
    }

    if (!applications || applications.length === 0) {
      return NextResponse.json(
        { success: false, message: "Aplikasi tidak ditemukan" },
        { status: 404 }
      );
    }

    const application = applications[0] as ApplicationData;

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        email: application.email,
        fullName: application.fullName,
        status: application.status,
        submittedAt: application.submittedAt,
        birthDate: application.birthDate,
      },
    });
  } catch (error) {
    console.error("Error memeriksa status:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memeriksa status aplikasi" },
      { status: 500 }
    );
  }
}
