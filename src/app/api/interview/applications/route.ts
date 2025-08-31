import { NextRequest, NextResponse } from "next/server";
import { withInterviewerAuth } from "@/lib/auth-interviewer-middleware";
import { supabase } from "@/lib/supabase";

async function handler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    console.log("🔍 Fetching interview candidates with params:", {
      search,
      page,
      limit,
    });

    // Base query for applicants with status "INTERVIEW"
    let query = supabase
      .from("applicants")
      .select(
        `
        id,
        email,
        fullName,
        nickname,
        gender,
        birthDate,
        faculty,
        department,
        studyProgram,
        nim,
        nia,
        educationLevel,
        phoneNumber,
        status,
        updatedAt
      `,
        { count: "exact" }
      )
      .eq("status", "INTERVIEW");

    // Add search filter if provided
    if (search) {
      query = query.or(
        `fullName.ilike.%${search}%,email.ilike.%${search}%,nim.ilike.%${search}%,nia.ilike.%${search}%`
      );
    }

    // Apply pagination
    query = query
      .order("updatedAt", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: applicants, error, count } = await query;

    if (error) {
      console.error("❌ Error fetching interview candidates:", error);
      return NextResponse.json(
        { success: false, message: "Gagal mengambil data peserta wawancara" },
        { status: 500 }
      );
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasMore = page < totalPages;

    // Get interview sessions for these applicants to check if already scheduled
    const applicantIds = applicants?.map((app) => app.id) || [];
    const { data: sessions } = await supabase
      .from("interview_sessions")
      .select("id, applicantId, status, interviewDate, totalScore")
      .in("applicantId", applicantIds);

    // Merge session data with applicants
    const applicantsWithSessionInfo = applicants?.map((applicant) => {
      const session = sessions?.find((s) => s.applicantId === applicant.id);
      return {
        ...applicant,
        hasInterview: !!session,
        sessionId: session?.id || null,
        interviewStatus: session?.status || null,
        interviewDate: session?.interviewDate || null,
        totalScore: session?.totalScore || null,
      };
    });

    console.log(`✅ Found ${applicants?.length} interview candidates`);

    return NextResponse.json({
      success: true,
      data: applicantsWithSessionInfo,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count || 0,
        itemsPerPage: limit,
        hasMore,
      },
    });
  } catch (error) {
    console.error("❌ Error in interview applications endpoint:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export const GET = withInterviewerAuth(handler);
