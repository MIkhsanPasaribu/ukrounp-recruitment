import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthData } from "@/lib/auth";

/**
 * API endpoint untuk mengambil detail lengkap aplikasi pendaftaran
 * Termasuk metadata file dan informasi tambahan
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authData = await getAuthData(request);
    if (!authData.isAuthenticated) {
      return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
    }

    const { id } = await params;

    // Get complete application data
    const { data, error } = await supabase
      .from("applicants")
      .select("*")
      .eq("id", id)
      .single();

    // Type assertion untuk data applicant
    interface ApplicantDetailData {
      id: string;
      fullName: string;
      motivation?: string;
      futurePlans?: string;
      whyYouShouldBeAccepted?: string;
      [key: string]: string | number | boolean | null | undefined;
    }
    const applicantData = data as ApplicantDetailData | null;

    if (error || !applicantData) {
      console.error("🔍 Detailed API - Supabase Error:", { id, error });
      return NextResponse.json(
        { error: "Pendaftaran tidak ditemukan" },
        { status: 404 }
      );
    }

    // Debug logging untuk melihat data esai yang diambil dari database
    console.log("🔍 Detailed API - Raw Supabase Data:", {
      id,
      fullName: applicantData.fullName,
      essayFields: {
        motivation: {
          exists: !!applicantData.motivation,
          type: typeof applicantData.motivation,
          length: applicantData.motivation?.length || 0,
          preview: applicantData.motivation
            ? applicantData.motivation.substring(0, 100) + "..."
            : "NO DATA",
        },
        futurePlans: {
          exists: !!applicantData.futurePlans,
          type: typeof applicantData.futurePlans,
          length: applicantData.futurePlans?.length || 0,
          preview: applicantData.futurePlans
            ? applicantData.futurePlans.substring(0, 100) + "..."
            : "NO DATA",
        },
        whyYouShouldBeAccepted: {
          exists: !!applicantData.whyYouShouldBeAccepted,
          type: typeof applicantData.whyYouShouldBeAccepted,
          length: applicantData.whyYouShouldBeAccepted?.length || 0,
          preview: applicantData.whyYouShouldBeAccepted
            ? applicantData.whyYouShouldBeAccepted.substring(0, 100) + "..."
            : "NO DATA",
        },
      },
      allFieldsFromDB: Object.keys(applicantData),
    });

    // Analyze file uploads and add metadata
    const fileFields = [
      "photo",
      "studentCard",
      "studyPlanCard",
      "mbtiProof",
      "igFollowProof",
      "tiktokFollowProof",
    ];

    const fileMetadata = fileFields.reduce(
      (acc, field) => {
        const fileData = data[field as keyof typeof data];
        if (fileData && typeof fileData === "string") {
          // Extract metadata from base64 data
          const isBase64 = fileData.startsWith("data:");
          let size = 0;
          let mimeType = "application/octet-stream";

          if (isBase64) {
            const mimeMatch = fileData.match(/data:([^;]+)/);
            if (mimeMatch) {
              mimeType = mimeMatch[1];
            }

            const base64Data = fileData.split(",")[1] || fileData;
            size = Math.floor((base64Data.length * 3) / 4);
          }

          acc[field] = {
            exists: true,
            size,
            mimeType,
            isBase64,
            hasPreview: mimeType.startsWith("image/"),
          };
        } else {
          acc[field] = {
            exists: false,
            size: 0,
            mimeType: null,
            isBase64: false,
            hasPreview: false,
          };
        }
        return acc;
      },
      {} as Record<
        string,
        {
          exists: boolean;
          size: number;
          mimeType: string | null;
          isBase64: boolean;
          hasPreview: boolean;
        }
      >
    );

    // Enhance application data with computed fields
    const enhancedData = {
      ...data,
      // Add computed fields
      hasAllRequiredFiles: fileFields.every(
        (field) => fileMetadata[field].exists
      ),
      uploadedFilesCount: fileFields.filter(
        (field) => fileMetadata[field].exists
      ).length,
      totalFileSize: Object.values(fileMetadata).reduce(
        (sum: number, meta) => sum + meta.size,
        0
      ),

      // File metadata
      fileMetadata,

      // Add formatted dates
      submittedAtFormatted: data.submittedAt
        ? new Date(data.submittedAt).toLocaleString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,

      // Add age calculation if birthDate exists
      age: data.birthDate
        ? Math.floor(
            (Date.now() - new Date(data.birthDate).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000)
          )
        : null,

      // Software experience summary
      softwareExperienceCount: data.software
        ? Object.values(data.software).filter((val) => val === true).length
        : 0,
    };

    return NextResponse.json({
      success: true,
      data: enhancedData,
      metadata: {
        retrievedAt: new Date().toISOString(),
        version: "1.0",
      },
    });
  } catch (error) {
    console.error("Error fetching detailed application:", error);
    return NextResponse.json(
      { error: "Gagal mengambil detail pendaftaran" },
      { status: 500 }
    );
  }
}
