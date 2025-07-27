import { NextResponse } from "next/server";
import { pool } from "@/lib/mysql";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Fetch application by email using MySQL
    const connection = await pool.getConnection();
    try {
      const [applications] = await connection.query(
        "SELECT id, email, full_name, status, submitted_at, birth_date FROM applicants WHERE email = ?",
        [email]
      );

      const applicationsArray = applications as unknown[];

      if (!applicationsArray || applicationsArray.length === 0) {
        return NextResponse.json(
          { success: false, message: "Application not found" },
          { status: 404 }
        );
      }

      const application = applicationsArray[0] as {
        id: number;
        email: string;
        full_name: string;
        status: string;
        submitted_at: string;
        birth_date: string;
      };

      return NextResponse.json({
        success: true,
        application: {
          id: application.id.toString(),
          email: application.email,
          fullName: application.full_name,
          status: application.status,
          submittedAt: application.submitted_at,
          birthDate: application.birth_date,
        },
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error checking status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to check application status" },
      { status: 500 }
    );
  }
}
