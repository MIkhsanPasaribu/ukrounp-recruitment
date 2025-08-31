import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Ambil query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    console.log("Fetching applications with params:", {
      page,
      limit,
      search,
      status,
    });

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query
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
        updatedAt
      `
      )
      .order("submittedAt", { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(
        `nim.ilike.%${search}%,fullName.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    if (status) {
      query = query.eq("status", status);
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from("applicants")
      .select("*", { count: "exact", head: true });

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

    console.log(`Found ${applications?.length || 0} applications`);

    // Transform data to match InterviewCandidate interface
    const transformedApplications =
      applications?.map((app) => ({
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
        // Interview specific fields - set defaults since columns don't exist yet
        hasInterview: false,
        interviewStatus: "pending",
        interviewDate: undefined,
        totalScore: undefined,
        assignedInterviewer: undefined,
      })) || [];

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
