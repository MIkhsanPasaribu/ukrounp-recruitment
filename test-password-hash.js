const bcrypt = require("bcryptjs");

// Generate hash untuk password admin123
const password = "admin123";
const saltRounds = 12;

console.log("=== GENERATING NEW HASH ===");
bcrypt.hash(password, saltRounds, function (err, hash) {
  if (err) {
    console.error("Error generating hash:", err);
    return;
  }
  console.log("Password:", password);
  console.log("New Hash:", hash);

  // Test verify dengan hash baru
  bcrypt.compare(password, hash, function (err, result) {
    if (err) {
      console.error("Error verifying:", err);
      return;
    }
    console.log("New hash verification:", result);
  });
});

console.log("\n=== TESTING EXISTING HASHES ===");

// Test dengan hash yang digunakan pewawancara6 (yang berhasil)
const workingHash =
  "$2b$12$UuwjZpZAGc47gsUwFk99aO5jHQkdmbMNvX.OnKhHg0mSHSfTquOx6";
bcrypt.compare(password, workingHash, function (err, result) {
  if (err) {
    console.error("Error verifying working hash:", err);
    return;
  }
  console.log("Pewawancara6 hash (working):", result);
});

// Test dengan hash lama yang mungkin masih digunakan interviewer lain
const oldHash = "$2b$12$Bzj1Pridu9F34ZSo9cJlLe2OLE1JSF9X2sY.3i9psEh1waoz7kx5i";
bcrypt.compare(password, oldHash, function (err, result) {
  if (err) {
    console.error("Error verifying old hash:", err);
    return;
  }
  console.log("Old hash verification:", result);
});

// Test dengan password alternatif (mungkin mereka pakai password lain)
const altPassword = "password123";
console.log("\n=== TESTING ALTERNATIVE PASSWORD ===");
bcrypt.compare(altPassword, workingHash, function (err, result) {
  if (err) {
    console.error("Error verifying alt password:", err);
    return;
  }
  console.log("Alternative password (password123):", result);
});
