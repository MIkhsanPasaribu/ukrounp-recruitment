// Test lengkap untuk interview system setelah fix
// Jalankan di browser console setelah login sebagai interviewer

async function testCompleteInterviewFlow() {
  console.log("🔥 TESTING COMPLETE INTERVIEW FLOW 🔥");
  console.log("=" * 50);

  try {
    // 1. Test get applications/candidates
    console.log("\n📋 1. Testing get applications...");
    const appsResponse = await fetch("/api/interview/applications");
    console.log("📊 Applications status:", appsResponse.status);

    if (!appsResponse.ok) {
      const errorText = await appsResponse.text();
      console.log("❌ Applications failed:", errorText);
      return;
    }

    const applications = await appsResponse.json();
    console.log("✅ Applications loaded:", applications.length);

    if (applications.length === 0) {
      console.log("❌ No applications found - cannot test further");
      return;
    }

    const firstApp = applications[0];
    console.log("🎯 Using first application:", {
      id: firstApp.id,
      name: firstApp.fullName,
      nim: firstApp.nim,
      hasSession: !!firstApp.sessionId,
    });

    let sessionId = firstApp.sessionId;

    // 2. Create session if not exists
    if (!sessionId) {
      console.log("\n🗓️ 2. Creating interview session...");
      const sessionResponse = await fetch("/api/interview/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantId: firstApp.id,
          interviewDate: new Date().toISOString(),
          location: "Online Test",
          notes: "Test session",
        }),
      });

      console.log("📊 Session creation status:", sessionResponse.status);
      const sessionResult = await sessionResponse.json();
      console.log("📊 Session result:", sessionResult);

      if (sessionResult.success) {
        sessionId = sessionResult.data.id;
        console.log("✅ Session created:", sessionId);
      } else {
        console.log("❌ Session creation failed:", sessionResult.message);
        return;
      }
    } else {
      console.log("✅ Using existing session:", sessionId);
    }

    // 3. Test get interview form
    console.log("\n📝 3. Testing interview form loading...");
    const formResponse = await fetch(
      `/api/interview/forms?sessionId=${sessionId}`
    );
    console.log("📊 Form loading status:", formResponse.status);

    if (!formResponse.ok) {
      const errorText = await formResponse.text();
      console.log("❌ Form loading failed:", errorText);
      return;
    }

    const formData = await formResponse.json();
    console.log("✅ Form loaded successfully:", {
      questionsCount: formData.data?.questions?.length || 0,
      hasSession: !!formData.data?.session,
      totalQuestions: formData.data?.totalQuestions,
    });

    if (formData.data?.questions?.length > 0) {
      console.log("📝 First question:", {
        number: formData.data.questions[0].question?.questionNumber,
        text:
          formData.data.questions[0].question?.questionText?.substring(0, 50) +
          "...",
        category: formData.data.questions[0].question?.category,
      });
    }

    // 4. Test submit interview form
    console.log("\n💾 4. Testing interview form submission...");
    const responses = formData.data.questions.map((q, index) => ({
      questionId: q.question.id,
      response: `Test response for question ${index + 1}`,
      score: Math.ceil(Math.random() * 5), // Random score 1-5
      notes: `Test notes ${index + 1}`,
    }));

    const submitResponse = await fetch("/api/interview/forms/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: sessionId,
        responses: responses,
        sessionNotes: "Test interview completed successfully",
        recommendation: "Test recommendation",
        interviewerName: "Test Interviewer",
      }),
    });

    console.log("📊 Submit status:", submitResponse.status);
    const submitResult = await submitResponse.json();
    console.log("📊 Submit result:", submitResult);

    if (submitResult.success) {
      console.log("✅ Interview submitted successfully!");
      console.log("📊 Results:", {
        totalScore: submitResult.data?.totalScore,
        maxScore: submitResult.data?.maxScore,
        averageScore: submitResult.data?.averageScore,
        responseCount: submitResult.data?.responseCount,
      });
    } else {
      console.log("❌ Submit failed:", submitResult.message);
      return;
    }

    // 5. Test PDF download
    console.log("\n📄 5. Testing PDF download...");
    const pdfResponse = await fetch(`/api/interview/download-pdf/${sessionId}`);
    console.log("📊 PDF download status:", pdfResponse.status);

    if (pdfResponse.ok) {
      console.log("✅ PDF download successful!");
      const blob = await pdfResponse.blob();
      console.log("📄 PDF size:", blob.size, "bytes");

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `interview-result-${sessionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      console.log("📥 PDF download triggered!");
    } else {
      const pdfError = await pdfResponse.text();
      console.log("❌ PDF download failed:", pdfError);
    }

    console.log("\n🎉 COMPLETE INTERVIEW FLOW TEST FINISHED! 🎉");
  } catch (error) {
    console.error("❌ Test error:", error);
  }
}

// Auto-run test
testCompleteInterviewFlow();
