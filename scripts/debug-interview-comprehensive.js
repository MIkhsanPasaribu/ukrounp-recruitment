// Comprehensive debug script untuk interview system
// Buka browser di localhost:3000 dan paste di console

async function debugInterviewSystem() {
  console.log("🔥 DEBUGGING INTERVIEW SYSTEM 🔥");
  console.log("=" * 50);

  // 1. Check current page
  console.log("📍 Current URL:", window.location.href);

  // 2. Check cookies
  console.log("🍪 Cookies:", document.cookie);

  // 3. Check localStorage
  console.log("💾 LocalStorage:");
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log(`   ${key}:`, localStorage.getItem(key));
  }

  // 4. Test authentication endpoint
  console.log("\n🔐 Testing interviewer auth...");
  try {
    const authResponse = await fetch("/api/interview/applications");
    const authResult = await authResponse.text();
    console.log("📊 Auth test status:", authResponse.status);
    console.log("📊 Auth test result:", authResult);
  } catch (error) {
    console.error("❌ Auth test error:", error);
  }

  // 5. Get available applications
  console.log("\n📋 Getting applications...");
  try {
    const appsResponse = await fetch("/api/interview/applications");
    if (appsResponse.ok) {
      const applications = await appsResponse.json();
      console.log("📋 Applications:", applications);

      // 6. Test session creation dengan applicant pertama
      if (applications.length > 0) {
        console.log("\n🗓️ Testing session creation...");
        const firstApp = applications[0];
        console.log("🎯 Using applicant:", {
          id: firstApp.id,
          name: firstApp.fullName,
          nim: firstApp.nim,
          hasSession: !!firstApp.sessionId,
        });

        const sessionResponse = await fetch("/api/interview/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            applicantId: firstApp.id,
            interviewDate: new Date().toISOString(),
            location: "Test Location",
            notes: "Test session creation",
          }),
        });

        console.log("📊 Session response status:", sessionResponse.status);
        console.log(
          "📊 Session response headers:",
          Object.fromEntries(sessionResponse.headers.entries())
        );

        const sessionResult = await sessionResponse.text();
        console.log("📊 Session result:", sessionResult);

        try {
          const jsonResult = JSON.parse(sessionResult);
          if (jsonResult.success) {
            console.log("✅ Session created successfully:", jsonResult.data);
          } else {
            console.log("❌ Session creation failed:", jsonResult.message);
            if (jsonResult.debug) {
              console.log("🐛 Debug info:", jsonResult.debug);
            }
          }
        } catch {
          console.log("❌ Session response is not JSON:", sessionResult);
        }
      } else {
        console.log("❌ No applications found");
      }
    } else {
      const errorText = await appsResponse.text();
      console.log("❌ Applications fetch failed:", errorText);
    }
  } catch (error) {
    console.error("❌ Applications error:", error);
  }
}

// Auto-run debug
debugInterviewSystem();
