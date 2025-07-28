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
            corelDraw: Boolean(app.corel_draw === 1 || app.corel_draw === true),
            photoshop: Boolean(app.photoshop === 1 || app.photoshop === true),
            adobePremierePro: Boolean(
              app.adobe_premiere_pro === 1 || app.adobe_premiere_pro === true
            ),
            adobeAfterEffect: Boolean(
              app.adobe_after_effect === 1 || app.adobe_after_effect === true
            ),
            autodeskEagle: Boolean(
              app.autodesk_eagle === 1 || app.autodesk_eagle === true
            ),
            arduinoIde: Boolean(
              app.arduino_ide === 1 || app.arduino_ide === true
            ),
            androidStudio: Boolean(
              app.android_studio === 1 || app.android_studio === true
            ),
            visualStudio: Boolean(
              app.visual_studio === 1 || app.visual_studio === true
            ),
            missionPlaner: Boolean(
              app.mission_planer === 1 || app.mission_planer === true
            ),
            autodeskInventor: Boolean(
              app.autodesk_inventor === 1 || app.autodesk_inventor === true
            ),
            autodeskAutocad: Boolean(
              app.autodesk_autocad === 1 || app.autodesk_autocad === true
            ),
            solidworks: Boolean(
              app.solidworks === 1 || app.solidworks === true
            ),
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
