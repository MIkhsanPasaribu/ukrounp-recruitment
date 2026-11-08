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

    if (typeof applicantId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(applicantId) ||
        (interviewDate !== undefined && (typeof interviewDate !== "string" || interviewDate.length > 64 || !Number.isFinite(Date.parse(interviewDate)))) ||
        (location !== undefined && (typeof location !== "string" || location.length > 255)) ||
        (notes !== undefined && (typeof notes !== "string" || notes.length > 10000))) {
      return NextResponse.json(
        { success: false, message: "Data sesi tidak valid" },
        { status: 400 }
      );
    }


    // Check if applicant exists and has interview status
    const { data: applicant, error: applicantError } = await supabase
      .from("applicants")
      .select("id, fullName, email, status, assignedInterviewer, attendanceConfirmed, interviewStatus")
      .eq("id", applicantId)
      .single();


    if (applicantError || !applicant) {
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
    if (applicantTyped.status !== "INTERVIEW" || applicantTyped.attendanceConfirmed !== true) {
      return NextResponse.json(
        {
          success: false,
          message: "Peserta harus hadir dan berstatus INTERVIEW",
        },
        { status: 400 }
      );
    }

    if (applicantTyped.assignedInterviewer !== interviewer.username || !["ASSIGNED", "IN_PROGRESS", "COMPLETED"].includes(String(applicantTyped.interviewStatus))) {
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
        .eq("interviewerId", interviewer.id)
        .maybeSingle();

    if (existingSession && !existingSessionError) {
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

    if (existingSessionError) {
      return NextResponse.json({ success: false, message: "Gagal mengambil sesi wawancara" }, { status: 500 });
    }
    if (!["ASSIGNED", "IN_PROGRESS"].includes(String(applicantTyped.interviewStatus))) {
      return NextResponse.json({ success: false, message: "Penugasan tidak aktif" }, { status: 409 });
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

    if (sessionError?.code === "23505") {
      const retry = await supabaseUntyped.from("interview_sessions")
        .select("id, status, interviewDate, location, notes")
        .eq("applicantId", applicantId).eq("interviewerId", interviewer.id).maybeSingle();
      if (!retry.error && retry.data) {
        return NextResponse.json({ success: true, message: "Sesi wawancara sudah ada", data: { ...retry.data, applicant: { id: applicantTyped.id, fullName: applicantTyped.fullName, email: applicantTyped.email }, interviewer: { id: interviewer.id, fullName: interviewer.fullName } } });
      }
      return NextResponse.json({ success: false, message: "Sesi wawancara sudah ada atau penugasan berubah" }, { status: 409 });
    }
    if (sessionError) {
      return NextResponse.json(
        {
          success: false,
          message: "Gagal membuat sesi wawancara",
        },
        { status: 500 }
      );
    }


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
      return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export const POST = withInterviewerAuth(handler);
