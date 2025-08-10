/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { ApplicationData } from "@/types";
import { ApplicantInsert } from "@/types/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Siapkan data aplikasi
    const applicationData: ApplicantInsert = {
      email: body.email,
      fullName: body.fullName,
      nickname: body.nickname,
      gender:
        body.gender === "male"
          ? "LAKI_LAKI"
          : body.gender === "female"
          ? "PEREMPUAN"
          : body.gender,
      birthDate: body.birthDate,
      faculty: body.faculty,
      department: body.department,
      studyProgram: body.studyProgram,
      nim: body.nim,
      nia: body.nia,
      previousSchool: body.previousSchool,
      padangAddress: body.padangAddress,
      phoneNumber: body.phoneNumber,
      motivation: body.motivation,
      futurePlans: body.futurePlans,
      whyYouShouldBeAccepted: body.whyYouShouldBeAccepted,

      // Kemahiran perangkat lunak
      corelDraw: body.software?.corelDraw || false,
      photoshop: body.software?.photoshop || false,
      adobePremierePro: body.software?.adobePremierePro || false,
      adobeAfterEffect: body.software?.adobeAfterEffect || false,
      autodeskEagle: body.software?.autodeskEagle || false,
      arduinoIde: body.software?.arduinoIde || false,
      androidStudio: body.software?.androidStudio || false,
      visualStudio: body.software?.visualStudio || false,
      missionPlaner: body.software?.missionPlaner || false,
      autodeskInventor: body.software?.autodeskInventor || false,
      autodeskAutocad: body.software?.autodeskAutocad || false,
      solidworks: body.software?.solidworks || false,
      otherSoftware: body.software?.others || null,

      // Unggahan dokumen
      mbtiProof: body.mbtiProof,
      photo: body.photo,
      studentCard: body.studentCard,
      studyPlanCard: body.studyPlanCard,
      igFollowProof: body.igFollowProof,
      tiktokFollowProof: body.tiktokFollowProof,

      status: "SEDANG_DITINJAU",
    };

    // Masukkan data menggunakan Supabase
    const { data, error } = await supabase
      .from("applicants")
      .insert([applicationData])
      .select("id")
      .single();

    if (error) {
      console.error("Error memasukkan pelamar:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengirimkan aplikasi",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Aplikasi berhasil dikirimkan",
      id: data?.id,
    });
  } catch (error) {
    console.error("Error memasukkan pelamar:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengirimkan aplikasi",
        error:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan yang tidak diketahui",
      },
      { status: 500 }
    );
  }
}
