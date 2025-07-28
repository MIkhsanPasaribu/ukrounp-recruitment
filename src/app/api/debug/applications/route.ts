import { NextResponse } from "next/server";
import { pool } from "@/lib/mysql";

export async function GET() {
  try {
    const connection = await pool.getConnection();
    try {
      const [applications] = await connection.query(
        "SELECT id, full_name, corel_draw, photoshop, adobe_premiere_pro, other_software FROM applicants LIMIT 1"
      );

      console.log("Raw database data:", applications);

      return NextResponse.json({
        debug: "Raw database values",
        data: applications,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: "Debug failed" }, { status: 500 });
  }
}
