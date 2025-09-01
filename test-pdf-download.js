// Test khusus untuk PDF download
// Jalankan di browser console setelah login sebagai interviewer

async function testPDFDownload() {
  console.log("🔥 TESTING PDF DOWNLOAD 🔥");
  console.log("=" * 50);

  try {
    // 1. Get list of available sessions
    console.log("\n📋 1. Getting available sessions...");
    const appsResponse = await fetch("/api/interview/applications");

    if (!appsResponse.ok) {
      console.log("❌ Cannot get applications");
      return;
    }

    const applications = await appsResponse.json();
    console.log("📊 Applications found:", applications.length);

    // Find application with session
    const appWithSession = applications.find((app) => app.sessionId);

    if (!appWithSession) {
      console.log("❌ No applications with sessions found");
      console.log("💡 Create a session first using the main test script");
      return;
    }

    const sessionId = appWithSession.sessionId;
    console.log("✅ Found session:", sessionId);
    console.log("👤 For applicant:", appWithSession.fullName);

    // 2. Test PDF download
    console.log("\n📄 2. Testing PDF download...");
    const pdfResponse = await fetch(`/api/interview/download-pdf/${sessionId}`);

    console.log("📊 PDF Response status:", pdfResponse.status);
    console.log(
      "📊 PDF Response headers:",
      Object.fromEntries(pdfResponse.headers.entries())
    );

    if (pdfResponse.ok) {
      console.log("✅ PDF download successful!");

      const blob = await pdfResponse.blob();
      console.log("📄 PDF details:", {
        size: blob.size + " bytes",
        type: blob.type,
        sizeKB: Math.round(blob.size / 1024) + " KB",
      });

      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `interview-result-${sessionId.substring(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log("📥 PDF download triggered!");
      console.log("💡 Check your Downloads folder for the PDF file");
    } else {
      const errorText = await pdfResponse.text();
      console.log("❌ PDF download failed:");
      console.log("📊 Error response:", errorText);

      try {
        const errorJson = JSON.parse(errorText);
        console.log("📊 Error details:", errorJson);
      } catch {
        console.log("📊 Raw error:", errorText);
      }
    }

    // 3. Test direct session check
    console.log("\n🔍 3. Testing session data access...");
    try {
      const formResponse = await fetch(
        `/api/interview/forms?sessionId=${sessionId}`
      );
      const formData = await formResponse.json();

      if (formData.success) {
        console.log("✅ Session data accessible");
        console.log("📊 Session details:", {
          hasSession: !!formData.data?.session,
          questionsCount: formData.data?.questions?.length || 0,
          sessionStatus: formData.data?.session?.status,
        });
      } else {
        console.log("❌ Cannot access session data:", formData.message);
      }
    } catch (error) {
      console.log("❌ Error accessing session:", error);
    }

    console.log("\n🎉 PDF DOWNLOAD TEST COMPLETED! 🎉");
  } catch (error) {
    console.error("❌ Test error:", error);
  }
}

// Helper function to test with specific session ID
async function testPDFWithSessionId(sessionId) {
  console.log(`🔥 TESTING PDF FOR SESSION: ${sessionId} 🔥`);

  try {
    const pdfResponse = await fetch(`/api/interview/download-pdf/${sessionId}`);
    console.log("📊 Status:", pdfResponse.status);

    if (pdfResponse.ok) {
      const blob = await pdfResponse.blob();
      console.log("✅ PDF generated:", blob.size, "bytes");

      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `test-interview-${sessionId.substring(0, 8)}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      console.log("📥 Download triggered!");
    } else {
      const error = await pdfResponse.text();
      console.log("❌ Error:", error);
    }
  } catch (error) {
    console.error("❌ Test error:", error);
  }
}

// Auto-run main test
testPDFDownload();

// Make helper function available globally
window.testPDFWithSessionId = testPDFWithSessionId;
