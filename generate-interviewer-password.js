// Script untuk generate password hash bcrypt yang benar
const bcrypt = require("bcrypt");

async function generatePasswordHash() {
  const password = "123456";
  const saltRounds = 10;

  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log("Password:", password);
    console.log("Hash:", hash);

    // Test verification
    const isValid = await bcrypt.compare(password, hash);
    console.log("Verification test:", isValid);

    // Generate untuk semua pewawancara
    console.log("\n=== SQL untuk update password ===");
    console.log(
      `UPDATE interviewers SET password = '${hash}' WHERE username LIKE 'pewawancara%';`
    );
  } catch (error) {
    console.error("Error generating hash:", error);
  }
}

generatePasswordHash();
