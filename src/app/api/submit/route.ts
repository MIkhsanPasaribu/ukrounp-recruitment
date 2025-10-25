/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { supabase, supabaseUntyped } from "@/lib/supabase";
import { ApplicationData } from "@/types";
import { ApplicantInsert } from "@/types/supabase";

interface InsertResult {
  id: string;
  [key: string]: unknown;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validasi email untuk mencegah duplikasi
    console.log("📧 Memeriksa email duplikasi untuk:", body.email);
    const { data: existingUser } = await supabase
      .from("applicants")
      .select("id, email")
      .eq("email", body.email)
      .single();

    if (existingUser) {
      console.log("❌ Email sudah terdaftar:", body.email);
      return NextResponse.json(
        {
          success: false,
          message:
            "Email sudah terdaftar. Silakan gunakan email lain atau periksa status aplikasi Anda.",
        },
        { status: 409 }
      );
    }

    // Siapkan data aplikasi
    const currentTime = new Date().toISOString();
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
      educationLevel: body.educationLevel,
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
      submittedAt: currentTime,
      updatedAt: currentTime,
    };

    // Pastikan id tidak dikirim untuk menggunakan UUID auto-generated
    const dataToInsert = { ...applicationData };
    delete dataToInsert.id; // Hapus id jika ada untuk memastikan auto-generation

    console.log("📝 Mengirimkan data aplikasi ke database...");
    console.log("🔍 Data yang akan dikirim (sample):", {
      email: dataToInsert.email,
      fullName: dataToInsert.fullName,
      hasId: "id" in dataToInsert,
      keysCount: Object.keys(dataToInsert).length,
    });

    // Buat object baru tanpa field id menggunakan destructuring yang aman
    const { id, ...cleanData } = dataToInsert as Record<string, unknown>;

    console.log("🔍 Debug: Object akan dikirim ke DB:", {
      hasIdProperty: "id" in cleanData,
      fieldCount: Object.keys(cleanData).length,
      sampleFields: Object.keys(cleanData).slice(0, 5),
    });

    // Masukkan data menggunakan Supabase untyped client dengan data yang bersih
    const { data, error } = await supabaseUntyped
      .from("applicants")
      .insert([cleanData]) // Array format untuk konsistensi
      .select("id");

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
      id:
        Array.isArray(data) && data.length > 0
          ? (data[0] as InsertResult)?.id
          : null,
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
