import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthData } from "@/lib/auth";

/**
 * API endpoint untuk mengambil file upload dari pendaftaran
 * Mendukung streaming dan progressive loading
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; field: string }> }
) {
  try {
    // Verify admin authentication
    const authData = await getAuthData(request);
    if (!authData.isAuthenticated) {
      return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
    }

    const { id, field } = await params;

    // Validate field name
    const allowedFields = [
      "photo",
      "studentCard",
      "studyPlanCard",
      "mbtiProof",
      "igFollowProof",
      "tiktokFollowProof",
    ];

    if (!allowedFields.includes(field)) {
      return NextResponse.json({ error: "Field tidak valid" }, { status: 400 });
    }

    // Query database for the specific file using Supabase
    const { data, error } = await supabase
      .from("applicants")
      .select("*")
      .eq("id", id)
      .single();

    // Type assertion for applicant data
    interface ApplicantFileData {
      id: string;
      fullName: string;
      submittedAt: string;
      [key: string]: string | number | boolean | null | undefined;
    }
    const applicantData = data as ApplicantFileData | null;

    if (error || !applicantData) {
      return NextResponse.json(
        { error: "Pendaftaran tidak ditemukan" },
        { status: 404 }
      );
    }

    const fileData = applicantData[field as keyof typeof applicantData];

    if (!fileData) {
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 404 }
      );
    }

    // Return JSON response with base64 data and metadata
    return NextResponse.json({
      success: true,
      file: fileData, // Base64 data URL
      metadata: {
        id,
        fieldName: field,
        fileName: `${field}-${applicantData.fullName}`,
        uploadedAt: applicantData.submittedAt,
        isBase64: true,
      },
    });
  } catch (error) {
    console.error("Error fetching file:", error);
    return NextResponse.json(
      { error: "Gagal mengambil file" },
      { status: 500 }
    );
  }
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; field: string }> }
) {
  try {
    // Verify admin authentication
    const authData = await getAuthData(request);
    if (!authData.isAuthenticated) {
      return new NextResponse(null, { status: 401 });
    }

    const { id, field } = await params;

    // Validate field name
    const allowedFields = [
      "photo",
      "studentCard",
      "studyPlanCard",
      "mbtiProof",
      "igFollowProof",
      "tiktokFollowProof",
    ];

    if (!allowedFields.includes(field)) {
      return new NextResponse(null, { status: 400 });
    }

    // Check if file exists
    const { data, error } = await supabase
      .from("applicants")
      .select("*")
      .eq("id", id)
      .single();

    // Type assertion for applicant data
    interface ApplicantFileData2 {
      id: string;
      fullName: string;
      submittedAt: string;
      [key: string]: string | number | boolean | null | undefined;
    }
    const applicantFileData = data as ApplicantFileData2 | null;

    if (error || !applicantFileData) {
      return new NextResponse(null, { status: 404 });
    }

    const fileData = applicantFileData[field as keyof typeof applicantFileData];
    if (!fileData || typeof fileData !== "string") {
      return new NextResponse(null, { status: 404 });
    }

    // Estimate file size from base64 data
    const base64Data = fileData.split(",")[1] || fileData;
    const estimatedSize = Math.floor((base64Data.length * 3) / 4);

    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Length": estimatedSize.toString(),
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error checking file:", error);
    return new NextResponse(null, { status: 500 });
  }
}
