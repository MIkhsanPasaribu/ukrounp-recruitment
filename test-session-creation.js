// Test script untuk debug session creation
// Buka browser console dan paste script ini

async function testSessionCreation() {
  console.log("🔥 Testing session creation...");

  try {
    // Test dengan applicant ID yang ada
    const applicantId = "018d8e74-b9b0-7f89-8c9e-9b8a7f6e5d4c"; // Ganti dengan ID yang valid

    const response = await fetch("/api/interview/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        applicantId: applicantId,
      }),
    });

    console.log("📊 Response status:", response.status);
    console.log(
      "📊 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const result = await response.text();
    console.log("📊 Raw response:", result);

    try {
      const jsonResult = JSON.parse(result);
      console.log("✅ JSON response:", jsonResult);
    } catch (e) {
      console.log("❌ Response is not JSON:", result);
    }
  } catch (error) {
    console.error("❌ Network error:", error);
  }
}

// Fungsi untuk test dengan data yang berbeda
async function testWithDifferentApplicant() {
  console.log("🔥 Testing with different applicant...");

  // Ambil daftar applicants yang ada
  try {
    const response = await fetch("/api/interview/applications");
    const applications = await response.json();

    console.log("📋 Available applications:", applications);

    if (applications.length > 0) {
      const firstApp = applications[0];
      console.log("🎯 Testing with applicant:", firstApp);

      // Test session creation
      const sessionResponse = await fetch("/api/interview/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicantId: firstApp.id,
        }),
      });

      const sessionResult = await sessionResponse.text();
      console.log("📊 Session creation result:", sessionResult);

      try {
        const jsonResult = JSON.parse(sessionResult);
        console.log("✅ Session created:", jsonResult);
      } catch (e) {
        console.log("❌ Session creation failed:", sessionResult);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Auto-run test
testWithDifferentApplicant();
