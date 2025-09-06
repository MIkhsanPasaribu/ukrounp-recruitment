#!/usr/bin/env node

/**
 * Test Script untuk Enhanced Interviewer Dashboard
 *
 * Script ini akan menguji semua fitur baru yang telah diimplementasikan:
 * 1. Enhanced Dashboard dengan tab navigation
 * 2. Fitur edit hasil wawancara
 * 3. API endpoints baru
 * 4. Session details dan form editing
 */

const axios = require("axios");

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const TEST_INTERVIEWER = {
  username: process.env.TEST_INTERVIEWER_USERNAME || "pewawancara1",
  password: process.env.TEST_INTERVIEWER_PASSWORD || "test123",
};

let authToken = "";
let testSessionId = "";

// Helper functions
function log(message, type = "info") {
  const timestamp = new Date().toISOString();
  const colors = {
    info: "\x1b[36m", // cyan
    success: "\x1b[32m", // green
    error: "\x1b[31m", // red
    warning: "\x1b[33m", // yellow
  };
  console.log(`${colors[type]}[${timestamp}] ${message}\x1b[0m`);
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Test functions
async function testLogin() {
  log("🔐 Testing interviewer login...");

  try {
    const response = await axios.post(`${BASE_URL}/api/interview/auth/login`, {
      identifier: TEST_INTERVIEWER.username,
      password: TEST_INTERVIEWER.password,
    });

    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      log(
        `✅ Login successful for ${response.data.interviewer?.fullName}`,
        "success"
      );
      return true;
    } else {
      log("❌ Login failed: No token received", "error");
      return false;
    }
  } catch (error) {
    log(
      `❌ Login failed: ${error.response?.data?.message || error.message}`,
      "error"
    );
    return false;
  }
}

async function testFetchCandidates() {
  log("📋 Testing fetch candidates API...");

  try {
    const response = await axios.get(`${BASE_URL}/api/interview/applications`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.data.success && Array.isArray(response.data.data)) {
      log(`✅ Fetched ${response.data.data.length} candidates`, "success");
      return response.data.data;
    } else {
      log("❌ Failed to fetch candidates", "error");
      return [];
    }
  } catch (error) {
    log(
      `❌ Fetch candidates failed: ${
        error.response?.data?.message || error.message
      }`,
      "error"
    );
    return [];
  }
}

async function testFetchInterviewHistory() {
  log("📚 Testing fetch interview history API...");

  try {
    const response = await axios.get(`${BASE_URL}/api/interview/history`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.data.success && Array.isArray(response.data.data)) {
      log(
        `✅ Fetched ${response.data.data.length} interview sessions`,
        "success"
      );

      // Find a completed session for testing edit
      const completedSession = response.data.data.find(
        (session) => session.status === "COMPLETED"
      );

      if (completedSession) {
        testSessionId = completedSession.id;
        log(
          `📝 Found completed session for edit testing: ${testSessionId}`,
          "info"
        );
      }

      return response.data.data;
    } else {
      log("❌ Failed to fetch interview history", "error");
      return [];
    }
  } catch (error) {
    log(
      `❌ Fetch history failed: ${
        error.response?.data?.message || error.message
      }`,
      "error"
    );
    return [];
  }
}

async function testSessionDetails() {
  if (!testSessionId) {
    log("⚠️ No completed session found for testing session details", "warning");
    return false;
  }

  log(`🔍 Testing session details API for session: ${testSessionId}`);

  try {
    const response = await axios.get(
      `${BASE_URL}/api/interview/sessions/${testSessionId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (response.data.success && response.data.data) {
      const { session, questions } = response.data.data;
      log(
        `✅ Session details loaded - Questions: ${questions?.length || 0}`,
        "success"
      );

      if (session.status === "COMPLETED") {
        log(`📊 Session total score: ${session.totalScore || 0}`, "info");
        log(
          `💭 Session recommendation: ${session.recommendation || "None"}`,
          "info"
        );
      }

      return response.data.data;
    } else {
      log("❌ Failed to fetch session details", "error");
      return false;
    }
  } catch (error) {
    log(
      `❌ Session details failed: ${
        error.response?.data?.message || error.message
      }`,
      "error"
    );
    return false;
  }
}

async function testEditInterview() {
  if (!testSessionId) {
    log(
      "⚠️ No completed session found for testing edit functionality",
      "warning"
    );
    return false;
  }

  log(`✏️ Testing edit interview API for session: ${testSessionId}`);

  // First get session details to get current responses
  const sessionDetails = await testSessionDetails();
  if (!sessionDetails || !sessionDetails.questions) {
    log("❌ Cannot get session details for edit test", "error");
    return false;
  }

  try {
    // Modify responses slightly for testing
    const responses = sessionDetails.questions.map((q) => ({
      questionId: q.question.id,
      response: q.response + " [EDITED]",
      score: Math.min(5, q.score + 1), // Increase score by 1, max 5
      notes: (q.notes || "") + " [Test edit]",
    }));

    const editData = {
      sessionId: testSessionId,
      responses: responses,
      sessionNotes: "Test edit - Interview updated via automated test",
      recommendation: "DIREKOMENDASIKAN",
    };

    const response = await axios.put(
      `${BASE_URL}/api/interview/forms/edit`,
      editData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      log(
        `✅ Interview edit successful - New total score: ${response.data.data?.totalScore}`,
        "success"
      );
      log(`🎯 Average score: ${response.data.data?.averageScore}`, "info");
      return true;
    } else {
      log("❌ Interview edit failed", "error");
      return false;
    }
  } catch (error) {
    log(
      `❌ Edit interview failed: ${
        error.response?.data?.message || error.message
      }`,
      "error"
    );
    return false;
  }
}

async function testFormAPI() {
  log("📝 Testing interview form API...");

  try {
    const response = await axios.get(`${BASE_URL}/api/interview/forms`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.data.success && response.data.data) {
      const { questions, totalQuestions } = response.data.data;
      log(
        `✅ Form API working - ${totalQuestions} questions available`,
        "success"
      );
      return true;
    } else {
      log("❌ Form API failed", "error");
      return false;
    }
  } catch (error) {
    log(
      `❌ Form API failed: ${error.response?.data?.message || error.message}`,
      "error"
    );
    return false;
  }
}

async function testPDFDownload() {
  if (!testSessionId) {
    log("⚠️ No session found for testing PDF download", "warning");
    return false;
  }

  log(`📄 Testing PDF download for session: ${testSessionId}`);

  try {
    const response = await axios.get(
      `${BASE_URL}/api/interview/download-pdf/${testSessionId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
        responseType: "blob",
      }
    );

    if (response.status === 200 && response.data) {
      log(
        `✅ PDF download successful - Size: ${response.data.size} bytes`,
        "success"
      );
      return true;
    } else {
      log("❌ PDF download failed", "error");
      return false;
    }
  } catch (error) {
    log(
      `❌ PDF download failed: ${
        error.response?.data?.message || error.message
      }`,
      "error"
    );
    return false;
  }
}

// Main test execution
async function runTests() {
  log("🚀 Starting Enhanced Interviewer Dashboard Tests", "info");
  log("=" * 60, "info");

  const results = {
    login: false,
    fetchCandidates: false,
    fetchHistory: false,
    sessionDetails: false,
    editInterview: false,
    formAPI: false,
    pdfDownload: false,
  };

  // Test sequence
  results.login = await testLogin();
  if (!results.login) {
    log("❌ Cannot proceed without login. Please check credentials.", "error");
    return results;
  }

  await sleep(1000); // Rate limiting

  results.fetchCandidates = await testFetchCandidates();
  await sleep(1000);

  results.fetchHistory = await testFetchInterviewHistory();
  await sleep(1000);

  results.sessionDetails = await testSessionDetails();
  await sleep(1000);

  results.editInterview = await testEditInterview();
  await sleep(1000);

  results.formAPI = await testFormAPI();
  await sleep(1000);

  results.pdfDownload = await testPDFDownload();

  // Summary
  log("=" * 60, "info");
  log("📊 TEST RESULTS SUMMARY:", "info");
  log("=" * 60, "info");

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? "✅ PASS" : "❌ FAIL";
    const testName = test
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
    log(`${status} - ${testName}`, passed ? "success" : "error");
  });

  log("=" * 60, "info");
  log(
    `📈 Overall: ${passed}/${total} tests passed (${Math.round(
      (passed / total) * 100
    )}%)`,
    passed === total ? "success" : "warning"
  );

  if (passed === total) {
    log(
      "🎉 All tests passed! Enhanced Dashboard is working correctly.",
      "success"
    );
  } else {
    log("⚠️ Some tests failed. Please check the issues above.", "warning");
  }

  return results;
}

// Run if called directly
if (require.main === module) {
  runTests().catch((error) => {
    log(`💥 Test execution failed: ${error.message}`, "error");
    process.exit(1);
  });
}

module.exports = { runTests };
