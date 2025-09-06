const bcrypt = require("bcryptjs");

// Test script untuk verify password hash dari database
async function testPasswordHashes() {
  console.log("🔍 Testing password hashes...\n");

  // Hash yang asli dari database migration
  const originalHash =
    "$2b$12$LQv3c1yqBWVHxkd0LQ4lqe7LkEyFwEr7QZm6Xs1x2tE8E9c8R9k7e";

  // Test passwords
  const testPasswords = ["admin123", "123", "password", "admin"];

  console.log("Testing original hash from database migration:");
  console.log("Hash:", originalHash);

  for (const password of testPasswords) {
    try {
      const isValid = await bcrypt.compare(password, originalHash);
      console.log(
        `Password "${password}": ${isValid ? "✅ VALID" : "❌ INVALID"}`
      );
    } catch (error) {
      console.log(`Password "${password}": ❌ ERROR - ${error.message}`);
    }
  }

  console.log('\n🔧 Generating new hash for "admin123":');
  const newHash = await bcrypt.hash("admin123", 12);
  console.log("New hash:", newHash);

  const testNewHash = await bcrypt.compare("admin123", newHash);
  console.log(
    'New hash test with "admin123":',
    testNewHash ? "✅ VALID" : "❌ INVALID"
  );

  console.log('\n🔧 Generating simple hash for "123":');
  const simpleHash = await bcrypt.hash("123", 12);
  console.log("Simple hash:", simpleHash);

  const testSimpleHash = await bcrypt.compare("123", simpleHash);
  console.log(
    'Simple hash test with "123":',
    testSimpleHash ? "✅ VALID" : "❌ INVALID"
  );
}

testPasswordHashes().catch(console.error);
