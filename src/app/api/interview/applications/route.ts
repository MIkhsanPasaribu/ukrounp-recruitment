import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Ambil token dari header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Token tidak valid" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let interviewerUsername = "";

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        username: string;
      };
      interviewerUsername = decoded.username;
    } catch {
      return NextResponse.json(
        { success: false, error: "Token tidak valid" },
        { status: 401 }
      );
    }

    // Ambil query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    console.log(
      "Fetching applications for interviewer:",
      interviewerUsername,
      "with params:",
      {
        page,
        limit,
        search,
        status,
      }
    );

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query - hanya ambil yang ditugaskan ke interviewer ini
    console.log("Building query for interviewer:", interviewerUsername);

    let query = supabase
      .from("applicants")
      .select(
        `
        id,
        nim,
        fullName,
        email,
        phoneNumber,
        faculty,
        department,
        studyProgram,
        educationLevel,
        status,
        submittedAt,
        updatedAt,
        interviewStatus,
        assignedInterviewer,
        interviewDateTime,
        attendanceConfirmed,
        interviewScore,
        interviewNotes
      `
      )
      .eq("assignedInterviewer", interviewerUsername)
      .eq("status", "INTERVIEW")
      .eq("attendanceConfirmed", true)
      .order("submittedAt", { ascending: false });

    console.log("Query filters:", {
      assignedInterviewer: interviewerUsername,
      status: "INTERVIEW",
      attendanceConfirmed: true,
    });

    // Apply additional filters
    if (search) {
      query = query.or(
        `nim.ilike.%${search}%,fullName.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    if (status) {
      query = query.eq("interviewStatus", status);
    }

    // Get total count for pagination - count only assigned applicants
    const { count: totalCount } = await supabase
      .from("applicants")
      .select("*", { count: "exact", head: true })
      .eq("assignedInterviewer", interviewerUsername)
      .eq("status", "INTERVIEW")
      .eq("attendanceConfirmed", true);

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: applications, error } = await query;

    if (error) {
      console.error("Error fetching applications:", error);
      return NextResponse.json(
        { success: false, error: "Gagal mengambil data aplikasi" },
        { status: 500 }
      );
    }

    console.log(
      `Found ${
        applications?.length || 0
      } applications for interviewer: ${interviewerUsername}`
    );

    // Get interview sessions for these applicants
    const applicantIds = applications?.map((app) => app.id) || [];

    interface InterviewSessionData {
      id: string;
      applicantId: string;
      status: string;
      interviewDate: string;
      location: string;
      notes: string;
    }
    let interviewSessions: InterviewSessionData[] = [];

    if (applicantIds.length > 0) {
      const { data: sessions, error: sessionsError } = await supabase
        .from("interview_sessions")
        .select("id, applicantId, status, interviewDate, location, notes")
        .in("applicantId", applicantIds);

      if (!sessionsError && sessions) {
        interviewSessions = sessions as InterviewSessionData[];
        console.log(`Found ${sessions.length} existing interview sessions`);
      }
    }

    // Transform data to match InterviewCandidate interface
    const transformedApplications =
      applications?.map((app) => {
        // Find existing session for this applicant
        const existingSession = interviewSessions.find(
          (s) => s.applicantId === app.id
        );

        return {
          id: app.id,
          email: app.email,
          fullName: app.fullName,
          nim: app.nim,
          phoneNumber: app.phoneNumber,
          faculty: app.faculty,
          department: app.department,
          studyProgram: app.studyProgram,
          educationLevel: app.educationLevel,
          status: app.status,
          updatedAt: app.updatedAt,
          // Interview specific fields with actual data
          hasInterview: true,
          interviewStatus: app.interviewStatus || "ASSIGNED",
          interviewDate: app.interviewDateTime,
          totalScore: app.interviewScore,
          assignedInterviewer: app.assignedInterviewer,
          // Session data if exists
          sessionId: existingSession?.id || null,
          sessionStatus: existingSession?.status || null,
          // Additional fields
          attendanceStatus: app.attendanceConfirmed ? "PRESENT" : "ABSENT",
        };
      }) || [];

    return NextResponse.json({
      success: true,
      data: transformedApplications,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error in applications API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST untuk update status interview atau score
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicantId, action, data } = body;

    console.log("POST applications API:", { applicantId, action, data });

    if (!applicantId || !action) {
      return NextResponse.json(
        { success: false, error: "applicantId dan action diperlukan" },
        { status: 400 }
      );
    }

    let updateData: Record<string, string | number | boolean | null> = {};

    switch (action) {
      case "updateInterviewStatus":
        // Note: These columns don't exist yet, but keeping for future migration
        updateData = {
          status: data.status, // Use general status for now
          updatedAt: new Date().toISOString(),
        };
        break;

      case "updateInterviewScore":
        updateData = {
          status: "interviewed", // Use general status
          updatedAt: new Date().toISOString(),
        };
        break;

      case "assignInterview":
        updateData = {
          status: "scheduled", // Use general status
          updatedAt: new Date().toISOString(),
        };
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Action tidak valid" },
          { status: 400 }
        );
    }

    const { data: updatedApplicant, error } = await supabase
      .from("applicants")
      .update(updateData)
      .eq("id", applicantId)
      .select()
      .single();

    if (error) {
      console.error("Error updating applicant:", error);
      return NextResponse.json(
        { success: false, error: "Gagal mengupdate data aplikasi" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedApplicant,
    });
  } catch (error) {
    console.error("Error in applications POST API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
