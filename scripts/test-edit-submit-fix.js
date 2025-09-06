/**
 * Test script untuk verifikasi fix submit edit hasil wawancara
 *
 * Jalankan di browser console setelah login sebagai interviewer
 * dan saat berada di halaman edit hasil wawancara
 */

async function testEditSubmit() {
  console.log("🧪 TESTING EDIT SUBMIT FIX 🧪");
  console.log("=".repeat(50));

  try {
    // Get form data from current page
    const formElements = document.querySelectorAll(
      'input[name^="responses."], textarea[name^="responses."]'
    );
    const sessionIdElement = document.querySelector("[data-session-id]");

    if (!sessionIdElement) {
      console.error(
        "❌ Session ID not found. Make sure you are on interview edit page."
      );
      return;
    }

    const sessionId = sessionIdElement.getAttribute("data-session-id");
    console.log("📋 Session ID:", sessionId);

    // Prepare test data
    const testResponses = [];
    const responseGroups = {};

    // Group form elements by question
    formElements.forEach((element) => {
      const match = element.name.match(/responses\.(\d+)\.(\w+)/);
      if (match) {
        const questionIndex = match[1];
        const field = match[2];

        if (!responseGroups[questionIndex]) {
          responseGroups[questionIndex] = {};
        }

        responseGroups[questionIndex][field] = element.value || "";
      }
    });

    // Convert to responses array
    Object.keys(responseGroups).forEach((index) => {
      const response = responseGroups[index];
      if (response.questionId && response.score) {
        testResponses.push({
          questionId: response.questionId,
          response: response.response || "Test response edited",
          score: parseInt(response.score) || 5,
          notes: response.notes || "Test notes edited",
        });
      }
    });

    console.log("📝 Test responses prepared:", testResponses.length);

    if (testResponses.length === 0) {
      console.error(
        "❌ No valid responses found. Make sure form is properly filled."
      );
      return;
    }

    // Prepare request data
    const requestData = {
      sessionId: sessionId,
      responses: testResponses,
      sessionNotes: "Test session notes edited via script",
      recommendation: "DIREKOMENDASIKAN",
    };

    console.log("🚀 Testing edit submit API...");
    console.log("📊 Request data:", {
      sessionId,
      responsesCount: testResponses.length,
      hasNotes: !!requestData.sessionNotes,
      recommendation: requestData.recommendation,
    });

    // Call edit API
    const response = await fetch("/api/interview/forms/edit", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    console.log("📊 Response status:", response.status);
    console.log("📊 Response headers:", [...response.headers.entries()]);

    const responseData = await response.json();
    console.log("📊 Response data:", responseData);

    if (response.ok && responseData.success) {
      console.log("✅ EDIT SUBMIT TEST PASSED!");
      console.log("✅ Interview successfully updated");
      console.log("📈 Summary:", {
        sessionId: responseData.sessionId,
        totalScore: responseData.totalScore,
        averageScore: responseData.averageScore,
        recommendation: responseData.recommendation,
      });
      return {
        success: true,
        data: responseData,
      };
    } else {
      console.error("❌ EDIT SUBMIT TEST FAILED!");
      console.error("❌ Error:", responseData.message);
      return {
        success: false,
        error: responseData.message,
        status: response.status,
      };
    }
  } catch (error) {
    console.error("❌ TEST ERROR:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Helper function to check current page
function checkCurrentPage() {
  const url = window.location.pathname;
  console.log("📍 Current URL:", url);

  if (url.includes("/interview") && url.includes("sessions")) {
    console.log("✅ You are on interview page");
    return true;
  } else {
    console.log("❌ Navigate to interview edit page first");
    return false;
  }
}

// Auto-check current page
if (checkCurrentPage()) {
  console.log("🎯 Ready to test edit submit");
  console.log("📝 Run: testEditSubmit()");
} else {
  console.log("📝 Navigate to interview edit page and run: testEditSubmit()");
}

console.log("🔧 Edit Submit Test Script Loaded");
