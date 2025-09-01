import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { supabase } from "@/lib/supabase";

interface AuthData {
  isAuthenticated: boolean;
  admin?: unknown;
  token?: string;
}

async function handler(request: NextRequest, auth: AuthData) {
  if (request.method === "POST") {
    return await handleWorkflowAction(request, auth);
  }

  return NextResponse.json(
    { success: false, message: "Method not allowed" },
    { status: 405 }
  );
}

async function handleWorkflowAction(request: NextRequest, auth: AuthData) {
  try {
    const { action, nim, interviewerId, notes } = await request.json();
    const admin = auth.admin as {
      id: string;
      username: string;
      fullName: string;
    };

    if (!action || !nim) {
      return NextResponse.json(
        { success: false, message: "Action dan NIM harus diisi" },
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

    if (action === "mark_attendance") {
      // Mark attendance
      const { data: existingAttendance } = await supabase
        .from("interview_attendance")
        .select("id")
        .eq("applicantId", applicant.id)
        .single();

      if (existingAttendance) {
        return NextResponse.json(
          { success: false, message: "Absensi untuk peserta ini sudah ada" },
          { status: 400 }
        );
      }

      const { error: attendanceError } = await supabase
        .from("interview_attendance")
        .insert({
          nim: applicant.nim,
          applicantId: applicant.id,
          checkedInAt: new Date().toISOString(),
          checkedInBy: admin.id,
          status: "PRESENT",
          notes: notes || "",
        });

      if (attendanceError) {
        console.error("Error creating attendance:", attendanceError);
        return NextResponse.json(
          { success: false, message: "Gagal mencatat absensi" },
          { status: 500 }
        );
      }

      // Update applicant's attendance status
      await supabase
        .from("applicants")
        .update({
          attendanceConfirmed: true,
          checkedInAt: new Date().toISOString(),
        })
        .eq("id", applicant.id);

      return NextResponse.json({
        success: true,
        message: "Absensi berhasil dicatat",
        data: { applicant, status: "PRESENT" },
      });
    } else if (action === "assign_interviewer") {
      if (!interviewerId) {
        return NextResponse.json(
          { success: false, message: "ID pewawancara harus diisi" },
          { status: 400 }
        );
      }

      // Verify interviewer exists
      const { data: interviewer, error: interviewerError } = await supabase
        .from("interviewers")
        .select("id, fullName")
        .eq("id", interviewerId)
        .single();

      if (interviewerError || !interviewer) {
        return NextResponse.json(
          { success: false, message: "Pewawancara tidak ditemukan" },
          { status: 404 }
        );
      }

      // Check if assignment already exists
      const { data: existingAssignment } = await supabase
        .from("interviewer_assignments")
        .select("id")
        .eq("applicantId", applicant.id)
        .single();

      if (existingAssignment) {
        // Update existing assignment
        const { error: updateError } = await supabase
          .from("interviewer_assignments")
          .update({
            interviewerId,
            assignedBy: admin.id,
            assignedAt: new Date().toISOString(),
            status: "ASSIGNED",
            notes: notes || "",
          })
          .eq("applicantId", applicant.id);

        if (updateError) {
          console.error("Error updating assignment:", updateError);
          return NextResponse.json(
            { success: false, message: "Gagal memperbarui penugasan" },
            { status: 500 }
          );
        }
      } else {
        // Create new assignment
        const { error: assignmentError } = await supabase
          .from("interviewer_assignments")
          .insert({
            applicantId: applicant.id,
            interviewerId,
            assignedBy: admin.id,
            assignedAt: new Date().toISOString(),
            status: "ASSIGNED",
            notes: notes || "",
          });

        if (assignmentError) {
          console.error("Error creating assignment:", assignmentError);
          return NextResponse.json(
            { success: false, message: "Gagal membuat penugasan" },
            { status: 500 }
          );
        }
      }

      // Update applicant's assignment status
      await supabase
        .from("applicants")
        .update({
          assignedInterviewer: interviewerId,
          interviewStatus: "ASSIGNED",
        })
        .eq("id", applicant.id);

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
