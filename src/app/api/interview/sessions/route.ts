import { NextRequest, NextResponse } from "next/server";
import { withInterviewerAuth } from "@/lib/auth-interviewer-middleware";
import { supabase, supabaseUntyped } from "@/lib/supabase";
import { InterviewerUser } from "@/types/interview";

interface ApplicantData {
  id: string;
  fullName: string;
  email: string;
  status: string;
  assignedInterviewer: string;
  [key: string]: unknown;
}

// interface SessionData {
//   id: string;
//   applicantId: string;
//   interviewerId: string;
//   interviewDate: string;
//   location: string;
//   status: string;
//   notes: string;
//   created_at: string;
//   [key: string]: unknown;
// }

// interface InterviewerData {
//   id: string;
//   fullName: string;
//   [key: string]: unknown;
// }

async function handler(
  request: NextRequest,
  auth: {
    isAuthenticated: boolean;
    interviewer?: InterviewerUser;
    token?: string;
  }
) {
  try {
    const { applicantId, interviewDate, location, notes } =
      await request.json();
    const interviewer = auth.interviewer!;

    if (!applicantId) {
      return NextResponse.json(
        { success: false, message: "ID peserta harus diisi" },
        { status: 400 }
      );
    }

    console.log("🗓️ Creating interview session:", {
      applicantId,
      interviewerId: interviewer.id,
      interviewerUsername: interviewer.username,
    });

    // Check if applicant exists and has interview status
    const { data: applicant, error: applicantError } = await supabase
      .from("applicants")
      .select("id, fullName, email, status, assignedInterviewer")
      .eq("id", applicantId)
      .single();

    console.log("📋 Applicant query result:", { applicant, applicantError });

    if (applicantError || !applicant) {
      console.error("❌ Applicant not found:", applicantError);
      return NextResponse.json(
        {
          success: false,
          message: "Peserta tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // Check if applicant has correct status and assignment
    const applicantTyped = applicant as ApplicantData;
    if (applicantTyped.status !== "INTERVIEW") {
      console.error(
        "❌ Applicant status is not INTERVIEW:",
        applicantTyped.status
      );
      return NextResponse.json(
        {
          success: false,
          message: `Status peserta bukan INTERVIEW (saat ini: ${applicantTyped.status})`,
        },
        { status: 400 }
      );
    }

    if (applicantTyped.assignedInterviewer !== interviewer.username) {
      console.error("❌ Applicant not assigned to this interviewer:", {
        assigned: applicantTyped.assignedInterviewer,
        current: interviewer.username,
      });
      return NextResponse.json(
        {
          success: false,
          message: `Peserta tidak ditugaskan ke pewawancara ini`,
        },
        { status: 403 }
      );
    }

    // Check if interview session already exists for this applicant
    const { data: existingSession, error: existingSessionError } =
      await supabaseUntyped
        .from("interview_sessions")
        .select("id, status, interviewDate, location, notes")
        .eq("applicantId", applicantId)
        .single();

    if (existingSession && !existingSessionError) {
      console.log(
        "✅ Session already exists, returning existing session:",
        (existingSession as unknown as { id: string }).id
      );
      return NextResponse.json({
        success: true,
        message: "Sesi wawancara sudah ada, menggunakan sesi yang ada",
        data: {
          ...(existingSession as Record<string, unknown>),
          applicant: {
            id: applicantTyped.id,
            fullName: applicantTyped.fullName,
            email: applicantTyped.email,
          },
          interviewer: {
            id: interviewer.id,
            fullName: interviewer.fullName,
          },
        },
      });
    }

    // Create new interview session
    const sessionData = {
      applicantId,
      interviewerId: interviewer.id,
      interviewDate: interviewDate || new Date().toISOString(),
      location: location || "Online/Offline",
      notes: notes || "Sesi wawancara dibuat otomatis",
      status: "SCHEDULED",
    };

    console.log("📝 Creating session with data:", sessionData);

    const { data: session, error: sessionError } = await supabaseUntyped
      .from("interview_sessions")
      .insert(sessionData as Record<string, unknown>)
      .select(
        `
        id,
        applicantId,
        interviewerId,
        interviewDate,
        location,
        status,
        notes,
        created_at
      `
      )
      .single();

    if (sessionError) {
      console.error("❌ Error creating interview session:", {
        error: sessionError,
        data: sessionData,
        tableName: "interview_sessions",
      });
      return NextResponse.json(
        {
          success: false,
          message: `Gagal membuat sesi wawancara: ${sessionError.message}`,
          debug: sessionError.details || sessionError.hint,
        },
        { status: 500 }
      );
    }

    console.log(
      "✅ Interview session created successfully:",
      (session as unknown as { id: string }).id
    );

    return NextResponse.json({
      success: true,
      message: "Sesi wawancara berhasil dibuat",
      data: {
        ...(session as Record<string, unknown>),
        applicant: {
          id: applicantTyped.id,
          fullName: applicantTyped.fullName,
          email: applicantTyped.email,
        },
        interviewer: {
          id: interviewer.id,
          fullName: interviewer.fullName,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error creating interview session:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export const POST = withInterviewerAuth(handler);
