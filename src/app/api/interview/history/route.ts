import { NextRequest, NextResponse } from "next/server";
import { withInterviewerAuth } from "@/lib/auth-interviewer-middleware";
import { supabase } from "@/lib/supabase";
import { InterviewerUser } from "@/types/interview";

async function handler(
  request: NextRequest,
  auth: {
    isAuthenticated: boolean;
    interviewer?: InterviewerUser;
    token?: string;
  }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "all";
    const offset = (page - 1) * limit;

    const interviewer = auth.interviewer!;

    console.log(
      "📋 Fetching interview history for interviewer:",
      interviewer.id
    );

    // Base query for interview sessions
    let query = supabase
      .from("interview_sessions")
      .select(
        `
        id,
        applicantId,
        interviewDate,
        location,
        status,
        totalScore,
        recommendation,
        createdAt,
        updatedAt,
        applicants!inner(
          id,
          fullName,
          email,
          nim,
          nia,
          faculty,
          department,
          studyProgram
        )
      `,
        { count: "exact" }
      )
      .eq("interviewerId", interviewer.id);

    // Add status filter if provided
    if (status !== "all") {
      query = query.eq("status", status.toUpperCase());
    }

    // Apply pagination and ordering
    query = query
      .order("createdAt", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: sessions, error, count } = await query;

    if (error) {
      console.error("❌ Error fetching interview history:", error);
      return NextResponse.json(
        { success: false, message: "Gagal mengambil riwayat wawancara" },
        { status: 500 }
      );
    }

    // Get response counts for each session
    const sessionIds = sessions?.map((s) => s.id) || [];
    const { data: responseCounts } = await supabase
      .from("interview_responses")
      .select("sessionId")
      .in("sessionId", sessionIds);

    // Group response counts by session
    const responseCountMap =
      responseCounts?.reduce((acc, response) => {
        acc[response.sessionId] = (acc[response.sessionId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

    // Merge session data with response counts
    const sessionsWithCounts = sessions?.map((session) => ({
      ...session,
      responseCount: responseCountMap[session.id] || 0,
      isCompleted: session.status === "COMPLETED",
      averageScore:
        session.totalScore && responseCountMap[session.id]
          ? (session.totalScore / responseCountMap[session.id]).toFixed(2)
          : null,
    }));

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasMore = page < totalPages;

    console.log(`✅ Found ${sessions?.length} interview sessions`);

    return NextResponse.json({
      success: true,
      data: sessionsWithCounts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count || 0,
        itemsPerPage: limit,
        hasMore,
      },
      summary: {
        totalSessions: count || 0,
        completedSessions:
          sessions?.filter((s) => s.status === "COMPLETED").length || 0,
        scheduledSessions:
          sessions?.filter((s) => s.status === "SCHEDULED").length || 0,
        inProgressSessions:
          sessions?.filter((s) => s.status === "IN_PROGRESS").length || 0,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching interview history:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export const GET = withInterviewerAuth(handler);
