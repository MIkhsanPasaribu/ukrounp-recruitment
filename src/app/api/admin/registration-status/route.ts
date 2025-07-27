import { NextResponse } from "next/server";
import { pool } from "@/lib/mysql";

export async function GET() {
  try {
    // Fetch registration status from MySQL
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        "SELECT value FROM settings WHERE `key` = ?",
        ["registrationOpen"]
      );

      // Jika tabel settings tidak ada atau tidak ada data, default ke true
      if (!rows || (rows as unknown[]).length === 0) {
        console.log(
          "Settings table not found or no data, defaulting to open registration"
        );
        return NextResponse.json({
          success: true,
          isOpen: true, // Default ke true jika tidak ada setting
        });
      }

      return NextResponse.json({
        success: true,
        isOpen: (rows as { value: string }[])[0].value === "true",
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching registration status:", error);
    // Fallback ke true jika ada error
    return NextResponse.json({
      success: true,
      isOpen: true,
    });
  }
}

export async function POST(request: Request) {
  try {
    const { isOpen } = await request.json();

    if (typeof isOpen !== "boolean") {
      return NextResponse.json(
        { success: false, message: "isOpen must be a boolean" },
        { status: 400 }
      );
    }

    // Upsert registration status using MySQL
    const connection = await pool.getConnection();
    try {
      // Check if the setting already exists
      const [existingRows] = await connection.query(
        "SELECT id FROM settings WHERE `key` = ?",
        ["registrationOpen"]
      );

      if ((existingRows as unknown[]).length > 0) {
        // Update existing setting
        await connection.query(
          "UPDATE settings SET value = ? WHERE `key` = ?",
          [isOpen.toString(), "registrationOpen"]
        );
      } else {
        // Insert new setting
        await connection.query(
          "INSERT INTO settings (`key`, value) VALUES (?, ?)",
          ["registrationOpen", isOpen.toString()]
        );
      }

      return NextResponse.json({
        success: true,
        message: `Registration ${isOpen ? "opened" : "closed"} successfully`,
      });
    } catch (error) {
      console.error("Error updating registration status:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update registration status",
          error: (error as Error).message,
        },
        { status: 500 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error processing registration status request:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process registration status request",
      },
      { status: 500 }
    );
  }
}
