import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Ambil statistik dari Supabase
    const { data: applications, error } = await supabase
      .from("applicants")
      .select("status, submittedAt, gender, faculty")
      .order("submittedAt", { ascending: false });

    if (error) {
      console.error("Error mengambil statistik:", error);
      return NextResponse.json(
        { error: "Gagal mengambil statistik" },
        { status: 500 }
      );
    }

    // Hitung statistik
    const total = applications.length;

    // Status statistics
    const statusStats = applications.reduce(
      (acc: Record<string, number>, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      },
      {}
    );

    // Gender statistics
    const genderStats = applications.reduce(
      (acc: Record<string, number>, app) => {
        acc[app.gender] = (acc[app.gender] || 0) + 1;
        return acc;
      },
      {}
    );

    // Faculty statistics
    const facultyStats = applications.reduce(
      (acc: Record<string, number>, app) => {
        acc[app.faculty] = (acc[app.faculty] || 0) + 1;
        return acc;
      },
      {}
    );

    // Monthly statistics (submissions per month)
    const monthlyStats = applications.reduce(
      (acc: Record<string, number>, app) => {
        const month = new Date(app.submittedAt).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
        });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      },
      {}
    );

    const statistics = {
      total,
      byStatus: statusStats,
      byGender: genderStats,
      byFaculty: facultyStats,
      byMonth: monthlyStats,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(statistics);
  } catch (error) {
    console.error("Error dalam statistik:", error);
    return NextResponse.json(
      {
        error: "Gagal menghasilkan statistik",
        details:
          error instanceof Error ? error.message : "Kesalahan tidak diketahui",
      },
      { status: 500 }
    );
  }
}
