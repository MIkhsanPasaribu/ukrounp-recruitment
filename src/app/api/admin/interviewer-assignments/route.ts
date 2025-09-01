import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { supabase } from "@/lib/supabase";
import { checkMemoryUsage } from "@/utils/vercelOptimization";

interface AuthData {
  isAuthenticated: boolean;
  admin?: unknown;
  token?: string;
}

async function handler(request: NextRequest, auth: AuthData) {
  try {
    // Monitor memory usage
    const memoryUsage = checkMemoryUsage();
    if (memoryUsage.percentage > 80) {
      console.warn(
        `⚠️ High memory usage: ${memoryUsage.percentage.toFixed(2)}%`
      );
    }

    if (request.method === "POST") {
      return await handleCreateAssignment(request, auth);
    } else if (request.method === "GET") {
      return await handleGetAssignments(request);
    } else if (request.method === "PUT") {
      return await handleUpdateAssignment(request);
    } else if (request.method === "DELETE") {
      return await handleDeleteAssignment(request);
    }

    return NextResponse.json(
      { success: false, message: "Method not allowed" },
      { status: 405 }
    );
  } catch (error) {
    console.error("❌ Error in assignment endpoint:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// Create interviewer assignment
async function handleCreateAssignment(request: NextRequest, auth: AuthData) {
  try {
    const body = await request.json();
    const { nim, interviewerId, scheduledAt, notes } = body;

    if (!nim || !interviewerId) {
      return NextResponse.json(
        { success: false, message: "NIM dan Interviewer ID wajib diisi" },
        { status: 400 }
      );
    }

    console.log(
      "📝 Creating assignment for NIM:",
      nim,
      "to Interviewer:",
      interviewerId
    );

    // Check if attendance exists and candidate is present
    const { data: attendance, error: attendanceError } = await supabase
      .from("interview_attendance")
      .select("id, applicant_id, status")
      .eq("nim", nim)
      .single();

    if (attendanceError || !attendance) {
      return NextResponse.json(
        {
          success: false,
          message: "Kandidat belum diabsen. Lakukan absensi terlebih dahulu.",
        },
        { status: 404 }
      );
    }

    if (attendance.status !== "PRESENT") {
      return NextResponse.json(
        {
          success: false,
          message: "Hanya kandidat yang hadir yang dapat ditugaskan",
        },
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
      .eq("attendance_id", attendance.id)
      .single();

    if (existingAssignment) {
      return NextResponse.json(
        { success: false, message: "Kandidat sudah ditugaskan ke pewawancara" },
        { status: 409 }
      );
    }

    // Create assignment
    const adminId = (auth.admin as { id: string })?.id;
    const { data: assignment, error: assignmentError } = await supabase
      .from("interviewer_assignments")
      .insert({
        attendance_id: attendance.id,
        interviewer_id: interviewerId,
        assigned_by: adminId,
        scheduled_at: scheduledAt || new Date().toISOString(),
        notes,
      })
      .select(
        `
        id,
        attendance_id,
        interviewer_id,
        assigned_by,
        assigned_at,
        scheduled_at,
        status,
        notes,
        created_at,
        interview_attendance:attendance_id (
          id,
          nim,
          applicant_id,
          status,
          applicants:applicant_id (
            id,
            fullName,
            nim,
            email,
            faculty,
            department
          )
        ),
        interviewers:interviewer_id (
          id,
          fullName,
          email
        ),
        admins:assigned_by (
          id,
          username,
          fullName
        )
      `
      )
      .single();

    if (assignmentError) {
      console.error("❌ Error creating assignment:", assignmentError);
      return NextResponse.json(
        { success: false, message: "Gagal membuat penugasan" },
        { status: 500 }
      );
    }

    console.log("✅ Assignment created successfully:", assignment.id);
    return NextResponse.json({
      success: true,
      message: "Penugasan berhasil dibuat",
      data: assignment,
    });
  } catch (error) {
    console.error("❌ Error in handleCreateAssignment:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// Get assignments
async function handleGetAssignments(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const search = searchParams.get("search") || "";
    const interviewerId = searchParams.get("interviewerId") || "";
    const status = searchParams.get("status") || "";
    const offset = (page - 1) * limit;

    console.log("📋 Fetching assignments:", {
      page,
      limit,
      search,
      interviewerId,
      status,
    });

    // Build query
    let query = supabase.from("interviewer_assignments").select(
      `
        id,
        attendance_id,
        interviewer_id,
        assigned_by,
        assigned_at,
        scheduled_at,
        status,
        notes,
        created_at,
        updated_at,
        interview_attendance:attendance_id (
          id,
          nim,
          applicant_id,
          status,
          checked_in_at,
          applicants:applicant_id (
            id,
            fullName,
            nim,
            email,
            faculty,
            department,
            studyProgram
          )
        ),
        interviewers:interviewer_id (
          id,
          fullName,
          email
        ),
        admins:assigned_by (
          id,
          username,
          fullName
        )
      `,
      { count: "exact" }
    );

    // Add filters
    if (search) {
      query = query.or(
        `interview_attendance.nim.ilike.%${search}%,interview_attendance.applicants.fullName.ilike.%${search}%`
      );
    }

    if (interviewerId) {
      query = query.eq("interviewer_id", interviewerId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    // Apply pagination
    query = query
      .order("assigned_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: assignments, error, count } = await query;

    if (error) {
      console.error("❌ Error fetching assignments:", error);
      return NextResponse.json(
        { success: false, message: "Gagal mengambil data penugasan" },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);
    const hasMore = page < totalPages;

    console.log(`✅ Found ${assignments?.length} assignments`);

    return NextResponse.json({
      success: true,
      data: assignments,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count || 0,
        itemsPerPage: limit,
        hasMore,
      },
    });
  } catch (error) {
    console.error("❌ Error in handleGetAssignments:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// Update assignment
async function handleUpdateAssignment(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, interviewerId, scheduledAt, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID penugasan wajib diisi" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (interviewerId) updateData.interviewer_id = interviewerId;
    if (scheduledAt) updateData.scheduled_at = scheduledAt;
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const { data: assignment, error } = await supabase
      .from("interviewer_assignments")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ Error updating assignment:", error);
      return NextResponse.json(
        { success: false, message: "Gagal mengupdate penugasan" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Penugasan berhasil diupdate",
      data: assignment,
    });
  } catch (error) {
    console.error("❌ Error in handleUpdateAssignment:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// Delete assignment
async function handleDeleteAssignment(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID penugasan wajib diisi" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("interviewer_assignments")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("❌ Error deleting assignment:", error);
      return NextResponse.json(
        { success: false, message: "Gagal menghapus penugasan" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Penugasan berhasil dihapus",
    });
  } catch (error) {
    console.error("❌ Error in handleDeleteAssignment:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
export const GET = withAuth(handler);
export const PUT = withAuth(handler);
export const DELETE = withAuth(handler);
