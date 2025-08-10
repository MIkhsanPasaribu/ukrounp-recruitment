import { ApplicationData } from "@/types";

/**
 * Exports application data to CSV format with complete information
 * @param applications Array of application data to export
 * @returns CSV file download
 */
export const exportApplicationsToCSV = (applications: ApplicationData[]) => {
  if (applications.length === 0) return;

  // Define the headers - comprehensive list of all fields
  const headers = [
    "Email",
    "Full Name",
    "Nickname",
    "Gender",
    "Birth Date",
    "Faculty",
    "Department",
    "Study Program",
    "NIM",
    "NIA",
    "Previous School",
    "Padang Address",
    "Phone Number",
    "Status",
    "Submitted At",
    "Motivation",
    "Future Plans",
    "Why Should Be Accepted",
    // Software skills
    "CorelDraw",
    "Photoshop",
    "Adobe Premiere Pro",
    "Adobe After Effect",
    "Autodesk Eagle",
    "Arduino IDE",
    "Android Studio",
    "Visual Studio",
    "Mission Planer",
    "Autodesk Inventor",
    "Autodesk Autocad",
    "Solidworks",
    "Other Software",
    // File references
    "MBTI Test Proof",
    "Photo",
    "Student Card",
    "Study Plan Card",
    "Instagram Follow Proof",
  ];

  // Create CSV content with proper escaping for Excel compatibility
  let csvContent = "\uFEFF"; // Add BOM for Excel to recognize UTF-8
  csvContent += headers.join(",") + "\r\n"; // Use standard CSV format

  applications.forEach((app) => {
    // Format boolean values as "Yes" or "No"
    const formatBoolean = (value: boolean | undefined) =>
      value ? "Ya" : "Tidak";

    // Format date values
    const formatDate = (dateString: string | Date | undefined) => {
      if (!dateString) return "";
      return new Date(dateString).toLocaleString("id-ID");
    };

    // Create a function to get file info
    const getFileInfo = (base64String: string | undefined) => {
      if (!base64String) return "Tidak ada";

      // For base64 data, return a placeholder indicating file exists
      if (base64String.startsWith("data:")) {
        return "File terunggah";
      }

      return "Tidak ada";
    };

    // Properly escape text fields to prevent CSV formatting issues
    const escapeField = (field: string | undefined) => {
      if (!field) return "";
      // For CSV, we need to wrap fields in quotes and escape any quotes inside
      const escaped = field.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const row = [
      escapeField(app.email),
      escapeField(app.fullName),
      escapeField(app.nickname),
      `"${
        app.gender === "LAKI_LAKI"
          ? "Laki-laki"
          : app.gender === "PEREMPUAN"
          ? "Perempuan"
          : app.gender === "MALE"
          ? "Laki-laki"
          : app.gender === "FEMALE"
          ? "Perempuan"
          : ""
      }"`,
      `"${app.birthDate || ""}"`,
      escapeField(app.faculty),
      escapeField(app.department),
      escapeField(app.studyProgram),
      escapeField(app.nim),
      escapeField(app.nia),
      escapeField(app.previousSchool),
      escapeField(app.padangAddress),
      escapeField(app.phoneNumber),
      escapeField(app.status || "Under Review"),
      `"${formatDate(app.submittedAt)}"`,
      escapeField(app.motivation),
      escapeField(app.futurePlans),
      escapeField(app.whyYouShouldBeAccepted),
      // Software skills
      `"${formatBoolean(app.software?.corelDraw)}"`,
      `"${formatBoolean(app.software?.photoshop)}"`,
      `"${formatBoolean(app.software?.adobePremierePro)}"`,
      `"${formatBoolean(app.software?.adobeAfterEffect)}"`,
      `"${formatBoolean(app.software?.autodeskEagle)}"`,
      `"${formatBoolean(app.software?.arduinoIde)}"`,
      `"${formatBoolean(app.software?.androidStudio)}"`,
      `"${formatBoolean(app.software?.visualStudio)}"`,
      `"${formatBoolean(app.software?.missionPlaner)}"`,
      `"${formatBoolean(app.software?.autodeskInventor)}"`,
      `"${formatBoolean(app.software?.autodeskAutocad)}"`,
      `"${formatBoolean(app.software?.solidworks)}"`,
      escapeField(app.software?.others),
      // File references
      `"${getFileInfo(app.mbtiProof)}"`,
      `"${getFileInfo(app.photo)}"`,
      `"${getFileInfo(app.studentCard)}"`,
      `"${getFileInfo(app.studyPlanCard)}"`,
      `"${getFileInfo(app.igFollowProof)}"`,
    ];

    csvContent += row.join(",") + "\r\n";
  });

  // Create a download link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `pendaftaran_ukro_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
