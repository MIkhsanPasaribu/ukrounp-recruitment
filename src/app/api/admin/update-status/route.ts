import { NextResponse } from "next/server";
import { pool } from "@/lib/mysql";
import { ResultSetHeader } from "mysql2";

export async function POST(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "ID and status are required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = [
      "SEDANG_DITINJAU",
      "DAFTAR_PENDEK",
      "INTERVIEW",
      "DITERIMA",
      "DITOLAK",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    // Update the application status using MySQL
    const connection = await pool.getConnection();
    try {
      const [result] = (await connection.query(
        "UPDATE applicants SET status = ? WHERE id = ?",
        [status, id]
      )) as [ResultSetHeader, unknown];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((result as any).affectedRows === 0) {
        return NextResponse.json(
          { success: false, message: "Application not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Status updated successfully",
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update status" },
      { status: 500 }
    );
  }
}
