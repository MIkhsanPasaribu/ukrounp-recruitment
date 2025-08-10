import PDFDocument from "pdfkit";
import { ApplicationData } from "@/types";

/**
 * Generate a registration confirmation PDF for an applicant
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

      // Add header with logo
      doc
        .fontSize(18)
        .text("UNIT KEGIATAN ROBOTIKA", { align: "center" })
        .fontSize(16)
        .text("UNIVERSITAS NEGERI PADANG", { align: "center" })
        .moveDown(0.5);

      // Add a horizontal line
      doc
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .stroke()
        .moveDown(1);

      // Add title
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("BUKTI PENDAFTARAN", { align: "center" })
        .moveDown(1);

      // Add registration number and date
      const registrationNumber = `UKRO-${new Date().getFullYear()}-${String(
        applicant.id
      ).padStart(6, "0")}`;
      doc
        .fontSize(12)
        .font("Helvetica")
        .text(`Nomor Registrasi: ${registrationNumber}`, { align: "left" })
        .text(
          `Tanggal Pendaftaran: ${new Date(
            applicant.submittedAt || new Date()
          ).toLocaleDateString("id-ID")}`
        )
        .moveDown(1);

      // Add applicant information section
      doc
        .font("Helvetica-Bold")
        .text("DATA PENDAFTAR", { underline: true })
        .moveDown(0.5);

      // Add applicant details
      doc
        .font("Helvetica")
        .text(`Nama Lengkap: ${applicant.fullName}`)
        .text(`Email: ${applicant.email}`)
        .text(`NIM: ${applicant.nim}`)
        .text(`Fakultas: ${applicant.faculty}`)
        .text(`Jurusan: ${applicant.department}`)
        .text(`Program Studi: ${applicant.studyProgram}`)
        .text(`Nomor Telepon: ${applicant.phoneNumber}`)
        .moveDown(1.5);

      // Add confirmation message
      doc
        .font("Helvetica-Bold")
        .text("KONFIRMASI PENDAFTARAN", { underline: true })
        .moveDown(0.5);

      doc
        .font("Helvetica")
        .text(
          "Terimakasih telah mendaftar sebagai anggota Unit Kegiatan Robotika Universitas Negeri Padang. Pendaftaran Anda telah kami terima dan sedang dalam proses verifikasi.",
          { align: "justify" }
        )
        .moveDown(0.5)
        .text(
          "Silahkan simpan bukti pendaftaran ini sebagai referensi. Kami akan menghubungi Anda melalui email untuk proses selanjutnya.",
          { align: "justify" }
        )
        .moveDown(1.5);
      // Add footer
      doc
        .fontSize(10)
        .font("Helvetica-Oblique") // Using oblique (italic) font instead of italics option
        .text(
          "Bukti pendaftaran ini diterbitkan secara otomatis dan tidak memerlukan tanda tangan.",
          { align: "center" }
        )
        .moveDown(0.5)
        .font("Helvetica")
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
