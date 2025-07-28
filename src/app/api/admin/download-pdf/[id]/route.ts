import { NextResponse } from "next/server";
import { pool } from "@/lib/mysql";
import { generateRegistrationConfirmation } from "@/utils/pdfGeneratorJsPDF";
import { ApplicationData } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Ambil data dari database
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        "SELECT * FROM applicants WHERE id = ?",
        [id]
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!rows || (rows as any[]).length === 0) {
        return NextResponse.json(
          { error: "Applicant not found" },
          { status: 404 }
        );
      }

      // Format data untuk PDF generator
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const applicantData = (rows as unknown[])[0] as any;

      // Debug: Check if photo exists in database
      console.log("=== DATABASE DEBUG ===");
      console.log("Photo field exists:", !!applicantData.photo);
      console.log("Photo length:", applicantData.photo?.length || 0);
      console.log(
        "Photo starts with data:",
        applicantData.photo?.startsWith("data:") || false
      );
      console.log("====================");

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
          corelDraw: Boolean(
            applicantData.corel_draw === 1 || applicantData.corel_draw === true
          ),
          photoshop: Boolean(
            applicantData.photoshop === 1 || applicantData.photoshop === true
          ),
          adobePremierePro: Boolean(
            applicantData.adobe_premiere_pro === 1 ||
              applicantData.adobe_premiere_pro === true
          ),
          adobeAfterEffect: Boolean(
            applicantData.adobe_after_effect === 1 ||
              applicantData.adobe_after_effect === true
          ),
          autodeskEagle: Boolean(
            applicantData.autodesk_eagle === 1 ||
              applicantData.autodesk_eagle === true
          ),
          arduinoIde: Boolean(
            applicantData.arduino_ide === 1 ||
              applicantData.arduino_ide === true
          ),
          androidStudio: Boolean(
            applicantData.android_studio === 1 ||
              applicantData.android_studio === true
          ),
          visualStudio: Boolean(
            applicantData.visual_studio === 1 ||
              applicantData.visual_studio === true
          ),
          missionPlaner: Boolean(
            applicantData.mission_planer === 1 ||
              applicantData.mission_planer === true
          ),
          autodeskInventor: Boolean(
            applicantData.autodesk_inventor === 1 ||
              applicantData.autodesk_inventor === true
          ),
          autodeskAutocad: Boolean(
            applicantData.autodesk_autocad === 1 ||
              applicantData.autodesk_autocad === true
          ),
          solidworks: Boolean(
            applicantData.solidworks === 1 || applicantData.solidworks === true
          ),
          others: applicantData.other_software || "",
        },
        mbtiProof: applicantData.mbti_proof,
        photo: applicantData.photo,
        studentCard: applicantData.student_card,
        studyPlanCard: applicantData.study_plan_card,
        igFollowProof: applicantData.ig_follow_proof,
        tiktokFollowProof: applicantData.tiktok_follow_proof,
        status: applicantData.status,
        submittedAt: applicantData.submitted_at,
      };

      // Generate PDF
      const pdfBuffer = await generateRegistrationConfirmation(formattedData);

      // Return PDF sebagai response
      return new NextResponse(pdfBuffer, {
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
