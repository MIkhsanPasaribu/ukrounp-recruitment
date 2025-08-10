import PDFDocument from "pdfkit";
import { ApplicationData } from "@/types";

/**
 * Generate a simple registration confirmation PDF for an applicant
 * @param applicant The applicant data
 * @returns A Buffer containing the PDF document
 */
export async function generateRegistrationConfirmation(
  applicant: ApplicationData
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Create a simplified PDF document without custom fonts
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        info: {
          Title: "UKRO UNP Registration Confirmation",
          Author: "UKRO UNP",
        },
      });

      // Create a buffer to store the PDF
      const chunks: Buffer[] = [];

      // Collect data chunks
      doc.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      // When the document is finished, resolve with the complete buffer
      doc.on("end", () => {
        const result = Buffer.concat(chunks);
        resolve(result);
      });

      // Add header
      doc
        .fontSize(18)
        .text("UNIT KEGIATAN ROBOTIKA", { align: "center" })
        .fontSize(16)
        .text("UNIVERSITAS NEGERI PADANG", { align: "center" })
        .moveDown(1);

      // Add title
      doc
        .fontSize(14)
        .text("SURAT KONFIRMASI PENDAFTARAN", { align: "center" })
        .moveDown(1);

      // Add applicant information
      doc
        .fontSize(12)
        .text(`Nama Lengkap: ${applicant.fullName}`)
        .text(`Email: ${applicant.email}`)
        .text(`NIM: ${applicant.nim || "N/A"}`)
        .text(`Fakultas: ${applicant.faculty || "N/A"}`)
        .text(`Jurusan: ${applicant.department || "N/A"}`)
        .text(`Program Studi: ${applicant.studyProgram || "N/A"}`)
        .text(`Status: ${applicant.status}`)
        .moveDown(1);

      // Add submission date
      const submittedDate = applicant.submittedAt
        ? new Date(applicant.submittedAt).toLocaleDateString("id-ID")
        : "N/A";

      doc.text(`Tanggal Pendaftaran: ${submittedDate}`).moveDown(2);

      // Add footer
      doc
        .fontSize(10)
        .text("Surat ini adalah konfirmasi pendaftaran Anda.", {
          align: "center",
        })
        .text(
          "Untuk informasi lebih lanjut, hubungi Unit Kegiatan Robotika UNP",
          { align: "center" }
        )
        .moveDown(1)
        .text("Unit Kegiatan Robotika - Universitas Negeri Padang", {
          align: "center",
        });

      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
