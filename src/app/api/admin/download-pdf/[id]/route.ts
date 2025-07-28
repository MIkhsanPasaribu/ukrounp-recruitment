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
          "Content-Disposition": `attachment; filename="Bukti_Pendaftaran_UKRO-${new Date().getFullYear()}-${String(
            id
          ).padStart(6, "0")}.pdf"`,
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
