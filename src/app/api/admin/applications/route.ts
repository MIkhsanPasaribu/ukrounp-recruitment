/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { pool } from "@/lib/mysql";

export async function GET() {
  try {
    // Fetch all applications using MySQL
    const connection = await pool.getConnection();
    try {
      const [applications] = await connection.query(
        "SELECT * FROM applicants ORDER BY submitted_at DESC"
      );

      // Transform the data to match the expected format
      const transformedApplications = ((applications as any[]) || []).map(
        (app) => ({
          id: app.id.toString(),
          email: app.email,
          fullName: app.full_name,
          nickname: app.nickname,
          gender: app.gender,
          birthDate: app.birth_date,
          faculty: app.faculty,
          department: app.department,
          studyProgram: app.study_program,
          nim: app.nim,
          nia: app.nia,
          previousSchool: app.previous_school,
          padangAddress: app.padang_address,
          phoneNumber: app.phone_number,
          motivation: app.motivation,
          futurePlans: app.future_plans,
          whyYouShouldBeAccepted: app.why_you_should_be_accepted,
          software: {
            corelDraw: app.corel_draw,
            photoshop: app.photoshop,
            adobePremierePro: app.adobe_premiere_pro,
            adobeAfterEffect: app.adobe_after_effect,
            autodeskEagle: app.autodesk_eagle,
            arduinoIde: app.arduino_ide,
            androidStudio: app.android_studio,
            visualStudio: app.visual_studio,
            missionPlaner: app.mission_planer,
            autodeskInventor: app.autodesk_inventor,
            autodeskAutocad: app.autodesk_autocad,
            solidworks: app.solidworks,
            others: app.other_software || "",
          },
          mbtiProof: app.mbti_proof,
          photo: app.photo,
          studentCard: app.student_card,
          studyPlanCard: app.study_plan_card,
          igFollowProof: app.ig_follow_proof,
          tiktokFollowProof: app.tiktok_follow_proof,
          status: app.status,
          submittedAt: app.submitted_at,
        })
      );

      return NextResponse.json({ applications: transformedApplications });
    } catch (error) {
      console.error("Error fetching applications:", error);
      return NextResponse.json(
        {
          error: "Failed to fetch applications",
          details: (error as Error).message,
        },
        { status: 500 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error processing applications request:", error);
    return NextResponse.json(
      { error: "Failed to process applications request" },
      { status: 500 }
    );
  }
}
