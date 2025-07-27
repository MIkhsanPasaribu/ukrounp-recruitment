import { NextResponse } from "next/server";
import { pool } from "@/lib/mysql";
import { ResultSetHeader } from "mysql2";

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    // Delete the application using MySQL
    const connection = await pool.getConnection();
    try {
      const [result] = (await connection.query(
        "DELETE FROM applicants WHERE id = ?",
        [id]
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
        message: "Application deleted successfully",
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete application" },
      { status: 500 }
    );
  }
}
