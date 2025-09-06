/* 
COMPREHENSIVE INTERVIEW SESSION DEBUG SCRIPT
Copy paste script ini ke browser console (F12) untuk debug session creation

1. Open http://localhost:3000/interview
2. Login sebagai pewawancara1
3. Open F12 → Console  
4. Paste script ini dan tekan Enter
*/

console.log("🧪 Starting comprehensive interview session debug...");

async function debugSessionCreation() {
  try {
    // Step 1: Check current authentication
    console.log("🔑 Step 1: Checking authentication...");

    const authToken = localStorage.getItem("interviewerToken");
    console.log("🔑 Auth token found:", !!authToken);

    if (!authToken) {
      console.error("❌ No auth token found in localStorage");
      return;
    }

    // Step 2: Fetch interview candidates
    console.log("📋 Step 2: Fetching interview candidates...");

    const candidatesResponse = await fetch("/api/interview/applications", {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("📋 Candidates response status:", candidatesResponse.status);

    if (!candidatesResponse.ok) {
      const errorText = await candidatesResponse.text();
      console.error("❌ Failed to fetch candidates:", errorText);
      return;
    }

    const candidatesData = await candidatesResponse.json();
    console.log("📋 Candidates data:", candidatesData);

    if (!candidatesData.success || !candidatesData.data?.length) {
      console.log("⚠️ No candidates available for session creation");
      return;
    }

    const testCandidate = candidatesData.data[0];
    console.log("🎯 Using test candidate:", {
      id: testCandidate.id,
      name: testCandidate.fullName,
      nim: testCandidate.nim,
      sessionId: testCandidate.sessionId,
    });

    // Step 3: Try to create session
    console.log("🗓️ Step 3: Creating interview session...");

    const sessionPayload = {
      applicantId: testCandidate.id,
      interviewDate: new Date().toISOString(),
      location: "Online/Offline",
      notes: "Sesi wawancara debugging",
    };

    console.log("🗓️ Session payload:", sessionPayload);

    const sessionResponse = await fetch("/api/interview/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionPayload),
    });

    console.log("🗓️ Session response status:", sessionResponse.status);

    const sessionData = await sessionResponse.json();
    console.log("🗓️ Session response data:", sessionData);

    if (sessionData.success) {
      console.log("✅ Session creation successful!");
      console.log("📝 Session ID:", sessionData.data.id);

      // Step 4: Verify session in candidates list
      console.log("🔍 Step 4: Re-fetching candidates to verify session...");

      const verifyResponse = await fetch("/api/interview/applications", {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      const verifyData = await verifyResponse.json();
      const updatedCandidate = verifyData.data?.find(
        (c) => c.id === testCandidate.id
      );

      console.log("🔍 Updated candidate data:", {
        sessionId: updatedCandidate?.sessionId,
        sessionStatus: updatedCandidate?.sessionStatus,
      });

      if (updatedCandidate?.sessionId) {
        console.log("✅ Session successfully linked to candidate!");
      } else {
        console.log("⚠️ Session created but not linked to candidate yet");
      }
    } else {
      console.error("❌ Session creation failed:", sessionData.message);
      if (sessionData.debug) {
        console.error("🔧 Debug info:", sessionData.debug);
      }
    }
  } catch (error) {
    console.error("💥 Debug script error:", error);
  }
}

// Run the debug
debugSessionCreation();

// Also provide quick access functions
window.debugInterview = {
  createSession: debugSessionCreation,
  checkAuth: () => {
    const token = localStorage.getItem("interviewerToken");
    console.log("Auth token exists:", !!token);
    if (token) {
      console.log("Token preview:", token.substring(0, 20) + "...");
    }
  },
  clearAuth: () => {
    localStorage.removeItem("interviewerToken");
    console.log("Auth token cleared");
  },
};

console.log("🔧 Debug functions available:");
console.log("- debugInterview.createSession()");
console.log("- debugInterview.checkAuth()");
console.log("- debugInterview.clearAuth()");
