// Browser console test script for dashboard status and PDF download
// Run this in the browser console when logged in as an interviewer

// Test 1: Check if candidates have sessionStatus field
console.log("=== Testing Dashboard Status ===");

// Simulate fetching candidates data
async function testCandidatesData() {
  try {
    const token = localStorage.getItem("interviewerToken");
    if (!token) {
      console.error("No interviewer token found. Please login first.");
      return;
    }

    const response = await fetch("/api/interview/applications", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    console.log("API Response:", result);

    if (result.success && result.data) {
      console.log("Candidates data:", result.data);

      // Check if candidates have sessionStatus
      result.data.forEach((candidate, index) => {
        console.log(`Candidate ${index + 1}:`, {
          name: candidate.fullName,
          sessionId: candidate.sessionId,
          sessionStatus: candidate.sessionStatus,
          interviewStatus: candidate.interviewStatus,
          hasInterview: candidate.hasInterview,
        });
      });

      return result.data;
    } else {
      console.error("Failed to fetch candidates:", result.error);
    }
  } catch (error) {
    console.error("Error fetching candidates:", error);
  }
}

// Test 2: Test PDF download for completed sessions
async function testPDFDownload(sessionId) {
  try {
    const token = localStorage.getItem("interviewerToken");
    if (!token) {
      console.error("No interviewer token found. Please login first.");
      return;
    }

    console.log(`Testing PDF download for session: ${sessionId}`);

    const response = await fetch(`/api/interview/download-pdf/${sessionId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PDF download failed:", response.status, errorText);
      return;
    }

    console.log("PDF download response headers:", {
      contentType: response.headers.get("content-type"),
      contentDisposition: response.headers.get("content-disposition"),
    });

    // Test blob creation
    const blob = await response.blob();
    console.log("PDF blob created:", {
      size: blob.size,
      type: blob.type,
    });

    // Simulate download
    const url = window.URL.createObjectURL(blob);
    console.log("Download URL created:", url);

    // Don't actually download in test, just verify we can create the URL
    window.URL.revokeObjectURL(url);
    console.log("PDF download test successful!");
  } catch (error) {
    console.error("Error testing PDF download:", error);
  }
}

// Test 3: Check dashboard button logic
function testButtonLogic(candidates) {
  console.log("=== Testing Button Logic ===");

  candidates.forEach((candidate, index) => {
    let buttonText = "";
    let buttonAction = "";

    if (candidate.sessionId) {
      if (candidate.sessionStatus === "COMPLETED") {
        buttonText = "Download PDF Hasil";
        buttonAction = "download";
      } else {
        buttonText =
          candidate.sessionStatus === "IN_PROGRESS"
            ? "Lanjutkan Wawancara"
            : "Mulai Wawancara";
        buttonAction = "interview";
      }
    } else {
      buttonText = "Buat Sesi Wawancara";
      buttonAction = "create";
    }

    console.log(`Candidate ${index + 1} (${candidate.fullName}):`, {
      sessionId: candidate.sessionId,
      sessionStatus: candidate.sessionStatus,
      buttonText,
      buttonAction,
    });
  });
}

// Test 4: Check status badge logic
function testStatusBadges(candidates) {
  console.log("=== Testing Status Badges ===");

  candidates.forEach((candidate, index) => {
    let statusText = "";
    let statusColor = "";

    if (candidate.hasInterview) {
      if (candidate.sessionStatus === "COMPLETED") {
        statusText = "Selesai Wawancara";
        statusColor = "purple";
      } else if (candidate.sessionStatus === "IN_PROGRESS") {
        statusText = "Sedang Berlangsung";
        statusColor = "blue";
      } else if (candidate.sessionId) {
        statusText = "Siap Wawancara";
        statusColor = "green";
      } else {
        statusText = "Perlu Sesi Baru";
        statusColor = "yellow";
      }
    } else {
      statusText = "Belum dijadwalkan";
      statusColor = "gray";
    }

    console.log(`Candidate ${index + 1} (${candidate.fullName}):`, {
      statusText,
      statusColor,
      hasScore: !!candidate.totalScore,
      score: candidate.totalScore,
    });
  });
}

// Main test function
async function runDashboardTests() {
  console.log("🧪 Starting Dashboard and PDF Download Tests...");

  const candidates = await testCandidatesData();

  if (candidates && candidates.length > 0) {
    testButtonLogic(candidates);
    testStatusBadges(candidates);

    // Find a completed session to test PDF download
    const completedSession = candidates.find(
      (c) => c.sessionStatus === "COMPLETED"
    );
    if (completedSession && completedSession.sessionId) {
      console.log(
        "Found completed session for PDF testing:",
        completedSession.sessionId
      );
      await testPDFDownload(completedSession.sessionId);
    } else {
      console.log("No completed sessions found for PDF testing");

      // If no completed sessions, test with any session ID (might fail but shows error handling)
      const anySession = candidates.find((c) => c.sessionId);
      if (anySession && anySession.sessionId) {
        console.log(
          "Testing PDF download with non-completed session:",
          anySession.sessionId
        );
        await testPDFDownload(anySession.sessionId);
      }
    }
  }

  console.log("✅ Dashboard tests completed!");
}

// Auto-run tests
runDashboardTests();

// Also expose functions for manual testing
window.testDashboard = {
  runTests: runDashboardTests,
  testCandidatesData,
  testPDFDownload,
  testButtonLogic,
  testStatusBadges,
};

console.log("💡 Functions available:");
console.log("- testDashboard.runTests()");
console.log("- testDashboard.testCandidatesData()");
console.log("- testDashboard.testPDFDownload(sessionId)");
console.log("- testDashboard.testButtonLogic(candidates)");
console.log("- testDashboard.testStatusBadges(candidates)");
