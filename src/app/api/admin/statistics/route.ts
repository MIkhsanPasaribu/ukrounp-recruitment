import { NextResponse } from "next/server";
import { pool } from "@/lib/mysql";

export async function GET() {
  try {
    const connection = await pool.getConnection();
    try {
      // Total applications
      const [totalResult] = await connection.query(
        "SELECT COUNT(*) as count FROM applicants"
      );
      const totalApplications = (totalResult as { count: number }[])[0].count;

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
        date: row.date,
        count: row.count,
      }));

      return NextResponse.json({
        totalApplications,
        statusCounts,
        facultyCounts,
        genderCounts,
        dailyApplications,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
