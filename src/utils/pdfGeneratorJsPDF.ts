import jsPDF from "jspdf";
import { ApplicationData } from "@/types";

/**
 * Generate a simple registration confirmation PDF using jsPDF
 * @param applicant The applicant data
 * @returns A Buffer containing the PDF document
 */
export async function generateRegistrationConfirmation(
  applicant: ApplicationData
): Promise<Buffer> {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Add header
  doc.setFontSize(18);
  doc.text("UNIT KEGIATAN ROBOTIKA", 105, 30, { align: "center" });

  doc.setFontSize(14);
  doc.text("UNIVERSITAS NEGERI PADANG", 105, 40, { align: "center" });

  // Add title
  doc.setFontSize(12);
  doc.text("SURAT KONFIRMASI PENDAFTARAN", 105, 55, { align: "center" });

  // Add applicant information
  let yPosition = 75;
  const lineHeight = 7;

  doc.setFontSize(10);
  doc.text(`Nama Lengkap: ${applicant.fullName}`, 20, yPosition);
  yPosition += lineHeight;

  doc.text(`Email: ${applicant.email}`, 20, yPosition);
  yPosition += lineHeight;

  if (applicant.nim) {
    doc.text(`NIM: ${applicant.nim}`, 20, yPosition);
    yPosition += lineHeight;
  }

  if (applicant.faculty) {
    doc.text(`Fakultas: ${applicant.faculty}`, 20, yPosition);
    yPosition += lineHeight;
  }

  if (applicant.department) {
    doc.text(`Jurusan: ${applicant.department}`, 20, yPosition);
    yPosition += lineHeight;
  }

  if (applicant.studyProgram) {
    doc.text(`Program Studi: ${applicant.studyProgram}`, 20, yPosition);
    yPosition += lineHeight;
  }

  doc.text(`Status: ${applicant.status}`, 20, yPosition);
  yPosition += lineHeight * 2;

  // Add submission date
  const submittedDate = applicant.submittedAt
    ? new Date(applicant.submittedAt).toLocaleDateString("id-ID")
    : "N/A";

  doc.text(`Tanggal Pendaftaran: ${submittedDate}`, 20, yPosition);
  yPosition += lineHeight * 3;

  // Add footer
  doc.setFontSize(8);
  doc.text("Surat ini adalah konfirmasi pendaftaran Anda.", 105, yPosition, {
    align: "center",
  });
  yPosition += lineHeight;

  doc.text(
    "Untuk informasi lebih lanjut, hubungi Unit Kegiatan Robotika UNP",
    105,
    yPosition,
    { align: "center" }
  );
  yPosition += lineHeight * 2;

  doc.text(
    "Unit Kegiatan Robotika - Universitas Negeri Padang",
    105,
    yPosition,
    { align: "center" }
  );

  // Convert to buffer
  const pdfData = doc.output("arraybuffer");
  return Buffer.from(pdfData);
}
