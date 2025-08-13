// Test file untuk validasi nomor telepon
const validatePhoneNumber = (phone) => {
  if (!phone.trim()) {
    return { valid: false, message: "Nomor telepon tidak boleh kosong" };
  }

  // Indonesian phone number format - allow up to 20 digits total
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,17}$/;
  if (!phoneRegex.test(phone)) {
    return {
      valid: false,
      message: "Format nomor telepon tidak valid (contoh: 081234567890)",
    };
  }

  return { valid: true };
};

// Test cases
const testNumbers = [
  "08527120711878", // 14 digits (sebelumnya invalid)
  "085271207118781234", // 18 digits
  "08527120711878123456", // 20 digits
  "085271207118781234567", // 21 digits (should be invalid)
  "+6285271207118781234", // dengan +62
  "6285271207118781234", // dengan 62
  "08123456789", // standar 12 digits
  "0812345", // terlalu pendek
];

console.log("Testing phone number validation:");
console.log("=====================================");

testNumbers.forEach((phone, index) => {
  const result = validatePhoneNumber(phone);
  console.log(`${index + 1}. ${phone} (${phone.length} digits)`);
  console.log(`   Valid: ${result.valid}`);
  if (!result.valid) {
    console.log(`   Message: ${result.message}`);
  }
  console.log("");
});
