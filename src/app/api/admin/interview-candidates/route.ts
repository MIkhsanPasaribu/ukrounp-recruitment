import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { supabase } from "@/lib/supabase";

// Interface untuk candidate data
interface InterviewCandidateData {
  id: string;
  nim: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  faculty: string;
  department: string;
  studyProgram: string;
  educationLevel: string;
  status: string;
  submittedAt: string | Date;
  updatedAt: string | Date;
  interviewStatus?: string;
  assignedInterviewer?: string;
  attendanceConfirmed: boolean;
}

async function handler(request: NextRequest) {
  if (request.method === "GET") {
    return await getInterviewCandidates(request);
  }

  return NextResponse.json(
    { success: false, message: "Method not allowed" },
    { status: 405 }
  );
}

async function getInterviewCandidates(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const onlyUnassigned = searchParams.get("unassigned") === "true";

    console.log("Fetching interview candidates with params:", {
      search,
      onlyUnassigned,
    });

    // Base query for interview candidates
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
        attendanceConfirmed
      `
      )
      .eq("status", "INTERVIEW")
      .eq("attendanceConfirmed", true)
      .order("updatedAt", { ascending: false });

    // Add search filter if provided
    if (search.trim()) {
      query = query.or(
        `nim.ilike.%${search}%,fullName.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    // Filter for unassigned only
    if (onlyUnassigned) {
      query = query.is("assignedInterviewer", null);
    }

    const { data: candidatesData, error, count } = await query;
    const candidates = candidatesData as InterviewCandidateData[] | null;

    console.log("Interview candidates query result:", {
      candidates: candidates?.length || 0,
      error,
      count,
    });

    if (error) {
      console.error("Error fetching interview candidates:", error);
      return NextResponse.json(
        { success: false, error: "Gagal mengambil data kandidat interview" },
        { status: 500 }
      );
    }

    // Transform data for frontend
    const transformedCandidates =
      candidates?.map((candidate) => ({
        id: candidate.id,
        nim: candidate.nim,
        fullName: candidate.fullName,
        email: candidate.email,
        phoneNumber: candidate.phoneNumber,
        faculty: candidate.faculty,
        department: candidate.department,
        studyProgram: candidate.studyProgram,
        educationLevel: candidate.educationLevel,
        status: candidate.status,
        submittedAt: candidate.submittedAt,
        updatedAt: candidate.updatedAt,
        interviewStatus: candidate.interviewStatus || "PENDING",
        assignedInterviewer: candidate.assignedInterviewer,
        attendanceConfirmed: candidate.attendanceConfirmed,
      })) || [];

    console.log("Transformed candidates:", transformedCandidates.length);

    return NextResponse.json({
      success: true,
      candidates: transformedCandidates,
      total: transformedCandidates.length,
    });
  } catch (error) {
    console.error("Error in getInterviewCandidates:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
