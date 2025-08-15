/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withAuth } from "@/lib/auth-middleware";

async function getApplications(request: NextRequest) {
  try {
    // Cek apakah ada query parameter untuk ID spesifik
    const url = new URL(request.url);
    const applicationId = url.searchParams.get("id");

    let query = supabase.from("applicants").select("*");

    // Filter by ID jika disediakan
    if (applicationId) {
      query = query.eq("id", applicationId);
    }

    // Order by submittedAt untuk list semua aplikasi
    if (!applicationId) {
      query = query.order("submittedAt", { ascending: false });
    }

    const { data: applications, error } = await query;

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

    // Transform data untuk mencocokkan format yang diharapkan
    const transformedApplications = (applications || []).map((app) => ({
      id: app.id,
      email: app.email,
      fullName: app.fullName,
      nickname: app.nickname,
      gender: app.gender,
      birthDate: app.birthDate,
      faculty: app.faculty,
      department: app.department,
      studyProgram: app.studyProgram,
      educationLevel: app.educationLevel, // Tambahkan educationLevel yang hilang
      nim: app.nim,
      nia: app.nia,
      previousSchool: app.previousSchool,
      padangAddress: app.padangAddress,
      phoneNumber: app.phoneNumber,
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
      mbtiProof: app.mbtiProof,
      photo: app.photo,
      studentCard: app.studentCard,
      studyPlanCard: app.studyPlanCard,
      igFollowProof: app.igFollowProof,
      tiktokFollowProof: app.tiktokFollowProof,
      status: app.status,
      submittedAt: app.submittedAt,
    }));

    return NextResponse.json({ applications: transformedApplications });
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
