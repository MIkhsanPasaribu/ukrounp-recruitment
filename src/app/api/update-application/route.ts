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

    // Update data aplikasi
    const { error: updateError } = await supabase
      .from("applicants")
      .update({
        fullName: updateData.fullName,
        email: updateData.email,
        phoneNumber: updateData.phoneNumber,
        birthDate: updateData.birthDate,
        faculty: updateData.faculty,
        department: updateData.department,
        studyProgram: updateData.studyProgram,
        nim: updateData.nim,
        nia: updateData.nia,
        nickname: updateData.nickname,
        gender: updateData.gender,
        previousSchool: updateData.previousSchool,
        padangAddress: updateData.padangAddress,
        motivation: updateData.motivation,
        futurePlans: updateData.futurePlans,
        whyYouShouldBeAccepted: updateData.whyYouShouldBeAccepted,
        software: updateData.software,
        // File uploads
        mbtiProof: updateData.mbtiProof,
        photo: updateData.photo,
        studentCard: updateData.studentCard,
        studyPlanCard: updateData.studyPlanCard,
        igFollowProof: updateData.igFollowProof,
        tiktokFollowProof: updateData.tiktokFollowProof,
      })
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
