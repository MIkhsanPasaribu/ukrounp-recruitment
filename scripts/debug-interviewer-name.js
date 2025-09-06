/**
 * Test script untuk verifikasi fix nama pewawancara saat edit
 *
 * Jalankan di browser console untuk testing nama pewawancara
 */

async function debugInterviewerName() {
  console.log("🔍 DEBUGGING INTERVIEWER NAME ISSUE 🔍");
  console.log("=".repeat(60));

  try {
    // Get token
    const token =
      localStorage.getItem("interviewerToken") ||
      sessionStorage.getItem("interviewerToken");

    if (!token) {
      console.error("❌ No interviewer token found. Please login first.");
      return;
    }

    // 1. Test interview history API
    console.log("\n1️⃣ Testing Interview History API...");
    const historyResponse = await fetch(
      "/api/interview/history?page=1&limit=5&status=all",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (historyResponse.ok) {
      const historyData = await historyResponse.json();
      console.log("✅ History API Response:", {
        sessionsCount: historyData.data?.length || 0,
        summary: historyData.summary,
      });

      if (historyData.data && historyData.data.length > 0) {
        const firstSession = historyData.data[0];
        console.log("📝 First Session Data:", {
          id: firstSession.id,
          status: firstSession.status,
          interviewerName: firstSession.interviewerName || "❌ NOT SET",
          totalScore: firstSession.totalScore,
          recommendation: firstSession.recommendation,
          hasApplicant: !!firstSession.applicants,
          applicantName: firstSession.applicants?.fullName,
        });

        // 2. Test session detail API
        console.log("\n2️⃣ Testing Session Detail API...");
        const sessionDetailResponse = await fetch(
          `/api/interview/sessions/${firstSession.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (sessionDetailResponse.ok) {
          const sessionDetailData = await sessionDetailResponse.json();
          const session = sessionDetailData.data?.session;
          console.log("✅ Session Detail Response:", {
            id: session?.id,
            interviewerName: session?.interviewerName || "❌ NOT SET",
            status: session?.status,
            totalScore: session?.totalScore,
            recommendation: session?.recommendation,
          });

          // 3. Test PDF generation
          console.log("\n3️⃣ Testing PDF Generation...");
          const pdfResponse = await fetch(
            `/api/interview/download-pdf/${firstSession.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log("📊 PDF Response Status:", pdfResponse.status);
          if (pdfResponse.ok) {
            console.log("✅ PDF generation successful");
            const contentType = pdfResponse.headers.get("Content-Type");
            console.log("📄 Content Type:", contentType);
          } else {
            const pdfError = await pdfResponse.json();
            console.error("❌ PDF generation failed:", pdfError);
          }

          return {
            success: true,
            sessionId: firstSession.id,
            interviewerNameInHistory: firstSession.interviewerName,
            interviewerNameInDetail: session?.interviewerName,
            status: firstSession.status,
          };
        } else {
          const sessionError = await sessionDetailResponse.json();
          console.error("❌ Session detail error:", sessionError);
        }
      } else {
        console.log("ℹ️ No sessions found in history");
      }
    } else {
      const historyError = await historyResponse.json();
      console.error("❌ History API error:", historyError);
    }
  } catch (error) {
    console.error("❌ Debug error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Helper function to check form data
function checkFormData() {
  console.log("\n🔍 CHECKING FORM DATA ON CURRENT PAGE");

  // Check if we're on interview form page
  const interviewerNameInput = document.querySelector(
    'input[placeholder*="nama"], input[name*="interviewer"]'
  );
  const formInputs = document.querySelectorAll("input, textarea");

  console.log("📝 Form inputs found:", formInputs.length);
  console.log(
    "👤 Interviewer name input:",
    interviewerNameInput ? "Found" : "Not found"
  );

  if (interviewerNameInput) {
    console.log(
      "💡 Current interviewer name value:",
      interviewerNameInput.value
    );
  }

  // Check for session data
  const sessionElement = document.querySelector("[data-session-id]");
  if (sessionElement) {
    console.log(
      "📋 Session ID found:",
      sessionElement.getAttribute("data-session-id")
    );
  }

  return {
    hasForm: formInputs.length > 0,
    hasInterviewerNameInput: !!interviewerNameInput,
    currentValue: interviewerNameInput?.value || null,
    sessionId: sessionElement?.getAttribute("data-session-id") || null,
  };
}

// Auto-run functions
console.log("🚀 Starting interviewer name debug...");
debugInterviewerName().then((result) => {
  console.log("\n🎯 Debug completed:", result);
});

const formData = checkFormData();
console.log("\n📋 Form data check:", formData);

console.log("\n📚 Interviewer Name Debug Script loaded");
console.log("📝 Manual usage: debugInterviewerName()");
console.log("📝 Check form: checkFormData()");
