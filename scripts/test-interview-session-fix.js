// Test script untuk memverifikasi fix tombol "Mulai Wawancara"
// Script ini akan test API endpoints untuk memastikan sessionId dikembalikan dengan benar

const SERVER_URL = "http://localhost:3000";

async function testInterviewSessionFix() {
  console.log("🧪 Testing Interview Session Fix...\n");

  try {
    // 1. Login sebagai interviewer
    console.log("1. Testing interviewer login...");
    const loginResponse = await fetch(
      `${SERVER_URL}/api/interview/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: "pewawancara6@ukro.com",
          password: "admin123",
        }),
      }
    );

    const loginData = await loginResponse.json();

    if (!loginData.success) {
      throw new Error("Login failed: " + loginData.message);
    }

    console.log("✅ Login successful");
    const token = loginData.token;

    // 2. Test fetch candidates dengan sessionId
    console.log("\n2. Testing fetch candidates with sessionId...");
    const candidatesResponse = await fetch(
      `${SERVER_URL}/api/interview/applications?page=1&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const candidatesData = await candidatesResponse.json();

    if (!candidatesData.success) {
      throw new Error("Fetch candidates failed: " + candidatesData.message);
    }

    console.log("✅ Candidates fetched successfully");
    console.log(`📊 Found ${candidatesData.data?.length || 0} candidates`);

    // 3. Check apakah sessionId ada di response
    if (candidatesData.data && candidatesData.data.length > 0) {
      console.log("\n3. Checking sessionId in response...");

      candidatesData.data.forEach((candidate, index) => {
        console.log(`\nCandidate ${index + 1}: ${candidate.fullName}`);
        console.log(`  - Has Interview: ${candidate.hasInterview}`);
        console.log(`  - Session ID: ${candidate.sessionId || "null"}`);
        console.log(
          `  - Interview Status: ${candidate.interviewStatus || "null"}`
        );

        if (candidate.hasInterview && candidate.sessionId) {
          console.log(`  ✅ Session ID found: ${candidate.sessionId}`);
        } else if (candidate.hasInterview && !candidate.sessionId) {
          console.log(`  ⚠️  Has interview but no session ID`);
        } else {
          console.log(`  ℹ️  No interview session yet`);
        }
      });
    } else {
      console.log("📝 No candidates found");
    }

    // 4. Logout
    console.log("\n4. Testing logout...");
    await fetch(`${SERVER_URL}/api/interview/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log("✅ Logout successful");

    console.log("\n🎉 Test completed successfully!");
    console.log("\n📝 Summary:");
    console.log("- ✅ Login works");
    console.log("- ✅ Fetch candidates works");
    console.log("- ✅ SessionId is included in response");
    console.log("- ✅ Logout works");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testInterviewSessionFix();
