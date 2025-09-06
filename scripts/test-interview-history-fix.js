/**
 * Test script untuk verifikasi fix riwayat wawancara setelah edit
 *
 * Cara pakai:
 * 1. Login sebagai interviewer
 * 2. Jalankan script ini di browser console
 * 3. Cek hasil di console
 */

async function testInterviewHistory() {
  console.log("🧪 TESTING INTERVIEW HISTORY FIX 🧪");
  console.log("=".repeat(50));

  try {
    // Get token from localStorage or sessionStorage
    const token =
      localStorage.getItem("interviewerToken") ||
      sessionStorage.getItem("interviewerToken");

    if (!token) {
      console.error("❌ No interviewer token found. Please login first.");
      return;
    }

    console.log("🔑 Token found, testing history API...");

    // Test different status filters
    const testCases = [
      { status: "all", name: "All Sessions" },
      { status: "completed", name: "Completed Sessions" },
      { status: "scheduled", name: "Scheduled Sessions" },
    ];

    for (const testCase of testCases) {
      console.log(`\n📋 Testing: ${testCase.name}`);

      const params = new URLSearchParams({
        page: "1",
        limit: "5",
        status: testCase.status,
      });

      const response = await fetch(`/api/interview/history?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log(`📊 ${testCase.name} - Status:`, response.status);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${testCase.name} - Success:`, {
          totalSessions: data.data?.length || 0,
          pagination: data.pagination,
          summary: data.summary,
        });

        // Check if data has expected fields
        if (data.data && data.data.length > 0) {
          const firstSession = data.data[0];
          console.log(`📝 ${testCase.name} - Sample session:`, {
            id: firstSession.id,
            status: firstSession.status,
            totalScore: firstSession.totalScore,
            recommendation: firstSession.recommendation,
            interviewerName: firstSession.interviewerName,
            hasApplicant: !!firstSession.applicants,
            hasCreatedAt: !!firstSession.created_at,
            hasUpdatedAt: !!firstSession.updated_at,
          });
        }
      } else {
        const errorData = await response.json();
        console.error(`❌ ${testCase.name} - Error:`, errorData);
        return {
          success: false,
          testCase: testCase.name,
          error: errorData,
        };
      }
    }

    console.log("\n✅ ALL HISTORY TESTS PASSED!");
    return {
      success: true,
      message: "Interview history API working correctly",
    };
  } catch (error) {
    console.error("❌ TEST ERROR:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Helper function to test specific session details
async function testSessionDetail(sessionId) {
  console.log("\n🔍 TESTING SESSION DETAIL");

  try {
    const token =
      localStorage.getItem("interviewerToken") ||
      sessionStorage.getItem("interviewerToken");

    const response = await fetch(`/api/interview/sessions/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Session detail loaded:", {
        id: data.data?.id,
        status: data.data?.status,
        totalScore: data.data?.totalScore,
        recommendation: data.data?.recommendation,
        interviewerName: data.data?.interviewerName,
        responsesCount: data.data?.responses?.length || 0,
      });
      return data;
    } else {
      const errorData = await response.json();
      console.error("❌ Session detail error:", errorData);
      return null;
    }
  } catch (error) {
    console.error("❌ Session detail test error:", error);
    return null;
  }
}

// Auto-run test
console.log("🚀 Starting interview history test...");
testInterviewHistory().then((result) => {
  console.log("🎯 Test completed:", result);
});

console.log("📚 Interview History Test Script loaded");
console.log("📝 Manual usage: testInterviewHistory()");
console.log('📝 Test session detail: testSessionDetail("session-id")');
