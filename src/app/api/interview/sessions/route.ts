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
    if (applicant.status !== "INTERVIEW") {
      console.error("❌ Applicant status is not INTERVIEW:", applicant.status);
      return NextResponse.json(
        {
          success: false,
          message: `Status peserta bukan INTERVIEW (saat ini: ${applicant.status})`,
        },
        { status: 400 }
      );
    }

    if (applicant.assignedInterviewer !== interviewer.username) {
      console.error("❌ Applicant not assigned to this interviewer:", {
        assigned: applicant.assignedInterviewer,
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
      await supabase
        .from("interview_sessions")
        .select("id, status, interviewDate, location, notes")
        .eq("applicantId", applicantId)
        .single();

    if (existingSession && !existingSessionError) {
      console.log(
        "✅ Session already exists, returning existing session:",
        existingSession.id
      );
      return NextResponse.json({
        success: true,
        message: "Sesi wawancara sudah ada, menggunakan sesi yang ada",
        data: {
          ...existingSession,
          applicant: {
            id: applicant.id,
            fullName: applicant.fullName,
            email: applicant.email,
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

    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .insert(sessionData)
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

    console.log("✅ Interview session created successfully:", session.id);

    return NextResponse.json({
      success: true,
      message: "Sesi wawancara berhasil dibuat",
      data: {
        ...session,
        applicant: {
          id: applicant.id,
          fullName: applicant.fullName,
          email: applicant.email,
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
