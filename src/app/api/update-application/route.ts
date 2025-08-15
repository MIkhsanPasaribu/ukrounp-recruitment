/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PUT(request: NextRequest) {
  try {
    const requestData = await request.json();
    const { id, ...updateData } = requestData;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID aplikasi diperlukan" },
        { status: 400 }
      );
    }

    // Validasi data yang diperlukan
    const requiredFields = [
      "fullName",
      "email",
      "phoneNumber",
      "birthDate",
      "faculty",
      "department",
      "studyProgram",
      "nim",
      "nia",
    ];

    for (const field of requiredFields) {
      if (!updateData[field]) {
        return NextResponse.json(
          { success: false, message: `Field ${field} diperlukan` },
          { status: 400 }
        );
      }
    }

    // Cek apakah aplikasi dengan ID tersebut ada
    const { data: existingApplication, error: fetchError } = await supabase
      .from("applicants")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existingApplication) {
      return NextResponse.json(
        { success: false, message: "Aplikasi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Cek apakah email sudah digunakan oleh aplikasi lain
    if (updateData.email) {
      const { data: emailCheck, error: emailError } = await supabase
        .from("applicants")
        .select("id")
        .eq("email", updateData.email)
        .neq("id", id);

      if (emailError) {
        console.error("Error checking email:", emailError);
        return NextResponse.json(
          {
            success: false,
            message: "Terjadi kesalahan saat memverifikasi email",
          },
          { status: 500 }
        );
      }

      if (emailCheck && emailCheck.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Email sudah digunakan oleh pendaftar lain",
          },
          { status: 400 }
        );
      }
    }

    // Validasi jenjang pendidikan dan NIM
    if (updateData.educationLevel && updateData.nim) {
      const nimValidationResult = validateNimByEducationLevel(
        updateData.nim,
        updateData.educationLevel
      );
      if (nimValidationResult) {
        return NextResponse.json(
          { success: false, message: nimValidationResult },
          { status: 400 }
        );
      }
    }

    // Prepare update object dengan struktur yang benar
    const updateObject: any = {
      // Data pribadi
      fullName: updateData.fullName,
      email: updateData.email,
      phoneNumber: updateData.phoneNumber,
      birthDate: updateData.birthDate,
      nickname: updateData.nickname,
      gender: updateData.gender,

      // Data akademik
      faculty: updateData.faculty,
      department: updateData.department,
      studyProgram: updateData.studyProgram,
      nim: updateData.nim,
      nia: updateData.nia,
      educationLevel: updateData.educationLevel,
      previousSchool: updateData.previousSchool,
      padangAddress: updateData.padangAddress,

      // Motivasi
      motivation: updateData.motivation,
      futurePlans: updateData.futurePlans,
      whyYouShouldBeAccepted: updateData.whyYouShouldBeAccepted,

      // Software skills - individual boolean fields
      corelDraw:
        updateData.software?.corelDraw || updateData.corelDraw || false,
      photoshop:
        updateData.software?.photoshop || updateData.photoshop || false,
      adobePremierePro:
        updateData.software?.adobePremierePro ||
        updateData.adobePremierePro ||
        false,
      adobeAfterEffect:
        updateData.software?.adobeAfterEffect ||
        updateData.adobeAfterEffect ||
        false,
      autodeskEagle:
        updateData.software?.autodeskEagle || updateData.autodeskEagle || false,
      arduinoIde:
        updateData.software?.arduinoIde || updateData.arduinoIde || false,
      androidStudio:
        updateData.software?.androidStudio || updateData.androidStudio || false,
      visualStudio:
        updateData.software?.visualStudio || updateData.visualStudio || false,
      missionPlaner:
        updateData.software?.missionPlaner || updateData.missionPlaner || false,
      autodeskInventor:
        updateData.software?.autodeskInventor ||
        updateData.autodeskInventor ||
        false,
      autodeskAutocad:
        updateData.software?.autodeskAutocad ||
        updateData.autodeskAutocad ||
        false,
      solidworks:
        updateData.software?.solidworks || updateData.solidworks || false,
      otherSoftware:
        updateData.software?.others || updateData.otherSoftware || "",

      // File uploads
      mbtiProof: updateData.mbtiProof,
      photo: updateData.photo,
      studentCard: updateData.studentCard,
      studyPlanCard: updateData.studyPlanCard,
      igFollowProof: updateData.igFollowProof,
      tiktokFollowProof: updateData.tiktokFollowProof,
    };

    // Remove undefined values
    Object.keys(updateObject).forEach((key) => {
      if (updateObject[key] === undefined) {
        delete updateObject[key];
      }
    });

    console.log("Final update object:", JSON.stringify(updateObject, null, 2));

    // Update data aplikasi
    const { error: updateError } = await supabase
      .from("applicants")
      .update(updateObject)
      .eq("id", id);

    if (updateError) {
      console.error("Error updating application:", updateError);
      return NextResponse.json(
        { success: false, message: "Gagal memperbarui data aplikasi" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data aplikasi berhasil diperbarui",
    });
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// Fungsi validasi NIM berdasarkan jenjang pendidikan
function validateNimByEducationLevel(
  nim: string,
  educationLevel: string
): string | null {
  if (!nim || !educationLevel) return null;

  const nimPrefix = nim.substring(0, 2);

  if (educationLevel === "S1" || educationLevel === "D4") {
    if (nimPrefix !== "25" && nimPrefix !== "24") {
      return "Untuk Strata 1 (S1) dan Diploma 4 (D4) hanya mahasiswa tahun masuk 2024 dan 2025";
    }
  } else if (educationLevel === "D3") {
    if (nimPrefix !== "25") {
      return "Untuk Diploma 3 (D3) hanya mahasiswa tahun masuk 2025";
    }
  }

  if (nim.length < 8) {
    return "NIM harus minimal 8 digit";
  }

  return null;
}
