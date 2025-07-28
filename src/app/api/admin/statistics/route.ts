import { NextResponse } from "next/server";
import { pool } from "@/lib/mysql";

export async function GET() {
  try {
    console.log("Fetching statistics from MySQL...");

    const connection = await pool.getConnection();
    try {
      // Test connection first
      await connection.ping();

      // Total applications
      const [totalResult] = await connection.query(
        "SELECT COUNT(*) as count FROM applicants"
      );
      const totalApplications = (totalResult as { count: number }[])[0].count;
      console.log("Total applications:", totalApplications);

      // Status counts
      const [statusResult] = await connection.query(
        "SELECT status, COUNT(*) as count FROM applicants GROUP BY status"
      );
      const statusCounts = (
        statusResult as { status: string; count: number }[]
      ).map((row) => ({
        _id: row.status,
        count: row.count,
      }));
      console.log("Status counts:", statusCounts);

      // Faculty counts
      const [facultyResult] = await connection.query(
        "SELECT faculty, COUNT(*) as count FROM applicants WHERE faculty IS NOT NULL GROUP BY faculty"
      );
      const facultyCounts = (
        facultyResult as { faculty: string; count: number }[]
      ).map((row) => ({
        _id: row.faculty,
        count: row.count,
      }));

      // Gender counts
      const [genderResult] = await connection.query(
        "SELECT gender, COUNT(*) as count FROM applicants WHERE gender IS NOT NULL GROUP BY gender"
      );
      const genderCounts = (
        genderResult as { gender: string; count: number }[]
      ).map((row) => ({
        _id: row.gender?.toLowerCase(),
        count: row.count,
      }));

      // Daily applications (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [dailyResult] = await connection.query(
        "SELECT DATE(submitted_at) as date, COUNT(*) as count FROM applicants WHERE submitted_at >= ? GROUP BY DATE(submitted_at) ORDER BY date",
        [thirtyDaysAgo.toISOString().split("T")[0]]
      );
      const dailyApplications = (
        dailyResult as { date: string; count: number }[]
      ).map((row) => ({
        _id: row.date,
        count: row.count,
      }));

      const statisticsData = {
        totalApplications,
        statusCounts,
        facultyCounts,
        genderCounts,
        dailyApplications,
      };

      console.log("Statistics successfully fetched:", statisticsData);

      return NextResponse.json({
        success: true,
        statistics: statisticsData,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching statistics:", error);

    // Provide more specific error messages
    let errorMessage = "Failed to fetch statistics";
    if (error instanceof Error) {
      if (error.message.includes("ECONNREFUSED")) {
        errorMessage =
          "Database connection refused. Check if MySQL is running.";
      } else if (error.message.includes("ER_NO_SUCH_TABLE")) {
        errorMessage =
          "Database table 'applicants' not found. Please setup database.";
      } else if (error.message.includes("ER_ACCESS_DENIED")) {
        errorMessage = "Database access denied. Check your credentials.";
      } else {
        errorMessage = `Database error: ${error.message}`;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
