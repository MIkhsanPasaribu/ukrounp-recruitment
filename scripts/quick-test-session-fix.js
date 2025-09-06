// 🔧 QUICK TEST: Interview Sessions Fix
// Jalankan di Browser Console saat di halaman interview

// Test basic session API
async function quickTestSessionAPI() {
  console.log("🔍 Quick test for session API...");

  try {
    // Replace sessionId ini dengan ID dari error log
    const sessionId = "7d4acc9a-ffd7-4ba3-bfd8-1a2cabd41840";

    const response = await fetch(`/api/interview/sessions/${sessionId}`);
    const result = await response.json();

    console.log("Response Status:", response.status);
    console.log("API Result:", result);

    if (result.success) {
      console.log("✅ Session API fixed successfully!");
    } else {
      console.log("❌ Still has issues:", result.message);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run test
quickTestSessionAPI();
