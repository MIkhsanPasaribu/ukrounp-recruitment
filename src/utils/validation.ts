export const validateEmail = (
  email: string
): { valid: boolean; message?: string } => {
  if (!email.trim()) {
    return { valid: false, message: "Email tidak boleh kosong" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: "Format email tidak valid" };
  }

  return { valid: true };
};

export const validatePhoneNumber = (
  phone: string
): { valid: boolean; message?: string } => {
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

export const validateRequired = (
  value: string,
  fieldName: string
): { valid: boolean; message?: string } => {
  if (!value || value.trim().length === 0) {
    return { valid: false, message: `${fieldName} tidak boleh kosong` };
  }

  return { valid: true };
};

export const validateDate = (
  date: string,
  fieldName: string
): { valid: boolean; message?: string } => {
  if (!date) {
    return { valid: false, message: `${fieldName} tidak boleh kosong` };
  }

  // Check if date is in YYYY-MM-DD format and is valid
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return {
      valid: false,
      message: `Format ${fieldName} tidak valid (YYYY-MM-DD)`,
    };
  }

  const d = new Date(date);
  if (!(d instanceof Date && !isNaN(d.getTime()))) {
    return { valid: false, message: `${fieldName} tidak valid` };
  }

  // Check if date is not in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (fieldName === "Tanggal Lahir" && d > today) {
    return { valid: false, message: "Tanggal lahir tidak boleh di masa depan" };
  }

  return { valid: true };
};

export const validateFileSize = (
  base64: string,
  maxSizeMB: number
): { valid: boolean; message?: string } => {
  if (!base64) {
    return { valid: false, message: "File tidak boleh kosong" };
  }

  // Approximate size calculation for base64 string
  const sizeInBytes = (base64.length * 3) / 4;
  const sizeInMB = sizeInBytes / (1024 * 1024);

  if (sizeInMB > maxSizeMB) {
    return {
      valid: false,
      message: `Ukuran file terlalu besar (maksimal ${maxSizeMB}MB)`,
    };
  }

  return { valid: true };
};

export const validateFileType = (
  base64: string,
  allowedTypes: string[],
  fieldName: string
): { valid: boolean; message?: string } => {
  if (!base64) {
    return { valid: false, message: `${fieldName} tidak boleh kosong` };
  }

  // Extract MIME type from base64 string
  const mime = base64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,/)?.[1];

  if (!mime) {
    return { valid: false, message: `Format ${fieldName} tidak valid` };
  }

  if (!allowedTypes.includes(mime)) {
    return {
      valid: false,
      message: `Format ${fieldName} tidak didukung. Format yang didukung: ${allowedTypes
        .map((type) => type.split("/")[1])
        .join(", ")}`,
    };
  }

  return { valid: true };
};

export const validateTextLength = (
  text: string,
  fieldName: string,
  minLength: number,
  maxLength?: number
): { valid: boolean; message?: string } => {
  if (!text) {
    return { valid: false, message: `${fieldName} tidak boleh kosong` };
  }

  if (text.trim().length < minLength) {
    return {
      valid: false,
      message: `${fieldName} minimal ${minLength} karakter`,
    };
  }

  if (maxLength && text.trim().length > maxLength) {
    return {
      valid: false,
      message: `${fieldName} maksimal ${maxLength} karakter`,
    };
  }

  return { valid: true };
};

export const validateSelect = (
  value: string,
  fieldName: string
): { valid: boolean; message?: string } => {
  if (!value) {
    return { valid: false, message: `${fieldName} harus dipilih` };
  }

  return { valid: true };
};

// Helper function to validate all fields at once and return all errors
export const validateForm = (
  formData: Record<string, unknown>,
  validations: Record<
    string,
    (value: unknown) => { valid: boolean; message?: string }
  >
): Record<string, string> => {
  const errors: Record<string, string> = {};

  for (const field in validations) {
    if (Object.prototype.hasOwnProperty.call(validations, field)) {
      try {
        const validation = validations[field](formData[field]);
        if (!validation.valid) {
          errors[field] = validation.message || `${field} tidak valid`;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        errors[field] = `Validation error for ${field}`;
      }
    }
  }

  return errors;
};

// Validation untuk jenjang pendidikan dan NIM
export function validateNimByEducationLevel(
  nim: string,
  educationLevel: string
): { valid: boolean; message?: string } {
  if (!nim || !educationLevel) {
    return { valid: false, message: "NIM dan jenjang pendidikan harus diisi" };
  }

  const nimPrefix = nim.substring(0, 2);

  if (educationLevel === "S1" || educationLevel === "D4") {
    if (nimPrefix !== "25" && nimPrefix !== "24") {
      return {
        valid: false,
        message:
          "NIM untuk Strata 1 (S1) dan Diploma 4 (D4) harus dimulai dengan 25 atau 24",
      };
    }
  } else if (educationLevel === "D3") {
    if (nimPrefix !== "25") {
      return {
        valid: false,
        message: "NIM untuk Diploma 3 (D3) harus dimulai dengan 25",
      };
    }
  }

  return { valid: true };
}

// Function untuk mendapatkan label jenjang pendidikan
export function getEducationLevelLabel(level: string): string {
  switch (level) {
    case "S1":
      return "Strata 1 (S1)";
    case "D4":
      return "Diploma 4 (D4)";
    case "D3":
      return "Diploma 3 (D3)";
    default:
      return level;
  }
}
