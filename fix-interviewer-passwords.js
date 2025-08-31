const bcrypt = require("bcryptjs");

// Script untuk membuat hash password yang benar
async function generatePasswordHashes() {
  const password = "admin123";

  console.log("🔑 Generating password hashes for interviewers...");
  console.log("Password:", password);

  // Generate 7 different hashes (untuk security yang lebih baik)
  const hashes = [];
  for (let i = 0; i < 7; i++) {
    const hash = await bcrypt.hash(password, 12);
    hashes.push(hash);
    console.log(`Hash ${i + 1}:`, hash);
  }

  // Generate SQL update statements
  console.log("\n📝 SQL Update Statements:");
  console.log("-- Update password hashes untuk semua interviewer");

  const usernames = [
    "pewawancara1",
    "pewawancara2",
    "pewawancara3",
    "pewawancara4",
    "pewawancara5",
    "pewawancara6",
    "ketuapewawancara",
  ];

  usernames.forEach((username, index) => {
    console.log(
      `UPDATE interviewers SET "passwordHash" = '${hashes[index]}' WHERE username = '${username}';`
    );
  });

  console.log("\n✅ Semua hash password telah dibuat!");
  console.log(
    "👆 Copy dan jalankan SQL statements di atas di Supabase SQL Editor"
  );
}

generatePasswordHashes().catch(console.error);
