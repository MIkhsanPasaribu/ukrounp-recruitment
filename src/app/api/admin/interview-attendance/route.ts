import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { supabase } from "@/lib/supabase";
import { checkMemoryUsage } from "@/utils/vercelOptimization";

interface AuthData {
  isAuthenticated: boolean;
  admin?: unknown;
  token?: string;
}

interface AttendanceInsertData {
  nim: string;
  applicant_id: string;
  checked_in_by: string;
  status: string;
  notes?: string;
}

interface AttendanceUpdateData {
  status?: string;
  notes?: string;
}

interface ApplicantData {
  id: string;
  nim?: string;
  fullName?: string;
  status?: string;
  email?: string;
  [key: string]: unknown;
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
      return await handleCreateAttendance(request, auth);
    } else if (request.method === "GET") {
      return await handleGetAttendance(request);
    } else if (request.method === "PUT") {
      return await handleUpdateAttendance(request);
    } else if (request.method === "DELETE") {
      return await handleDeleteAttendance(request);
    }

    return NextResponse.json(
      { success: false, message: "Method not allowed" },
      { status: 405 }
    );
  } catch (error) {
    console.error("❌ Error in attendance endpoint:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// Create attendance record
async function handleCreateAttendance(request: NextRequest, auth: AuthData) {
  try {
    const body = await request.json();
    const { nim, status = "PRESENT", notes } = body;

    if (!nim) {
      return NextResponse.json(
        { success: false, message: "NIM wajib diisi" },
        { status: 400 }
      );
    }

    console.log("📝 Creating attendance for NIM:", nim);

    // Find applicant by NIM
    const { data: applicantData, error: applicantError } = await supabase
      .from("applicants")
      .select("id, nim, fullName, status")
      .eq("nim", nim)
      .eq("status", "INTERVIEW")
      .single();

    const applicant = applicantData as {
      id: string;
      nim: string;
      fullName: string;
      status: string;
    } | null;

    if (applicantError || !applicant) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Pendaftar dengan NIM tersebut tidak ditemukan atau status bukan INTERVIEW",
        },
        { status: 404 }
      );
    }

    // Check if attendance already exists
    const { data: existingAttendance } = await supabase
      .from("interview_attendance")
      .select("id")
      .eq("nim", nim)
      .single();

    if (existingAttendance) {
      return NextResponse.json(
        { success: false, message: "Absensi untuk NIM ini sudah ada" },
        { status: 409 }
      );
    }

    // Create attendance record
    const adminId = (auth.admin as { id: string })?.id;
    const attendanceData: AttendanceInsertData = {
      nim,
      applicant_id: (applicant as ApplicantData).id,
      checked_in_by: adminId,
      status,
      notes,
    };

    const { data: attendanceResult, error: attendanceError } = await supabase
      .from("interview_attendance")
      .insert(attendanceData as AttendanceInsertData)
      .select(
        `
        id,
        nim,
        applicant_id,
        checked_in_at,
        checked_in_by,
        status,
        notes,
        created_at,
        applicants:applicant_id (
          id,
          fullName,
          nim,
          email,
          faculty,
          department
        )
      `
      )
      .single();

    const attendance = attendanceResult as {
      id: string;
      nim: string;
      applicant_id: string;
      checked_in_at: string;
      checked_in_by: string;
      status: string;
      notes: string;
    } | null;

    if (attendanceError) {
      console.error("❌ Error creating attendance:", attendanceError);
      return NextResponse.json(
        { success: false, message: "Gagal membuat absensi" },
        { status: 500 }
      );
    }

    console.log("✅ Attendance created successfully:", attendance?.id);
    return NextResponse.json({
      success: true,
      message: "Absensi berhasil dibuat",
      data: attendance,
    });
  } catch (error) {
    console.error("❌ Error in handleCreateAttendance:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// Get attendance records
async function handleGetAttendance(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const offset = (page - 1) * limit;

    console.log("📋 Fetching attendance records:", {
      page,
      limit,
      search,
      status,
    });

    // Build query
    let query = supabase.from("interview_attendance").select(
      `
        id,
        nim,
        applicant_id,
        checked_in_at,
        checked_in_by,
        status,
        notes,
        created_at,
        updated_at,
        applicants:applicant_id (
          id,
          fullName,
          nim,
          email,
          faculty,
          department,
          studyProgram
        ),
        admins:checked_in_by (
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
        `nim.ilike.%${search}%,applicants.fullName.ilike.%${search}%`
      );
    }

    if (status) {
      query = query.eq("status", status);
    }

    // Apply pagination
    query = query
      .order("checked_in_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: attendanceRecords, error, count } = await query;

    if (error) {
      console.error("❌ Error fetching attendance:", error);
      return NextResponse.json(
        { success: false, message: "Gagal mengambil data absensi" },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);
    const hasMore = page < totalPages;

    console.log(`✅ Found ${attendanceRecords?.length} attendance records`);

    return NextResponse.json({
      success: true,
      data: attendanceRecords,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count || 0,
        itemsPerPage: limit,
        hasMore,
      },
    });
  } catch (error) {
    console.error("❌ Error in handleGetAttendance:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// Update attendance record
async function handleUpdateAttendance(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID absensi wajib diisi" },
        { status: 400 }
      );
    }

    const updateData: AttendanceUpdateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const { data: attendanceData, error } = await supabase
      .from("interview_attendance")
      .update(updateData as AttendanceUpdateData)
      .eq("id", id)
      .select()
      .single();

    const attendance = attendanceData as {
      id: string;
      status: string;
      notes: string;
    } | null;

    if (error) {
      console.error("❌ Error updating attendance:", error);
      return NextResponse.json(
        { success: false, message: "Gagal mengupdate absensi" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Absensi berhasil diupdate",
      data: attendance,
    });
  } catch (error) {
    console.error("❌ Error in handleUpdateAttendance:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// Delete attendance record
async function handleDeleteAttendance(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID absensi wajib diisi" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("interview_attendance")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("❌ Error deleting attendance:", error);
      return NextResponse.json(
        { success: false, message: "Gagal menghapus absensi" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Absensi berhasil dihapus",
    });
  } catch (error) {
    console.error("❌ Error in handleDeleteAttendance:", error);
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
