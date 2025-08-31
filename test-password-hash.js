const bcrypt = require("bcryptjs");

// Generate hash untuk password admin123
const password = "admin123";
const saltRounds = 12;

bcrypt.hash(password, saltRounds, function (err, hash) {
  if (err) {
    console.error("Error generating hash:", err);
    return;
  }
  console.log("Password:", password);
  console.log("Hash:", hash);

  // Test verify
  bcrypt.compare(password, hash, function (err, result) {
    if (err) {
      console.error("Error verifying:", err);
      return;
    }
    console.log("Verification result:", result);
  });
});

// Test dengan hash yang ada di database
const existingHash =
  "$2b$12$Bzj1Pridu9F34ZSo9cJlLe2OLE1JSF9X2sY.3i9psEh1waoz7kx5i";
bcrypt.compare(password, existingHash, function (err, result) {
  if (err) {
    console.error("Error verifying existing hash:", err);
    return;
  }
  console.log("Existing hash verification:", result);
});
