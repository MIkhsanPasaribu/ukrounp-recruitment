import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AuthData {
  isAuthenticated: boolean;
  admin?: unknown;
  token?: string;
}

async function handler(request: NextRequest, _auth: AuthData) {
  try {
    if (request.method === "POST") {
      return await handleAttendanceConfirmation(request);
    } else if (request.method === "PUT") {
      return await handleInterviewerAssignment(request);
    }

    return NextResponse.json(
      { success: false, message: "Method not allowed" },
      { status: 405 }
    );
  } catch (error) {
    console.error("❌ Error in interview workflow endpoint:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// Step 1: Konfirmasi kehadiran dengan NIM dan ubah status ke INTERVIEW
async function handleAttendanceConfirmation(request: NextRequest) {
  try {
    const body = await request.json();
    const { nim } = body;

    if (!nim) {
      return NextResponse.json(
        { success: false, message: "NIM wajib diisi" },
        { status: 400 }
      );
    }

    console.log("📝 Confirming attendance for NIM:", nim);

    // Find applicant by NIM
    const { data: applicant, error: applicantError } = await supabase
      .from("applicants")
      .select("id, nim, fullName, status")
      .eq("nim", nim)
      .single();

    if (applicantError || !applicant) {
      return NextResponse.json(
        {
          success: false,
          message: "Pendaftar dengan NIM tersebut tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // Check if already attended
    if (applicant.status === "INTERVIEW") {
      return NextResponse.json(
        {
          success: false,
          message: "Pendaftar ini sudah dikonfirmasi hadir",
        },
        { status: 409 }
      );
    }

    // Update status to INTERVIEW and mark attendance
    const { data: updatedApplicant, error: updateError } = await supabase
      .from("applicants")
      .update({
        status: "INTERVIEW",
        attendanceConfirmed: true,
        attendanceNIM: nim,
        interviewStatus: "waiting_assignment",
        updatedAt: new Date().toISOString(),
      })
      .eq("id", applicant.id)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Error updating applicant:", updateError);
      return NextResponse.json(
        { success: false, message: "Gagal mengkonfirmasi kehadiran" },
        { status: 500 }
      );
    }

    console.log("✅ Attendance confirmed for:", applicant.fullName);
    return NextResponse.json({
      success: true,
      message: `Kehadiran ${applicant.fullName} (${nim}) berhasil dikonfirmasi`,
      data: updatedApplicant,
    });
  } catch (error) {
    console.error("❌ Error in handleAttendanceConfirmation:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// Step 2: Assign interviewer ke applicant yang sudah dikonfirmasi hadir
async function handleInterviewerAssignment(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicantId, interviewerUsername, scheduledDateTime } = body;

    if (!applicantId || !interviewerUsername) {
      return NextResponse.json(
        {
          success: false,
          message: "Applicant ID dan interviewer username wajib diisi",
        },
        { status: 400 }
      );
    }

    console.log(
      "👥 Assigning interviewer:",
      interviewerUsername,
      "to applicant:",
      applicantId
    );

    // Validate applicant exists and has attended
    const { data: applicant, error: applicantError } = await supabase
      .from("applicants")
      .select("id, nim, fullName, status, attendanceConfirmed")
      .eq("id", applicantId)
      .single();

    if (applicantError || !applicant) {
      return NextResponse.json(
        { success: false, message: "Applicant tidak ditemukan" },
        { status: 404 }
      );
    }

    if (!applicant.attendanceConfirmed || applicant.status !== "INTERVIEW") {
      return NextResponse.json(
        { success: false, message: "Applicant belum dikonfirmasi hadir" },
        { status: 400 }
      );
    }

    // Validate interviewer exists
    const { data: interviewer, error: interviewerError } = await supabase
      .from("interviewers")
      .select("id, username, fullName")
      .eq("username", interviewerUsername)
      .eq("isActive", true)
      .single();

    if (interviewerError || !interviewer) {
      return NextResponse.json(
        {
          success: false,
          message: "Interviewer tidak ditemukan atau tidak aktif",
        },
        { status: 404 }
      );
    }

    // Assign interviewer
    const { data: updatedApplicant, error: assignError } = await supabase
      .from("applicants")
      .update({
        assignedInterviewer: interviewerUsername,
        interviewDateTime: scheduledDateTime || new Date().toISOString(),
        interviewStatus: "assigned",
        updatedAt: new Date().toISOString(),
      })
      .eq("id", applicantId)
      .select(
        `
        id,
        nim,
        fullName,
        email,
        faculty,
        department,
        status,
        interviewStatus,
        assignedInterviewer,
        interviewDateTime,
        attendanceConfirmed
      `
      )
      .single();

    if (assignError) {
      console.error("❌ Error assigning interviewer:", assignError);
      return NextResponse.json(
        { success: false, message: "Gagal menugaskan interviewer" },
        { status: 500 }
      );
    }

    console.log(
      "✅ Interviewer assigned:",
      interviewerUsername,
      "to",
      applicant.fullName
    );
    return NextResponse.json({
      success: true,
      message: `${interviewer.fullName} ditugaskan untuk mewawancarai ${applicant.fullName}`,
      data: {
        applicant: updatedApplicant,
        interviewer: interviewer,
      },
    });
  } catch (error) {
    console.error("❌ Error in handleInterviewerAssignment:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
export const PUT = withAuth(handler);
