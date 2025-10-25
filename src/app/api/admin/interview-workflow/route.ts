import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { supabase } from "@/lib/supabase";

interface InterviewerData {
  id: string;
  username: string;
  name?: string;
  [key: string]: unknown;
}

interface SupabaseResponse<T = unknown> {
  data: T | null;
  error: {
    message: string;
    code?: string;
  } | null;
}

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

      console.log("Looking for applicant with NIM:", nim);

      // Find applicant by NIM
      const { data: applicantData, error: applicantError } = await supabase
        .from("applicants")
        .select("id, nim, fullName, status, attendanceConfirmed")
        .eq("nim", nim)
        .single();

      const applicant = applicantData as {
        id: string;
        nim: string;
        fullName: string;
        status: string;
        attendanceConfirmed: boolean;
      } | null;

      console.log("Applicant query result:", { applicant, applicantError });

      if (applicantError || !applicant) {
        console.error("Applicant not found:", applicantError);
        return NextResponse.json(
          {
            success: false,
            message: "Peserta dengan NIM tersebut tidak ditemukan",
          },
          { status: 404 }
        );
      }

      // Update applicant's status to INTERVIEW and mark attendance
      console.log("Updating applicant with ID:", applicant.id);
      const updateData: {
        status: string;
        attendanceConfirmed: boolean;
        updatedAt: string;
      } = {
        status: "INTERVIEW",
        attendanceConfirmed: true,
        updatedAt: new Date().toISOString(),
      };

      console.log("Update data:", updateData);

      const { data: updateResult, error: updateError } = await supabase
        .from("applicants")
        .update(updateData)
        .eq("id", applicant.id)
        .select();

      console.log("Update result:", { updateResult, updateError });

      if (updateError) {
        console.error("Error updating applicant:", updateError);
        return NextResponse.json(
          {
            success: false,
            message: `Gagal mengupdate status peserta: ${updateError.message}`,
            error: updateError,
          },
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

      console.log("Assigning interviewer:", { applicantId, interviewerId });

      // Get applicant data
      const { data: applicant, error: applicantError } = await supabase
        .from("applicants")
        .select("id, nim, fullName, status, attendanceConfirmed")
        .eq("id", applicantId)
        .single();

      console.log("Applicant data:", { applicant, applicantError });

      if (applicantError || !applicant) {
        console.error("Applicant not found:", applicantError);
        return NextResponse.json(
          { success: false, message: "Peserta tidak ditemukan" },
          { status: 404 }
        );
      }

      // Debug: First check if table exists and what tables we have
      console.log("Looking for interviewer with username:", interviewerId);

      // Try different table name possibilities
      let interviewer = null;
      let interviewerError = null;

      // Try 'interviewers' table first
      const result1 = await supabase
        .from("interviewers")
        .select("*")
        .eq("username", interviewerId)
        .single();

      console.log("Query result from 'interviewers' table:", result1);

      const typedResult1 = result1 as SupabaseResponse<InterviewerData>;
      if (typedResult1.data) {
        interviewer = typedResult1.data;
      } else {
        interviewerError = typedResult1.error;
      }

      // If not found, the interviewer doesn't exist in the expected format
      if (interviewerError || !interviewer) {
        console.error("Interviewer not found in any table:", interviewerError);

        // Let's also try to see what interviewers exist
        const allInterviewers = await supabase
          .from("interviewers")
          .select("username, email")
          .limit(10);

        console.log("All interviewers in database:", allInterviewers.data);

        return NextResponse.json(
          {
            success: false,
            message: `Pewawancara '${interviewerId}' tidak ditemukan. Debug: ${JSON.stringify(
              interviewerError
            )}`,
          },
          { status: 404 }
        );
      }

      // Update applicant's assignment
      const assignmentData: {
        assignedInterviewer: string;
        interviewStatus: string;
        updatedAt: string;
      } = {
        assignedInterviewer: interviewerId,
        interviewStatus: "ASSIGNED",
        updatedAt: new Date().toISOString(),
      };

      console.log("Assignment data:", assignmentData);

      const { data: assignmentResult, error: assignmentError } = await supabase
        .from("applicants")
        .update(assignmentData)
        .eq("id", applicantId)
        .select();

      console.log("Assignment result:", { assignmentResult, assignmentError });

      if (assignmentError) {
        console.error("Error updating assignment:", assignmentError);
        return NextResponse.json(
          {
            success: false,
            message: `Gagal menugaskan pewawancara: ${assignmentError.message}`,
            error: assignmentError,
          },
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
