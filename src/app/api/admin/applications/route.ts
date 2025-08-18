import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth } from "@/lib/auth-middleware";

async function getApplications(request: NextRequest) {
  try {
    // Cek query parameters
    const url = new URL(request.url);
    const applicationId = url.searchParams.get("id");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const lightweight = url.searchParams.get("lightweight") === "true";
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";

    // Simplified approach - build query step by step
    let queryBuilder = supabase.from("applicants").select("*");

    // Filter by ID jika disediakan
    if (applicationId) {
      queryBuilder = queryBuilder.eq("id", applicationId);
    } else {
      // Apply search filter
      if (search) {
        queryBuilder = queryBuilder.or(
          `fullName.ilike.%${search}%,email.ilike.%${search}%,nim.ilike.%${search}%`
        );
      }

      // Apply status filter
      if (status && status !== "all") {
        queryBuilder = queryBuilder.eq("status", status);
      }

      // Apply pagination (hanya untuk list, bukan single item)
      const offset = (page - 1) * limit;
      queryBuilder = queryBuilder.range(offset, offset + limit - 1);

      // Order by submittedAt
      queryBuilder = queryBuilder.order("submittedAt", { ascending: false });
    }

    const { data: applications, error } = await queryBuilder;

    if (error) {
      console.error("Error mengambil aplikasi:", error);
      return NextResponse.json(
        {
          error: "Gagal mengambil aplikasi",
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Transform data berdasarkan mode
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedApplications = (applications || []).map((app: any) => {
      const baseData = {
        id: app.id,
        email: app.email,
        fullName: app.fullName,
        nim: app.nim,
        faculty: app.faculty,
        department: app.department,
        studyProgram: app.studyProgram,
        educationLevel: app.educationLevel,
        status: app.status,
        submittedAt: app.submittedAt,
        phoneNumber: app.phoneNumber,
      };

      // Mode lightweight: hanya return base data
      if (lightweight) {
        return baseData;
      }

      // Mode list atau detail: tambahkan field lainnya
      const extendedData = {
        ...baseData,
        nickname: app.nickname,
        gender: app.gender,
        birthDate: app.birthDate,
        nia: app.nia,
        previousSchool: app.previousSchool,
        padangAddress: app.padangAddress,
        motivation: app.motivation,
        futurePlans: app.futurePlans,
        whyYouShouldBeAccepted: app.whyYouShouldBeAccepted,
        software: {
          corelDraw: Boolean(app.corelDraw),
          photoshop: Boolean(app.photoshop),
          adobePremierePro: Boolean(app.adobePremierePro),
          adobeAfterEffect: Boolean(app.adobeAfterEffect),
          autodeskEagle: Boolean(app.autodeskEagle),
          arduinoIde: Boolean(app.arduinoIde),
          androidStudio: Boolean(app.androidStudio),
          visualStudio: Boolean(app.visualStudio),
          missionPlaner: Boolean(app.missionPlaner),
          autodeskInventor: Boolean(app.autodeskInventor),
          autodeskAutocad: Boolean(app.autodeskAutocad),
          solidworks: Boolean(app.solidworks),
          others: app.otherSoftware || "",
        },
      };

      // Mode detail: tambahkan file uploads (hanya untuk single item)
      if (applicationId) {
        return {
          ...extendedData,
          mbtiProof: app.mbtiProof,
          photo: app.photo,
          studentCard: app.studentCard,
          studyPlanCard: app.studyPlanCard,
          igFollowProof: app.igFollowProof,
          tiktokFollowProof: app.tiktokFollowProof,
        };
      }

      return extendedData;
    });

    // Response dengan pagination info
    const response: {
      applications: Record<string, unknown>[];
      pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    } = {
      applications: transformedApplications,
    };

    // Tambahkan pagination info jika bukan single item
    if (!applicationId) {
      // Get total count untuk pagination
      const { count: totalCount } = await supabase
        .from("applicants")
        .select("*", { count: "exact", head: true });

      response.pagination = {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
        hasNext: page * limit < (totalCount || 0),
        hasPrev: page > 1,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error memproses permintaan aplikasi:", error);
    return NextResponse.json(
      { error: "Gagal memproses permintaan aplikasi" },
      { status: 500 }
    );
  }
}

// Export protected GET handler
export const GET = withAuth(getApplications);
