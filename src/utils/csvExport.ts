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
    "Payment Proof",
    "Photo",
    "Student Card",
    "Study Plan Card",
    "Instagram Follow Proof"
  ];

  // Create CSV content
  let csvContent = headers.join(",") + "\n";

  applications.forEach((app) => {
    // Format boolean values as "Yes" or "No"
    const formatBoolean = (value: boolean | undefined) => value ? "Yes" : "No";
    
    // Format date values
    const formatDate = (dateString: string | Date | undefined) => {
      if (!dateString) return "";
      return new Date(dateString).toLocaleString();
    };
    
    // Create a function to get file info
    const getFileInfo = (base64String: string | undefined) => {
      if (!base64String) return "Not provided";
      
      // For base64 data, return a placeholder indicating file exists
      if (base64String.startsWith("data:")) {
        return "File uploaded";
      }
      
      return "Not provided";
    };

    const row = [
      `"${app.email || ""}"`,
      `"${app.fullName || ""}"`,
      `"${app.nickname || ""}"`,
      `"${app.gender === 'male' ? 'Laki-laki' : app.gender === 'female' ? 'Perempuan' : ""}"`,
      `"${app.birthDate || ""}"`,
      `"${app.faculty || ""}"`,
      `"${app.department || ""}"`,
      `"${app.studyProgram || ""}"`,
      `"${app.nim || ""}"`,
      `"${app.nia || ""}"`,
      `"${app.previousSchool || ""}"`,
      `"${app.padangAddress || ""}"`,
      `"${app.phoneNumber || ""}"`,
      `"${app.status || "Under Review"}"`,
      `"${formatDate(app.submittedAt)}"`,
      `"${(app.motivation || "").replace(/"/g, '""')}"`, // Escape quotes in text fields
      `"${(app.futurePlans || "").replace(/"/g, '""')}"`,
      `"${(app.whyYouShouldBeAccepted || "").replace(/"/g, '""')}"`,
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
      `"${(app.software?.others || "").replace(/"/g, '""')}"`,
      // File references
      `"${getFileInfo(app.paymentProof)}"`,
      `"${getFileInfo(app.photo)}"`,
      `"${getFileInfo(app.studentCard)}"`,
      `"${getFileInfo(app.studyPlanCard)}"`,
      `"${getFileInfo(app.igFollowProof)}"`
    ];
    
    csvContent += row.join(",") + "\n";
  });

  // Create a download link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `applications_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};