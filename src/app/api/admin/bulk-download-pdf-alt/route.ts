import { NextResponse } from "next/server";
import { pool } from "@/lib/mysql";
import { generateRegistrationConfirmation } from "@/utils/pdfGeneratorJsPDF";
import { ApplicationData } from "@/types";
import archiver from "archiver";

export async function GET() {
  try {
    // Ambil semua data dari database
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        "SELECT * FROM applicants ORDER BY submitted_at DESC"
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const applications = rows as any[];

      console.log(`Found ${applications.length} applications to process`);

      if (!applications || applications.length === 0) {
        return NextResponse.json(
          { error: "No applications found" },
          { status: 404 }
        );
      }

      // Create archive using archiver (as TAR format)
      const archive = archiver("zip", {
        zlib: { level: 9 }, // Maximum compression
      });

      const chunks: Buffer[] = [];

      // Collect chunks
      archive.on("data", (chunk) => {
        chunks.push(chunk);
      });

      // Process each application
      let processedCount = 0;
      for (const applicantData of applications) {
        try {
          console.log(
            `Processing application ${processedCount + 1}/${
              applications.length
            } - ID: ${applicantData.id}, Name: ${applicantData.full_name}`
          );

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
                applicantData.corel_draw === 1 ||
                  applicantData.corel_draw === true
              ),
              photoshop: Boolean(
                applicantData.photoshop === 1 ||
                  applicantData.photoshop === true
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
                applicantData.solidworks === 1 ||
                  applicantData.solidworks === true
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
          const pdfBuffer = await generateRegistrationConfirmation(
            formattedData
          );

          // Add PDF to archive with unique filename
          const cleanName = formattedData.fullName
            .replace(/[^a-zA-Z0-9\s]/g, "")
            .replace(/\s+/g, "-");
          const fileName = `formulir-pendaftaran-${cleanName}-ID${formattedData.id}.pdf`;

          archive.append(pdfBuffer, { name: fileName });
          processedCount++;
          console.log(`Successfully added PDF ${processedCount}: ${fileName}`);
        } catch (error) {
          console.error(
            `Error generating PDF for applicant ${applicantData.id}:`,
            error
          );
          // Continue with other applications
        }
      }

      console.log(`Total PDFs added to archive: ${processedCount}`);

      // Finalize archive
      await archive.finalize();

      // Wait for all chunks
      await new Promise((resolve) => {
        archive.on("end", resolve);
      });

      const archiveBuffer = Buffer.concat(chunks);
      console.log(
        `Archive buffer generated, size: ${archiveBuffer.length} bytes`
      );

      const currentDate = new Date().toISOString().split("T")[0];
      const fileName = `formulir-pendaftaran-ukro-${currentDate}-archiver.zip`;

      return new NextResponse(archiveBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error generating bulk PDF with archiver:", error);
    return NextResponse.json(
      { error: "Failed to generate bulk PDF with archiver" },
      { status: 500 }
    );
  }
}
