/* 
BROWSER CONSOLE TEST SCRIPT
Copy paste ini ke browser console (F12) untuk test assignment

1. Open http://localhost:3000/admin
2. Go to Interviews tab  
3. Open F12 → Console
4. Paste script ini dan tekan Enter
*/

// Test API call directly
async function testAssignment() {
  console.log("🧪 Testing interviewer assignment...");

  try {
    // Test getting interview candidates first
    console.log("📋 Fetching interview candidates...");
    const candidatesResponse = await fetch("/api/admin/interview-candidates");
    const candidatesData = await candidatesResponse.json();
    console.log("📋 Interview candidates:", candidatesData);

    if (candidatesData.candidates && candidatesData.candidates.length > 0) {
      const testCandidate = candidatesData.candidates[0];
      console.log("🎯 Testing with candidate:", testCandidate);

      // Test assignment
      console.log("🔄 Attempting assignment to pewawancara2...");
      const assignResponse = await fetch("/api/admin/interview-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign_interviewer",
          applicantId: testCandidate.id,
          interviewerId: "pewawancara2",
        }),
      });

      const assignData = await assignResponse.json();
      console.log("🔄 Assignment result:", assignData);

      if (assignData.success) {
        console.log("✅ Assignment successful!");
      } else {
        console.error("❌ Assignment failed:", assignData.message);
      }
    } else {
      console.log("⚠️ No interview candidates found. Run SQL script first.");
    }
  } catch (error) {
    console.error("💥 Test error:", error);
  }
}

// Run the test
testAssignment();
