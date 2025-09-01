// Test khusus untuk submit interview form
// Jalankan di browser console setelah login sebagai interviewer

async function testSubmitInterviewForm() {
  console.log("🔥 TESTING SUBMIT INTERVIEW FORM 🔥");
  console.log("=" * 50);

  try {
    // 1. Get available sessions
    console.log("\n📋 1. Getting available sessions...");
    const appsResponse = await fetch("/api/interview/applications");

    if (!appsResponse.ok) {
      console.log("❌ Cannot get applications");
      return;
    }

    const applications = await appsResponse.json();
    console.log("📊 Applications found:", applications.length);

    // Find or create session
    let sessionId;
    let appWithSession = applications.find((app) => app.sessionId);

    if (!appWithSession && applications.length > 0) {
      // Create session for first application
      console.log("\n🗓️ Creating session for testing...");
      const firstApp = applications[0];

      const sessionResponse = await fetch("/api/interview/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantId: firstApp.id,
          interviewDate: new Date().toISOString(),
          location: "Test Submit Location",
          notes: "Test session for submit testing",
        }),
      });

      const sessionResult = await sessionResponse.json();
      if (sessionResult.success) {
        sessionId = sessionResult.data.id;
        console.log("✅ Session created:", sessionId);
      } else {
        console.log("❌ Session creation failed:", sessionResult.message);
        return;
      }
    } else if (appWithSession) {
      sessionId = appWithSession.sessionId;
      console.log("✅ Using existing session:", sessionId);
    } else {
      console.log("❌ No applications available for testing");
      return;
    }

    // 2. Get interview form questions
    console.log("\n📝 2. Getting interview questions...");
    const formResponse = await fetch(
      `/api/interview/forms?sessionId=${sessionId}`
    );

    if (!formResponse.ok) {
      console.log("❌ Cannot get interview form");
      return;
    }

    const formData = await formResponse.json();
    console.log("✅ Form loaded:", {
      questionsCount: formData.data?.questions?.length || 0,
      hasSession: !!formData.data?.session,
    });

    if (!formData.data?.questions || formData.data.questions.length === 0) {
      console.log("❌ No questions available");
      return;
    }

    // 3. Prepare test responses
    console.log("\n📊 3. Preparing test responses...");
    const responses = formData.data.questions.map((q, index) => ({
      questionId: q.question.id,
      response: `Test jawaban untuk pertanyaan ${
        index + 1
      }: ${q.question.questionText?.substring(0, 30)}...`,
      score: Math.ceil(Math.random() * 5), // Random score 1-5
      notes: `Test catatan untuk question ${index + 1}`,
    }));

    console.log("📊 Test responses prepared:", {
      count: responses.length,
      firstResponse: responses[0],
      scores: responses.map((r) => r.score),
    });

    // 4. Test submit with different scenarios
    const testScenarios = [
      {
        name: "Complete Submit",
        data: {
          sessionId,
          responses,
          sessionNotes:
            "Test interview completed successfully. All questions answered.",
          recommendation: "Test recommendation from interviewer",
        },
      },
      {
        name: "Submit with Missing Notes",
        data: {
          sessionId,
          responses: responses.slice(0, 3), // Only first 3 responses
          sessionNotes: "",
          recommendation: "",
        },
      },
      {
        name: "Submit with Zero Scores",
        data: {
          sessionId,
          responses: responses.map((r) => ({ ...r, score: 0 })),
          sessionNotes: "Test with zero scores",
          recommendation: "Test zero score scenario",
        },
      },
    ];

    for (const scenario of testScenarios) {
      console.log(
        `\n💾 4.${testScenarios.indexOf(scenario) + 1}. Testing: ${
          scenario.name
        }`
      );

      const submitResponse = await fetch("/api/interview/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scenario.data),
      });

      console.log("📊 Submit status:", submitResponse.status);

      const submitResult = await submitResponse.json();
      console.log("📊 Submit result:", submitResult);

      if (submitResult.success) {
        console.log("✅ Submit successful for scenario:", scenario.name);
        console.log("📊 Results:", {
          totalScore: submitResult.data?.totalScore,
          averageScore: submitResult.data?.averageScore,
          recommendation: submitResult.data?.recommendation,
          autoRecommendation: submitResult.data?.autoRecommendation,
        });
      } else {
        console.log("❌ Submit failed for scenario:", scenario.name);
        console.log("📊 Error:", submitResult.message);
        if (submitResult.debug) {
          console.log("🐛 Debug info:", submitResult.debug);
        }
      }

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // 5. Test error scenarios
    console.log("\n❌ 5. Testing error scenarios...");

    const errorTests = [
      {
        name: "Invalid Session ID",
        data: {
          sessionId: "invalid-session-id",
          responses: [responses[0]],
          sessionNotes: "Test invalid session",
        },
      },
      {
        name: "Missing Session ID",
        data: {
          responses: [responses[0]],
          sessionNotes: "Test missing session ID",
        },
      },
      {
        name: "Invalid Responses",
        data: {
          sessionId,
          responses: "not-an-array",
          sessionNotes: "Test invalid responses",
        },
      },
    ];

    for (const errorTest of errorTests) {
      console.log(`\n🔍 Testing error: ${errorTest.name}`);

      const errorResponse = await fetch("/api/interview/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(errorTest.data),
      });

      const errorResult = await errorResponse.json();
      console.log("📊 Error test result:", {
        status: errorResponse.status,
        success: errorResult.success,
        message: errorResult.message,
      });
    }

    console.log("\n🎉 SUBMIT FORM TEST COMPLETED! 🎉");
  } catch (error) {
    console.error("❌ Test error:", error);
  }
}

// Helper function to test submit with custom data
async function testSubmitWithData(
  sessionId,
  customResponses,
  notes = "Custom test"
) {
  console.log(`🔥 TESTING CUSTOM SUBMIT FOR SESSION: ${sessionId} 🔥`);

  try {
    const submitResponse = await fetch("/api/interview/forms/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        responses: customResponses,
        sessionNotes: notes,
        recommendation: "Custom test recommendation",
      }),
    });

    const result = await submitResponse.json();
    console.log("📊 Custom submit result:", result);

    return result;
  } catch (error) {
    console.error("❌ Custom submit error:", error);
    return null;
  }
}

// Auto-run main test
testSubmitInterviewForm();

// Make helper available globally
window.testSubmitWithData = testSubmitWithData;
