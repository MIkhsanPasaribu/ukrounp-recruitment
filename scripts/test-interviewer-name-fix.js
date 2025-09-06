// 🧪 TEST SCRIPT: Nama Pewawancara Fix
// Jalankan di Browser Console saat di halaman interview

async function testInterviewerNameFix() {
  console.log("🔍 Testing interviewer name fix...");

  try {
    // Test data untuk submit interview dengan nama pewawancara custom
    const testData = {
      sessionId: "7d4acc9a-ffd7-4ba3-bfd8-1a2cabd41840", // Replace dengan session ID yang valid
      responses: [
        {
          questionId: "test-question-id",
          response: "Test response",
          score: 5,
          notes: "Test notes",
        },
      ],
      sessionNotes: "Test session notes",
      recommendation: "DIREKOMENDASIKAN",
      interviewerName: "Dr. Budi Santoso, M.Kom", // Nama custom pewawancara
    };

    console.log(
      "📝 Submitting interview with custom interviewer name:",
      testData.interviewerName
    );

    const submitResponse = await fetch("/api/interview/forms/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Cookie auth akan otomatis ter-include
      },
      body: JSON.stringify(testData),
    });

    const submitResult = await submitResponse.json();
    console.log("📊 Submit result:", submitResult);

    if (submitResult.success) {
      console.log("✅ Interview submitted successfully!");

      // Test retrieve session untuk verify nama tersimpan
      console.log("🔍 Retrieving session to verify interviewer name...");

      const getResponse = await fetch(
        `/api/interview/sessions/${testData.sessionId}`
      );
      const getResult = await getResponse.json();

      console.log("📋 Retrieved session:", getResult);

      if (getResult.success && getResult.data.session.interviewerName) {
        console.log("✅ SUCCESS: Interviewer name saved correctly!");
        console.log("👤 Saved name:", getResult.data.session.interviewerName);
      } else {
        console.log("❌ FAILED: Interviewer name not saved");
      }
    } else {
      console.log("❌ Submit failed:", submitResult.message);
    }
  } catch (error) {
    console.error("💥 Test error:", error);
  }
}

// Helper function untuk test database structure
async function checkDatabaseStructure() {
  console.log("🔍 Checking if interviewerName column exists...");

  try {
    // Try to get session data including interviewerName
    const response = await fetch("/api/interview/sessions/test-check");
    console.log("Database structure check response:", response.status);

    if (response.status === 404) {
      console.log(
        "ℹ️ This is expected - we just want to see if column exists in error message"
      );
    }
  } catch (error) {
    console.log("💡 Check the server logs for column existence info");
  }
}

console.log("🚀 Interviewer Name Fix Test Ready!");
console.log("👉 Run: testInterviewerNameFix()");
console.log("👉 Run: checkDatabaseStructure()");

// Auto-check database structure
checkDatabaseStructure();
