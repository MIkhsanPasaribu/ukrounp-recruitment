/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth } from "@/lib/auth-middleware";

async function getStatistics(request: NextRequest) {
  try {
    // Ambil statistik dari Supabase
    const { data: applications, error } = await supabase
      .from("applicants")
      .select("status, submittedAt, gender, faculty")
      .order("submittedAt", { ascending: false });

    if (error) {
      console.error("Error mengambil statistik:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Gagal mengambil statistik",
          details: error.message,
        },
        { status: 500 }
      );
    }

    if (!applications || applications.length === 0) {
      return NextResponse.json({
        success: true,
        statistics: {
          totalApplications: 0,
          statusCounts: [],
          facultyCounts: [],
          genderCounts: [],
          dailyApplications: [],
        },
      });
    }

    // Hitung total
    const totalApplications = applications.length;

    // Status statistics - convert to expected format
    const statusStats = applications.reduce(
      (acc: Record<string, number>, app) => {
        const status = app.status || "SEDANG_DITINJAU";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {}
    );

    const statusCounts = Object.entries(statusStats).map(([status, count]) => ({
      _id: status,
      count,
    }));

    // Gender statistics - convert to expected format
    const genderStats = applications.reduce(
      (acc: Record<string, number>, app) => {
        const gender = app.gender || "TIDAK_DIKETAHUI";
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
      },
      {}
    );

    const genderCounts = Object.entries(genderStats).map(([gender, count]) => ({
      _id: gender,
      count,
    }));

    // Faculty statistics - convert to expected format
    const facultyStats = applications.reduce(
      (acc: Record<string, number>, app) => {
        const faculty = app.faculty || "TIDAK_DIKETAHUI";
        acc[faculty] = (acc[faculty] || 0) + 1;
        return acc;
      },
      {}
    );

    const facultyCounts = Object.entries(facultyStats).map(
      ([faculty, count]) => ({
        _id: faculty,
        count,
      })
    );

    // Daily statistics (submissions per day) - convert to expected format
    const dailyStats = applications.reduce(
      (acc: Record<string, number>, app) => {
        if (app.submittedAt) {
          const date = new Date(app.submittedAt).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          acc[date] = (acc[date] || 0) + 1;
        }
        return acc;
      },
      {}
    );

    const dailyApplications = Object.entries(dailyStats).map(
      ([date, count]) => ({
        _id: date,
        count,
      })
    );

    // Return statistics dalam format yang diharapkan AdminDashboard
    const statistics = {
      totalApplications,
      statusCounts,
      facultyCounts,
      genderCounts,
      dailyApplications,
    };

    return NextResponse.json({
      success: true,
      statistics,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error dalam statistik:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal menghasilkan statistik",
        details:
          error instanceof Error ? error.message : "Kesalahan tidak diketahui",
      },
      { status: 500 }
    );
  }
}

// Export protected GET handler
export const GET = withAuth(getStatistics);
