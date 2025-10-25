/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { supabase } from "@/lib/supabase";
import { Applicant } from "@/types/interview";

async function handler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const faculty = searchParams.get("faculty");

    console.log("📊 Mengambil data analytics:", {
      dateFrom,
      dateTo,
      faculty,
    });

    // Membangun filter tanggal
    let dateFilter = "";
    if (dateFrom && dateTo) {
      dateFilter = `AND "submittedAt" BETWEEN '${dateFrom}' AND '${dateTo}'`;
    } else if (dateFrom) {
      dateFilter = `AND "submittedAt" >= '${dateFrom}'`;
    } else if (dateTo) {
      dateFilter = `AND "submittedAt" <= '${dateTo}'`;
    }

    // Membangun filter fakultas
    let facultyFilter = "";
    if (faculty && faculty !== "all") {
      facultyFilter = `AND faculty = '${faculty}'`;
    }

    // 1. STATISTIK OVERVIEW - menggunakan query builder
    let overviewQuery = supabase.from("applicants").select("*");

    if (dateFrom && dateTo) {
      overviewQuery = overviewQuery
        .gte("createdAt", dateFrom)
        .lte("createdAt", dateTo);
    }

    if (faculty && faculty !== "all") {
      overviewQuery = overviewQuery.eq("faculty", faculty);
    }

    const { data: allApplicants, error: overviewError } = await overviewQuery;

    if (overviewError) {
      console.error("❌ Error fetching overview:", overviewError);
      return NextResponse.json(
        { error: "Failed to fetch overview data" },
        { status: 500 }
      );
    }

    // Type assertion untuk allApplicants dengan properties tambahan
    const applicants = allApplicants as (Applicant & {
      attendanceConfirmed?: boolean;
      interviewScore?: number;
    })[] | null;

    // Calculate overview statistics
    const overview = [
      {
        total_applications: applicants?.length || 0,
        accepted_count:
          applicants?.filter((app) => app.status === "DITERIMA").length || 0,
        rejected_count:
          applicants?.filter((app) => app.status === "DITOLAK").length || 0,
        under_review_count:
          applicants?.filter((app) => app.status === "SEDANG_DITINJAU")
            .length || 0,
        interview_count:
          applicants?.filter((app) => app.status === "INTERVIEW").length ||
          0,
        attendance_confirmed_count:
          applicants?.filter((app) => app.attendanceConfirmed === true)
            .length || 0,
        interviewed_count:
          applicants?.filter((app) => app.interviewScore !== null).length ||
          0,
        avg_interview_score: (() => {
          const interviewedApps =
            applicants?.filter((app) => app.interviewScore !== null) || [];
          if (interviewedApps.length === 0) return 0;
          const sum = interviewedApps.reduce(
            (sum, app) => sum + (app.interviewScore || 0),
            0
          );
          return sum / interviewedApps.length;
        })(),
      },
    ];

    // 2. BREAKDOWN FAKULTAS
    const { data: facultyBreakdown, error: facultyError } = await supabase
      .from("applicants")
      .select("faculty")
      .not("faculty", "is", null);

    if (facultyError) {
      console.error("❌ Error breakdown fakultas:", facultyError);
    }

    // Memproses data fakultas
    const facultyStats: Record<string, number> = {};
    facultyBreakdown?.forEach((item) => {
      const faculty = item.faculty;
      facultyStats[faculty] = (facultyStats[faculty] || 0) + 1;
    });

    // 3. BREAKDOWN STATUS
    const { data: statusBreakdown, error: statusError } = await supabase
      .from("applicants")
      .select("status")
      .not("status", "is", null);

    if (statusError) {
      console.error("❌ Error breakdown status:", statusError);
    }

    // Memproses data status
    const statusStats: Record<string, number> = {};
    statusBreakdown?.forEach((item) => {
      const status = item.status;
      statusStats[status] = (statusStats[status] || 0) + 1;
    });

    // 4. BREAKDOWN TINGKAT PENDIDIKAN
    const { data: educationBreakdown, error: educationError } = await supabase
      .from("applicants")
      .select('"educationLevel"')
      .not("educationLevel", "is", null);

    if (educationError) {
      console.error("❌ Error breakdown tingkat pendidikan:", educationError);
    }

    // Memproses data pendidikan
    const educationStats: Record<string, number> = {};
    educationBreakdown?.forEach((item) => {
      const level = item.educationLevel;
      educationStats[level] = (educationStats[level] || 0) + 1;
    });

    // 5. BREAKDOWN JENIS KELAMIN
    const { data: genderBreakdown, error: genderError } = await supabase
      .from("applicants")
      .select("gender")
      .not("gender", "is", null);

    if (genderError) {
      console.error("❌ Error breakdown jenis kelamin:", genderError);
    }

    // Memproses data jenis kelamin
    const genderStats: Record<string, number> = {};
    genderBreakdown?.forEach((item) => {
      const gender = item.gender;
      genderStats[gender] = (genderStats[gender] || 0) + 1;
    });

    // 6. ANALISIS SKILL/KEAHLIAN
    const { data: skillsData, error: skillsError } = await supabase.from(
      "applicants"
    ).select(`
        "corelDraw", photoshop, "adobePremierePro", "adobeAfterEffect",
        "autodeskEagle", "arduinoIde", "androidStudio", "visualStudio",
        "missionPlaner", "autodeskInventor", "autodeskAutocad", solidworks
      `);

    if (skillsError) {
      console.error("❌ Error analisis skill:", skillsError);
    }

    // Memproses data skill
    const skillsStats: Record<string, number> = {};
    const skillColumns = [
      "corelDraw",
      "photoshop",
      "adobePremierePro",
      "adobeAfterEffect",
      "autodeskEagle",
      "arduinoIde",
      "androidStudio",
      "visualStudio",
      "missionPlaner",
      "autodeskInventor",
      "autodeskAutocad",
      "solidworks",
    ];

    skillColumns.forEach((skill) => {
      skillsStats[skill] =
        skillsData?.filter((item) => {
          return item[skill as keyof typeof item] === true;
        }).length || 0;
    });

    // 7. PERFORMA INTERVIEWER
    const { data: interviewSessions, error: interviewError } = await supabase
      .from("interview_sessions")
      .select(
        `
        id,
        "interviewerId",
        "totalScore",
        recommendation,
        status,
        created_at,
        interviewers!inner(
          id,
          "fullName",
          username
        )
      `
      )
      .eq("status", "COMPLETED");

    if (interviewError) {
      console.error("❌ Error performa interviewer:", interviewError);
    }

    // Memproses data interview
    const interviewerStats: Record<
      string,
      {
        name: string;
        totalSessions: number;
        totalScore: number;
        averageScore: string;
        recommendations: {
          SANGAT_DIREKOMENDASIKAN: number;
          DIREKOMENDASIKAN: number;
          CUKUP: number;
          TIDAK_DIREKOMENDASIKAN: number;
        };
      }
    > = {};
    interviewSessions?.forEach((session) => {
      const interviewer = Array.isArray(session.interviewers)
        ? session.interviewers[0]
        : session.interviewers;

      const interviewerId = interviewer?.id;
      const interviewerName = interviewer?.fullName || interviewer?.username;

      if (!interviewerStats[interviewerId]) {
        interviewerStats[interviewerId] = {
          name: interviewerName,
          totalSessions: 0,
          totalScore: 0,
          averageScore: "0",
          recommendations: {
            SANGAT_DIREKOMENDASIKAN: 0,
            DIREKOMENDASIKAN: 0,
            CUKUP: 0,
            TIDAK_DIREKOMENDASIKAN: 0,
          },
        };
      }

      interviewerStats[interviewerId].totalSessions++;
      interviewerStats[interviewerId].totalScore += session.totalScore || 0;

      if (session.recommendation) {
        const recommendation =
          session.recommendation as keyof (typeof interviewerStats)[string]["recommendations"];
        interviewerStats[interviewerId].recommendations[recommendation]++;
      }
    });

    // Menghitung skor rata-rata untuk interviewer
    Object.keys(interviewerStats).forEach((id) => {
      const stats = interviewerStats[id];
      stats.averageScore =
        stats.totalSessions > 0
          ? (stats.totalScore / stats.totalSessions).toFixed(2)
          : "0";
    });

    // 8. ANALISIS TIMELINE (30 hari terakhir)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: timelineData, error: timelineError } = await supabase
      .from("applicants")
      .select('"submittedAt", status')
      .gte("submittedAt", thirtyDaysAgo.toISOString())
      .order("submittedAt", { ascending: true });

    if (timelineError) {
      console.error("❌ Error analisis timeline:", timelineError);
    }

    // Memproses data timeline (group by hari)
    const timelineStats: Record<
      string,
      { total: number; statuses: Record<string, number> }
    > = {};
    timelineData?.forEach((item) => {
      const date = new Date(item.submittedAt).toISOString().split("T")[0];
      if (!timelineStats[date]) {
        timelineStats[date] = { total: 0, statuses: {} };
      }
      timelineStats[date].total++;
      timelineStats[date].statuses[item.status] =
        (timelineStats[date].statuses[item.status] || 0) + 1;
    });

    // 9. FUNNEL KONVERSI
    const totalApplications = overview?.[0]?.total_applications || 0;
    const interviewCount = overview?.[0]?.interview_count || 0;
    const interviewedCount = overview?.[0]?.interviewed_count || 0;
    const acceptedCount = overview?.[0]?.accepted_count || 0;

    const conversionFunnel = {
      applied: totalApplications,
      interview_scheduled: interviewCount,
      interview_completed: interviewedCount,
      accepted: acceptedCount,
      conversion_rates: {
        application_to_interview:
          totalApplications > 0
            ? ((interviewCount / totalApplications) * 100).toFixed(2)
            : 0,
        interview_to_completion:
          interviewCount > 0
            ? ((interviewedCount / interviewCount) * 100).toFixed(2)
            : 0,
        completion_to_acceptance:
          interviewedCount > 0
            ? ((acceptedCount / interviewedCount) * 100).toFixed(2)
            : 0,
      },
    };

    console.log("✅ Data analytics berhasil diambil");

    return NextResponse.json({
      success: true,
      data: {
        overview: overview?.[0] || {},
        facultyBreakdown: facultyStats,
        statusBreakdown: statusStats,
        educationBreakdown: educationStats,
        genderBreakdown: genderStats,
        skillsAnalysis: skillsStats,
        interviewerPerformance: interviewerStats,
        timeline: timelineStats,
        conversionFunnel,
        metadata: {
          dateFrom,
          dateTo,
          faculty,
          generatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("❌ Error API Analytics:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data analytics" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
