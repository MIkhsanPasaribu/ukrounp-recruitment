/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { pool } from "@/lib/mysql";
import { ApplicationData } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Prepare application data
    const applicationData = {
      email: body.email,
      full_name: body.fullName,
      nickname: body.nickname,
      gender:
        body.gender === "male"
          ? "LAKI_LAKI"
          : body.gender === "female"
          ? "PEREMPUAN"
          : body.gender,
      birth_date: body.birthDate,
      faculty: body.faculty,
      department: body.department,
      study_program: body.studyProgram,
      nim: body.nim,
      nia: body.nia,
      previous_school: body.previousSchool,
      padang_address: body.padangAddress,
      phone_number: body.phoneNumber,
      motivation: body.motivation,
      future_plans: body.futurePlans,
      why_you_should_be_accepted: body.whyYouShouldBeAccepted,

      // Software proficiency
      corel_draw: body.software?.corelDraw || false,
      photoshop: body.software?.photoshop || false,
      adobe_premiere_pro: body.software?.adobePremierePro || false,
      adobe_after_effect: body.software?.adobeAfterEffect || false,
      autodesk_eagle: body.software?.autodeskEagle || false,
      arduino_ide: body.software?.arduinoIde || false,
      android_studio: body.software?.androidStudio || false,
      visual_studio: body.software?.visualStudio || false,
      mission_planer: body.software?.missionPlaner || false,
      autodesk_inventor: body.software?.autodeskInventor || false,
      autodesk_autocad: body.software?.autodeskAutocad || false,
      solidworks: body.software?.solidworks || false,
      other_software: body.software?.others || null,

      // Document uploads
      mbti_proof: body.mbtiProof,
      photo: body.photo,
      student_card: body.studentCard,
      study_plan_card: body.studyPlanCard,
      ig_follow_proof: body.igFollowProof,
      tiktok_follow_proof: body.tiktokFollowProof,

      status: "SEDANG_DITINJAU",
    };

    // Insert data using MySQL
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        "INSERT INTO applicants SET ?",
        applicationData
      );

      // Get inserted ID
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const insertId = (result as any).insertId;

      // Hapus kode pengiriman email

      return NextResponse.json({
        success: true,
        message: "Application submitted successfully",
        id: insertId,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error inserting applicant:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit application",
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
