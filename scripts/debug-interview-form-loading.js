// Debug script untuk test interview form loading
// Buka browser console dan paste script ini

async function debugInterviewForm() {
  console.log("🔥 DEBUGGING INTERVIEW FORM LOADING 🔥");
  console.log("=" * 50);

  // 1. Check current URL
  console.log("📍 Current URL:", window.location.href);

  // 2. Get sessionId from URL
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("sessionId");
  console.log("🆔 Session ID:", sessionId);

  // 3. Check authentication
  console.log("🍪 Cookies:", document.cookie);

  // 4. Test forms API directly
  console.log("\n📋 Testing forms API...");
  try {
    const formsUrl = sessionId
      ? `/api/interview/forms?sessionId=${sessionId}`
      : "/api/interview/forms";
    console.log("🔗 Calling:", formsUrl);

    const response = await fetch(formsUrl);
    console.log("📊 Forms API status:", response.status);
    console.log(
      "📊 Forms API headers:",
      Object.fromEntries(response.headers.entries())
    );

    const result = await response.text();
    console.log("📊 Raw forms result:", result);

    try {
      const jsonResult = JSON.parse(result);
      console.log("✅ Forms JSON result:", jsonResult);

      if (jsonResult.success) {
        console.log(
          "✅ Questions loaded:",
          jsonResult.data?.questions?.length || 0
        );
        console.log(
          "✅ Session data:",
          jsonResult.data?.session ? "Found" : "Not found"
        );
        console.log("✅ Total questions:", jsonResult.data?.totalQuestions);

        if (jsonResult.data?.questions?.length > 0) {
          console.log("📝 First question:", jsonResult.data.questions[0]);
        }
      } else {
        console.log("❌ Forms API failed:", jsonResult.message);
      }
    } catch {
      console.log("❌ Forms response is not JSON:", result);
    }
  } catch (error) {
    console.error("❌ Forms API error:", error);
  }

  // 5. Test database structure by checking other endpoints
  console.log("\n🗄️ Testing database...");
  try {
    const appsResponse = await fetch("/api/interview/applications");
    console.log("📊 Applications API status:", appsResponse.status);

    if (appsResponse.ok) {
      const appsResult = await appsResponse.json();
      console.log("📋 Applications found:", appsResult.length || 0);
    }
  } catch (error) {
    console.error("❌ Applications API error:", error);
  }
}

// Auto-run debug
debugInterviewForm();
