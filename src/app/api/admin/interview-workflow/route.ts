import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { supabase } from "@/lib/supabase";

async function handler(request: NextRequest) {
  if (request.method === "POST") {
    return await handleWorkflowAction(request);
  }

  return NextResponse.json(
    { success: false, message: "Method not allowed" },
    { status: 405 }
  );
}

async function handleWorkflowAction(request: NextRequest) {
  try {
    const { action, nim, applicantId, interviewerId } = await request.json();

    if (!action) {
      return NextResponse.json(
        { success: false, message: "Action harus diisi" },
        { status: 400 }
      );
    }

    if (action === "mark_attendance") {
      if (!nim) {
        return NextResponse.json(
          {
            success: false,
            message: "NIM harus diisi untuk konfirmasi kehadiran",
          },
          { status: 400 }
        );
      }

      // Find applicant by NIM
      const { data: applicant, error: applicantError } = await supabase
        .from("applicants")
        .select("id, nim, fullName")
        .eq("nim", nim)
        .single();

      if (applicantError || !applicant) {
        return NextResponse.json(
          {
            success: false,
            message: "Peserta dengan NIM tersebut tidak ditemukan",
          },
          { status: 404 }
        );
      }

      // Update applicant's status to INTERVIEW and mark attendance
      const { error: updateError } = await supabase
        .from("applicants")
        .update({
          status: "INTERVIEW",
          attendanceConfirmed: true,
          checkedInAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .eq("id", applicant.id);

      if (updateError) {
        console.error("Error updating applicant:", updateError);
        return NextResponse.json(
          { success: false, message: "Gagal mengupdate status peserta" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Kehadiran berhasil dikonfirmasi",
        data: { applicant, status: "INTERVIEW" },
      });
    } else if (action === "assign_interviewer") {
      if (!applicantId || !interviewerId) {
        return NextResponse.json(
          {
            success: false,
            message: "applicantId dan interviewerId harus diisi",
          },
          { status: 400 }
        );
      }

      // Get applicant data
      const { data: applicant, error: applicantError } = await supabase
        .from("applicants")
        .select("id, nim, fullName")
        .eq("id", applicantId)
        .single();

      if (applicantError || !applicant) {
        return NextResponse.json(
          { success: false, message: "Peserta tidak ditemukan" },
          { status: 404 }
        );
      }

      // Verify interviewer exists
      const { data: interviewer, error: interviewerError } = await supabase
        .from("interviewers")
        .select("id, username, fullName")
        .eq("username", interviewerId)
        .single();

      if (interviewerError || !interviewer) {
        return NextResponse.json(
          { success: false, message: "Pewawancara tidak ditemukan" },
          { status: 404 }
        );
      }

      // Update applicant's assignment
      const { error: assignmentError } = await supabase
        .from("applicants")
        .update({
          assignedInterviewer: interviewerId,
          interviewStatus: "ASSIGNED",
          updatedAt: new Date().toISOString(),
        })
        .eq("id", applicantId);

      if (assignmentError) {
        console.error("Error updating assignment:", assignmentError);
        return NextResponse.json(
          { success: false, message: "Gagal menugaskan pewawancara" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Pewawancara berhasil ditugaskan",
        data: { applicant, interviewer },
      });
    }

    return NextResponse.json(
      { success: false, message: "Action tidak valid" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in workflow action:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
