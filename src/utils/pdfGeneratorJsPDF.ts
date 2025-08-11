import jsPDF from "jspdf";
import { ApplicationData } from "@/types";
import fs from "fs";
import path from "path";

/**
 * Generate a registration form PDF with letterhead using jsPDF
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

  // Margins
  const leftMargin = 20;
  const rightMargin = 20;
  const topMargin = 10;

  // Add letterhead image (smaller size)
  try {
    const imagePath = path.join(process.cwd(), "public", "kop surat.png");
    const imageData = fs.readFileSync(imagePath);
    const base64Image = Buffer.from(imageData).toString("base64");

    // Add the letterhead image at the top (smaller height)
    doc.addImage(
      `data:image/png;base64,${base64Image}`,
      "PNG",
      0,
      topMargin,
      210,
      40
    );
  } catch (error) {
    console.warn("Could not load letterhead image:", error);
    // Fallback header text if image fails
    doc.setFontSize(14);
    doc.text("UNIT KEGIATAN ROBOTIKA", 105, 20, { align: "center" });
    doc.text("UNIVERSITAS NEGERI PADANG", 105, 28, { align: "center" });
  }

  // Set Times New Roman font (or fallback to default)
  try {
    doc.setFont("times", "normal");
  } catch {
    // Fallback to default font if Times is not available
    doc.setFont("helvetica", "normal");
  }

  doc.setFontSize(12);

  // Add title with underline
  doc.setFontSize(14);
  doc.setFont("times", "bold");
  doc.text("FORMULIR PENDAFTARAN", 105, 55, { align: "center" });

  // Add underline for the title
  const titleWidth = doc.getTextWidth("FORMULIR PENDAFTARAN");
  doc.line(105 - titleWidth / 2, 57, 105 + titleWidth / 2, 57);

  // Reset to normal font
  doc.setFont("times", "normal");
  doc.setFontSize(12);

  // Starting position for form content
  let yPosition = 70;
  const lineHeight = 7;

  // Add pas foto from database if available
  console.log("Checking applicant photo field:", !!applicant.photo);
  console.log("Photo field type:", typeof applicant.photo);
  if (applicant.photo) {
    console.log("Photo data length:", applicant.photo.length);
    console.log("Photo data prefix:", applicant.photo.substring(0, 50));
  }

  if (applicant.photo && applicant.photo.trim() !== "") {
    try {
      console.log("Attempting to add photo to PDF");

      // Photo area on the right side (aligned with email field)
      const photoX = 150;
      const photoY = yPosition - 5;
      const photoWidth = 40;
      const photoHeight = 53;

      // Add photo from base64 data
      let photoData = applicant.photo.trim();

      // Ensure the photo data has the correct prefix
      if (!photoData.startsWith("data:")) {
        // If it doesn't have data URL prefix, add it
        photoData = `data:image/jpeg;base64,${photoData}`;
      }

      console.log("Final photo data prefix:", photoData.substring(0, 50));

      doc.addImage(photoData, "JPEG", photoX, photoY, photoWidth, photoHeight);
      console.log("Photo added successfully to PDF");

      // Add border around photo
      doc.rect(photoX, photoY, photoWidth, photoHeight);
    } catch (error) {
      console.error("Error adding photo to PDF:", error);
      // Fallback: draw photo placeholder
      const photoX = 150;
      const photoY = yPosition - 5;
      const photoWidth = 40;
      const photoHeight = 53;

      doc.rect(photoX, photoY, photoWidth, photoHeight);
      doc.setFontSize(10);
      doc.text(
        "Pas Foto",
        photoX + photoWidth / 2,
        photoY + photoHeight / 2 - 2,
        { align: "center" }
      );
      doc.text("3 x 4", photoX + photoWidth / 2, photoY + photoHeight / 2 + 3, {
        align: "center",
      });
      doc.setFontSize(12);
    }
  } else {
    console.log("No photo data found in applicant data");
    // Draw photo placeholder if no photo available
    const photoX = 150;
    const photoY = yPosition - 5;
    const photoWidth = 40;
    const photoHeight = 53;

    doc.rect(photoX, photoY, photoWidth, photoHeight);
    doc.setFontSize(10);
    doc.text(
      "Pas Foto",
      photoX + photoWidth / 2,
      photoY + photoHeight / 2 - 2,
      { align: "center" }
    );
    doc.text("3 x 4", photoX + photoWidth / 2, photoY + photoHeight / 2 + 3, {
      align: "center",
    });
    doc.setFontSize(12);
  }

  // Form fields with proper alignment and consistent spacing
  const labelWidth = 50; // Fixed width for labels

  // Helper function to add field with proper alignment and text wrapping
  const addField = (label: string, value: string, currentY: number) => {
    doc.text(label, leftMargin, currentY);
    doc.text(":", leftMargin + labelWidth, currentY);

    if (value && value.trim() !== "") {
      // Calculate available width for the value text
      const availableWidth = 210 - (leftMargin + labelWidth + 5) - rightMargin;

      // Split text to fit within the available width
      const textLines = doc.splitTextToSize(value, availableWidth);

      // Add each line of text
      for (let i = 0; i < textLines.length; i++) {
        doc.text(
          textLines[i],
          leftMargin + labelWidth + 5,
          currentY + i * lineHeight
        );
      }

      // Return position after all lines
      return currentY + textLines.length * lineHeight;
    } else {
      doc.text("-", leftMargin + labelWidth + 5, currentY);
      return currentY + lineHeight;
    }
  };

  // Form fields in the specified order
  yPosition = addField("Email", applicant.email || "", yPosition);
  yPosition = addField("Nama Lengkap", applicant.fullName || "", yPosition);
  yPosition = addField("Nama Panggilan", applicant.nickname || "", yPosition);

  const birthDate = applicant.birthDate
    ? new Date(applicant.birthDate).toLocaleDateString("id-ID")
    : "";
  yPosition = addField("Tanggal Lahir", birthDate, yPosition);

  // Map gender to Indonesian
  const genderMap: Record<string, string> = {
    LAKI_LAKI: "Laki-laki",
    PEREMPUAN: "Perempuan",
    MALE: "Laki-laki",
    FEMALE: "Perempuan",
  };
  const displayGender =
    genderMap[applicant.gender || ""] || applicant.gender || "";
  yPosition = addField("Jenis Kelamin", displayGender, yPosition);

  yPosition = addField("NIM", applicant.nim || "", yPosition);
  yPosition = addField("NIA", applicant.nia || "", yPosition);
  yPosition = addField(
    "Departemen/Prodi",
    applicant.studyProgram || "",
    yPosition
  );
  yPosition = addField("Fakultas", applicant.faculty || "", yPosition);
  yPosition = addField(
    "Sekolah Asal",
    applicant.previousSchool || "",
    yPosition
  );
  yPosition = addField(
    "Alamat di Padang",
    applicant.padangAddress || "",
    yPosition
  );
  yPosition = addField(
    "No HP/Whatsapp",
    applicant.phoneNumber || "",
    yPosition
  );

  // Add some space before software section
  yPosition += 3;

  // Software section with text wrapping
  doc.text("Software yang dikuasai", leftMargin, yPosition);
  doc.text(":", leftMargin + labelWidth, yPosition);

  if (applicant.software) {
    const softwareList = [];
    if (applicant.software.corelDraw) softwareList.push("CorelDraw");
    if (applicant.software.photoshop) softwareList.push("Photoshop");
    if (applicant.software.adobePremierePro)
      softwareList.push("Adobe Premiere Pro");
    if (applicant.software.adobeAfterEffect)
      softwareList.push("Adobe After Effect");
    if (applicant.software.autodeskEagle) softwareList.push("Autodesk Eagle");
    if (applicant.software.arduinoIde) softwareList.push("Arduino IDE");
    if (applicant.software.androidStudio) softwareList.push("Android Studio");
    if (applicant.software.visualStudio) softwareList.push("Visual Studio");
    if (applicant.software.missionPlaner) softwareList.push("Mission Planner");
    if (applicant.software.autodeskInventor)
      softwareList.push("Autodesk Inventor");
    if (applicant.software.autodeskAutocad)
      softwareList.push("Autodesk AutoCAD");
    if (applicant.software.solidworks) softwareList.push("SolidWorks");
    if (applicant.software.others) softwareList.push(applicant.software.others);

    const softwareText =
      softwareList.length > 0 ? softwareList.join(", ") : "Tidak ada";

    // Calculate available width for text (considering margins and label)
    const availableWidth = 210 - (leftMargin + labelWidth + 5) - rightMargin;

    // Split text to fit within the available width
    const textLines = doc.splitTextToSize(softwareText, availableWidth);

    // Add each line of text
    for (let i = 0; i < textLines.length; i++) {
      doc.text(
        textLines[i],
        leftMargin + labelWidth + 5,
        yPosition + i * lineHeight
      );
    }

    // Update yPosition based on number of lines used
    yPosition += textLines.length * lineHeight;
  } else {
    doc.text("Tidak ada", leftMargin + labelWidth + 5, yPosition);
    yPosition += lineHeight;
  }

  yPosition += 3;

  // Add text area sections with proper formatting, text wrapping, and page break handling
  const addTextArea = (label: string, content: string, currentY: number) => {
    // Check if we need a new page for the label
    if (currentY > 270) {
      doc.addPage();
      currentY = 30;
    }

    doc.text(label, leftMargin, currentY);
    currentY += lineHeight;

    if (content && content.trim() !== "") {
      const maxWidth = 210 - leftMargin - rightMargin;
      const lines = doc.splitTextToSize(content, maxWidth);

      // Calculate required height for the text
      const textHeight = lines.length * 4.5; // Slightly smaller line spacing for better fit
      const totalBoxHeight = textHeight + 4;

      // Check if the text box will fit on current page
      if (currentY + totalBoxHeight > 280) {
        doc.addPage();
        currentY = 30;

        // Re-add the label on the new page
        doc.text(label, leftMargin, currentY);
        currentY += lineHeight;
      }

      // Draw border around text with proper dimensions
      doc.rect(leftMargin, currentY - 3, maxWidth, totalBoxHeight);

      // Add text with proper line spacing
      for (let i = 0; i < lines.length; i++) {
        doc.text(lines[i], leftMargin + 2, currentY + 2 + i * 4.5);
      }

      currentY += totalBoxHeight + 8;
    } else {
      // Check if empty box will fit on current page
      if (currentY + 15 > 280) {
        doc.addPage();
        currentY = 30;

        // Re-add the label on the new page
        doc.text(label, leftMargin, currentY);
        currentY += lineHeight;
      }

      // Empty box with consistent width
      const boxWidth = 210 - leftMargin - rightMargin;
      doc.rect(leftMargin, currentY - 3, boxWidth, 15);
      currentY += 20;
    }

    return currentY;
  };

  // Text area sections
  yPosition = addTextArea(
    "Motivasi Bergabung dengan Robotik",
    applicant.motivation || "",
    yPosition
  );
  yPosition = addTextArea(
    "Rencana Setelah Bergabung di Robotik",
    applicant.futurePlans || "",
    yPosition
  );
  yPosition = addTextArea(
    "Alasan Anda Layak Diterima",
    applicant.whyYouShouldBeAccepted || "",
    yPosition
  );

  // Signature section at bottom right with proper page handling
  const submittedDate = applicant.submittedAt
    ? new Date(applicant.submittedAt).toLocaleDateString("id-ID")
    : new Date().toLocaleDateString("id-ID");

  // Ensure we have enough space for signature section (need at least 50mm)
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 30;
  } else if (yPosition < 200) {
    // Move to a reasonable position if we have too much space
    yPosition = 200;
  }

  // Add some space before signature
  yPosition += 10;

  // Signature area with proper alignment
  const signatureX = 140;
  doc.text(`Padang, ${submittedDate}`, signatureX, yPosition);
  yPosition += lineHeight * 6; // Space for actual signature

  doc.text(`(${applicant.fullName})`, signatureX, yPosition);

  // Convert to buffer
  const pdfData = doc.output("arraybuffer");
  return Buffer.from(pdfData);
}
