import { NextResponse } from "next/server";
import { pool } from "@/lib/mysql";
import { generateRegistrationConfirmation } from "@/utils/pdfGeneratorJsPDF";
import { ApplicationData } from "@/types";

export async function POST(request: Request) {
  try {
    const { email, birthDate } = await request.json();

    if (!email || !birthDate) {
      return NextResponse.json(
        { error: "Email and birth date are required" },
        { status: 400 }
      );
    }

    // Ambil data dari database
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        "SELECT * FROM applicants WHERE email = ? AND birth_date = ?",
        [email, birthDate]
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!rows || (rows as any[]).length === 0) {
        return NextResponse.json(
          { error: "Application not found or birth date doesn't match" },
          { status: 404 }
        );
      }

      // Format data untuk PDF generator
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const applicantData = (rows as unknown[])[0] as any;
      const formattedData: ApplicationData = {
        id: String(applicantData.id),
        email: applicantData.email || "",
        fullName: applicantData.full_name || "",
        nickname: applicantData.nickname,
        gender: applicantData.gender,
        birthDate: applicantData.birth_date,
        faculty: applicantData.faculty,
        department: applicantData.department,
        studyProgram: applicantData.study_program,
        nim: applicantData.nim,
        nia: applicantData.nia,
        previousSchool: applicantData.previous_school,
        padangAddress: applicantData.padang_address,
        phoneNumber: applicantData.phone_number,
        motivation: applicantData.motivation,
        futurePlans: applicantData.future_plans,
        whyYouShouldBeAccepted: applicantData.why_you_should_be_accepted,
        software: {
          corelDraw: Boolean(applicantData.corel_draw),
          photoshop: Boolean(applicantData.photoshop),
          adobePremierePro: Boolean(applicantData.adobe_premiere_pro),
          adobeAfterEffect: Boolean(applicantData.adobe_after_effect),
          autodeskEagle: Boolean(applicantData.autodesk_eagle),
          arduinoIde: Boolean(applicantData.arduino_ide),
          androidStudio: Boolean(applicantData.android_studio),
          visualStudio: Boolean(applicantData.visual_studio),
          missionPlaner: Boolean(applicantData.mission_planer),
          autodeskInventor: Boolean(applicantData.autodesk_inventor),
          autodeskAutocad: Boolean(applicantData.autodesk_autocad),
          solidworks: Boolean(applicantData.solidworks),
          others: applicantData.software_others || "",
        },
        studyPlanCard: applicantData.study_plan_card,
        igFollowProof: applicantData.ig_follow_proof,
        tiktokFollowProof: applicantData.tiktok_follow_proof,
        status: applicantData.status,
        submittedAt: applicantData.submitted_at,
        mbtiProof: applicantData.mbti_proof || "",
      };

      // Generate PDF
      const pdfBytes = await generateRegistrationConfirmation(formattedData);

      // Return PDF as response
      return new NextResponse(pdfBytes, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="formulir-pendaftaran-${formattedData.fullName.replace(
            /\s+/g,
            "-"
          )}.pdf"`,
        },
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
