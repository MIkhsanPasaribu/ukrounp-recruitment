/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Section2Data } from "@/types";
import FileUpload from "./FileUpload";
import {
  validateRequired,
  validatePhoneNumber,
  validateDate,
  validateTextLength,
  validateSelect,
  validateFileType,
  validateFileSize,
} from "@/utils/validation";

interface Section2FormProps {
  onSubmit: (data: Section2Data) => void;
  isSubmitting: boolean;
  onBack: () => void; // Add this new prop
}

export default function Section2Form({
  onSubmit,
  isSubmitting,
  onBack,
}: Section2FormProps) {
  const [formData, setFormData] = useState<Section2Data>({
    fullName: "",
    nickname: "",
    gender: "LAKI_LAKI",
    birthDate: "",
    faculty: "",
    department: "",
    studyProgram: "",
    educationLevel: "", // Default to empty string for "Pilih Jenjang Pendidikan"
    nim: "",
    nia: "",
    previousSchool: "",
    padangAddress: "",
    phoneNumber: "",
    motivation: "",
    futurePlans: "",
    whyYouShouldBeAccepted: "",
    software: {
      corelDraw: false,
      photoshop: false,
      adobePremierePro: false,
      adobeAfterEffect: false,
      autodeskEagle: false,
      arduinoIde: false,
      androidStudio: false,
      visualStudio: false,
      missionPlaner: false,
      autodeskInventor: false,
      autodeskAutocad: false,
      solidworks: false,
      others: "",
    },
    photo: "",
    studentCard: "",
    studyPlanCard: "",
    igFollowProof: "",
    tiktokFollowProof: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const getNiaFromNim = (nim: string): string => {
    // Remove any non-numeric characters
    const numericNim = nim.replace(/\D/g, "");

    if (!numericNim) return "";

    // Convert to integer and then to hexadecimal
    try {
      const hexValue = parseInt(numericNim, 10).toString(16).toUpperCase();
      return `16.${hexValue}`;
    } catch (error) {
      return "";
    }
  };

  const validateNimByEducationLevel = (
    nim: string,
    educationLevel: string
  ): string => {
    if (!nim || !educationLevel) return "";

    const nimPrefix = nim.substring(0, 2);

    if (educationLevel === "S1" || educationLevel === "D4") {
      if (nimPrefix !== "25" && nimPrefix !== "24") {
        return "Untuk Strata 1 (S1) dan Diploma 4 (D4) hanya mahasiswa tahun masuk 2024 dan 2025";
      }
    } else if (educationLevel === "D3") {
      if (nimPrefix !== "25") {
        return "Untuk Diploma 3 (D3) hanya mahasiswa tahun masuk 2025";
      }
    }

    return "";
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Update form data
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);

    // Validasi real-time untuk NIM ketika jenjang pendidikan atau NIM berubah
    if (name === "nim" || name === "educationLevel") {
      const nimValue = name === "nim" ? value : updatedFormData.nim;
      const educationLevelValue =
        name === "educationLevel" ? value : updatedFormData.educationLevel;

      // Clear existing NIM error first
      const newErrors = { ...errors };
      delete newErrors.nim;

      // Validate NIM based on education level
      const nimError = validateNimByEducationLevel(
        nimValue,
        educationLevelValue
      );
      if (nimError) {
        newErrors.nim = nimError;
      }

      setErrors(newErrors);
    }
  };

  const handleSoftwareChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      software: {
        ...prev.software,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const requiredFields = [
      "fullName",
      "nickname",
      "gender",
      "birthDate",
      "faculty",
      "department",
      "studyProgram",
      "educationLevel",
      "nim",
      "previousSchool",
      "padangAddress",
      "phoneNumber",
      "motivation",
      "futurePlans",
      "whyYouShouldBeAccepted",
      "photo",
      "studentCard",
      "studyPlanCard",
      "igFollowProof",
      "tiktokFollowProof",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field as keyof Section2Data]) {
        newErrors[field] = `Field ini wajib diisi`;
      }
    });

    // Validate phone number
    if (formData.phoneNumber && !/^[0-9+\-\s]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Mohon masukkan nomor telepon yang valid";
    }

    const fullNameValidation = validateRequired(
      formData.fullName,
      "Nama lengkap"
    );
    if (!fullNameValidation.valid && fullNameValidation.message)
      newErrors.fullName = fullNameValidation.message;

    const nicknameValidation = validateRequired(
      formData.nickname,
      "Nama panggilan"
    );
    if (!nicknameValidation.valid && nicknameValidation.message)
      newErrors.nickname = nicknameValidation.message;

    // Validate gender
    if (!formData.gender) {
      newErrors.gender = "Jenis kelamin harus dipilih";
    } else if (
      formData.gender !== "LAKI_LAKI" &&
      formData.gender !== "PEREMPUAN"
    ) {
      newErrors.gender = "Jenis kelamin harus laki-laki atau perempuan";
    }

    // Validate date
    const birthDateValidation = validateDate(
      formData.birthDate,
      "Tanggal lahir"
    );
    if (!birthDateValidation.valid && birthDateValidation.message) {
      newErrors.birthDate = birthDateValidation.message;
    }

    // Validate select fields
    const facultyValidation = validateSelect(formData.faculty, "Fakultas");
    if (!facultyValidation.valid && facultyValidation.message) {
      newErrors.faculty = facultyValidation.message;
    }

    const departmentValidation = validateSelect(formData.department, "Jurusan");
    if (!departmentValidation.valid && departmentValidation.message) {
      newErrors.department = departmentValidation.message;
    }

    const studyProgramValidation = validateSelect(
      formData.studyProgram,
      "Program studi"
    );
    if (!studyProgramValidation.valid && studyProgramValidation.message) {
      newErrors.studyProgram = studyProgramValidation.message;
    }

    // Education Level validation
    const educationLevelValidation = validateSelect(
      formData.educationLevel,
      "Jenjang pendidikan tinggi"
    );
    if (!educationLevelValidation.valid && educationLevelValidation.message) {
      newErrors.educationLevel = educationLevelValidation.message;
    }

    // NIM validation
    const nimValidation = validateRequired(formData.nim, "NIM");
    if (!nimValidation.valid && nimValidation.message) {
      newErrors.nim = nimValidation.message;
    } else if (!/^\d+$/.test(formData.nim)) {
      newErrors.nim = "NIM harus berupa angka";
    } else {
      // Validate NIM based on education level
      const nimEducationError = validateNimByEducationLevel(
        formData.nim,
        formData.educationLevel
      );
      if (nimEducationError) {
        newErrors.nim = nimEducationError;
      }
    }

    // Validate other required fields
    const previousSchoolValidation = validateRequired(
      formData.previousSchool,
      "Asal sekolah"
    );
    if (!previousSchoolValidation.valid && previousSchoolValidation.message) {
      newErrors.previousSchool = previousSchoolValidation.message;
    }

    const padangAddressValidation = validateRequired(
      formData.padangAddress,
      "Alamat di Padang"
    );
    if (!padangAddressValidation.valid && padangAddressValidation.message) {
      newErrors.padangAddress = padangAddressValidation.message;
    }

    // Validate phone number
    const phoneValidation = validatePhoneNumber(formData.phoneNumber);
    if (!phoneValidation.valid && phoneValidation.message) {
      newErrors.phoneNumber = phoneValidation.message;
    }

    // Validate text areas with minimum length
    const motivationValidation = validateTextLength(
      formData.motivation,
      "Motivasi",
      10,
      500
    );
    if (!motivationValidation.valid && motivationValidation.message) {
      newErrors.motivation = motivationValidation.message;
    }

    const futurePlansValidation = validateTextLength(
      formData.futurePlans,
      "Rencana masa depan",
      10,
      500
    );
    if (!futurePlansValidation.valid && futurePlansValidation.message) {
      newErrors.futurePlans = futurePlansValidation.message;
    }

    const whyAcceptedValidation = validateTextLength(
      formData.whyYouShouldBeAccepted,
      "Alasan diterima",
      10,
      500
    );
    if (!whyAcceptedValidation.valid && whyAcceptedValidation.message) {
      newErrors.whyYouShouldBeAccepted = whyAcceptedValidation.message;
    }

    // Validate file uploads
    const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
    const maxFileSizeMB = 10;

    // Helper function to validate file uploads
    const validateFileUpload = (
      file: string,
      fieldName: string,
      label: string,
      allowedTypes: string[] = allowedImageTypes
    ) => {
      if (!file) {
        newErrors[fieldName] = `${label} harus diunggah`;
        return;
      }

      // Validate file size first
      const sizeValidation = validateFileSize(file, maxFileSizeMB);
      if (!sizeValidation.valid && sizeValidation.message) {
        newErrors[fieldName] = sizeValidation.message;
        return;
      }

      // Then validate file type
      const typeValidation = validateFileType(file, allowedTypes, label);
      if (!typeValidation.valid && typeValidation.message) {
        newErrors[fieldName] = typeValidation.message;
      }
    };

    // Validate all file uploads
    validateFileUpload(formData.photo, "photo", "Pasfoto");
    validateFileUpload(formData.studentCard, "studentCard", "Kartu mahasiswa");
    validateFileUpload(formData.studyPlanCard, "studyPlanCard", "KRS", [
      ...allowedImageTypes,
      "application/pdf",
    ]);
    validateFileUpload(
      formData.igFollowProof,
      "igFollowProof",
      "Bukti follow IG"
    );
    validateFileUpload(
      formData.tiktokFollowProof,
      "tiktokFollowProof",
      "Bukti follow TikTok"
    );

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const calculatedNia = getNiaFromNim(formData.nim);

      const formDataWithNia = {
        ...formData,
        nia: calculatedNia,
      };

      onSubmit(formDataWithNia);
    } else {
      const firstErrorField = document.querySelector('[aria-invalid="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">
        Langkah 2: Informasi Personal
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`block w-full rounded-md border ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={!!errors.fullName}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="nickname"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nama Panggilan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
                className={`block w-full rounded-md border ${
                  errors.nickname ? "border-red-500" : "border-gray-300"
                } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={!!errors.nickname}
              />
              {errors.nickname && (
                <p className="mt-1 text-sm text-red-600">{errors.nickname}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className={`block w-full rounded-md border ${
                  errors.gender ? "border-red-500" : "border-gray-300"
                } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={!!errors.gender}
              >
                <option value="LAKI_LAKI">Laki-laki</option>
                <option value="PEREMPUAN">Perempuan</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="birthDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tanggal Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                className={`block w-full rounded-md border ${
                  errors.birthDate ? "border-red-500" : "border-gray-300"
                } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={!!errors.birthDate}
              />
              {errors.birthDate && (
                <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>
              )}
            </div>
          </div>

          {/* Academic Information */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="faculty"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fakultas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="faculty"
                name="faculty"
                value={formData.faculty}
                onChange={handleInputChange}
                className={`block w-full rounded-md border ${
                  errors.faculty ? "border-red-500" : "border-gray-300"
                } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={!!errors.faculty}
              />
              {errors.faculty && (
                <p className="mt-1 text-sm text-red-600">{errors.faculty}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="department"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Departemen <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className={`block w-full rounded-md border ${
                  errors.department ? "border-red-500" : "border-gray-300"
                } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={!!errors.department}
              />
              {errors.department && (
                <p className="mt-1 text-sm text-red-600">{errors.department}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="studyProgram"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Program Studi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="studyProgram"
                name="studyProgram"
                value={formData.studyProgram}
                onChange={handleInputChange}
                className={`block w-full rounded-md border ${
                  errors.studyProgram ? "border-red-500" : "border-gray-300"
                } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={!!errors.studyProgram}
              />
              {errors.studyProgram && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.studyProgram}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="previousSchool"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Sekolah Asal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="previousSchool"
                name="previousSchool"
                value={formData.previousSchool}
                onChange={handleInputChange}
                className={`block w-full rounded-md border ${
                  errors.previousSchool ? "border-red-500" : "border-gray-300"
                } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={!!errors.previousSchool}
              />
              {errors.previousSchool && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.previousSchool}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="educationLevel"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Jenjang Pendidikan Tinggi{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                id="educationLevel"
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleInputChange}
                className={`block w-full rounded-md border ${
                  errors.educationLevel ? "border-red-500" : "border-gray-300"
                } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={!!errors.educationLevel}
              >
                <option value="">Pilih Jenjang Pendidikan</option>
                <option value="S1">Strata 1 (S1)</option>
                <option value="D4">Diploma 4 (D4)</option>
                <option value="D3">Diploma 3 (D3)</option>
              </select>
              {errors.educationLevel && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.educationLevel}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.educationLevel === "S1" ||
                formData.educationLevel === "D4"
                  ? "S1 dan D4: NIM harus dimulai dengan 25 atau 24"
                  : formData.educationLevel === "D3"
                  ? "D3: NIM harus dimulai dengan 25"
                  : "Pilih jenjang untuk melihat aturan NIM"}
              </p>
            </div>

            <div>
              <label
                htmlFor="nim"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                NIM (Nomor Induk Mahasiswa){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nim"
                name="nim"
                value={formData.nim}
                onChange={handleInputChange}
                className={`block w-full rounded-md border ${
                  errors.nim ? "border-red-500" : "border-gray-300"
                } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={!!errors.nim}
                placeholder="Contoh: 2512345678"
              />
              {errors.nim && (
                <p className="mt-1 text-sm text-red-600">{errors.nim}</p>
              )}

              {/* Display NIA immediately when NIM is entered */}
              {formData.nim && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700 font-medium">
                    NIA (Nomor Induk Anggota):
                  </p>
                  <p className="font-mono text-lg text-blue-800 font-bold">
                    {getNiaFromNim(formData.nim)}
                  </p>
                </div>
              )}

              <p className="mt-1 text-xs text-gray-500">
                NIM akan otomatis dikonversi ke NIA sesuai format institusi
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="padangAddress"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Alamat di Padang <span className="text-red-500">*</span>
              </label>
              <textarea
                id="padangAddress"
                name="padangAddress"
                rows={3}
                value={formData.padangAddress}
                onChange={handleInputChange}
                className={`block w-full rounded-md border ${
                  errors.padangAddress ? "border-red-500" : "border-gray-300"
                } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={!!errors.padangAddress}
              />
              {errors.padangAddress && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.padangAddress}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nomor HP/WA <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className={`block w-full rounded-md border ${
                  errors.phoneNumber ? "border-red-500" : "border-gray-300"
                } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                aria-invalid={!!errors.phoneNumber}
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phoneNumber}
                </p>
              )}
            </div>
          </div>

          {/* Motivation and Plans */}
          <div>
            <label
              htmlFor="motivation"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Motivasi Bergabung dengan Robotik{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              id="motivation"
              name="motivation"
              rows={4}
              value={formData.motivation}
              onChange={handleInputChange}
              className={`block w-full rounded-md border ${
                errors.motivation ? "border-red-500" : "border-gray-300"
              } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              aria-invalid={!!errors.motivation}
            />
            {errors.motivation && (
              <p className="mt-1 text-sm text-red-600">{errors.motivation}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="futurePlans"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Rencana Setelah Bergabung <span className="text-red-500">*</span>
            </label>
            <textarea
              id="futurePlans"
              name="futurePlans"
              rows={4}
              value={formData.futurePlans}
              onChange={handleInputChange}
              className={`block w-full rounded-md border ${
                errors.futurePlans ? "border-red-500" : "border-gray-300"
              } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              aria-invalid={!!errors.futurePlans}
            />
            {errors.futurePlans && (
              <p className="mt-1 text-sm text-red-600">{errors.futurePlans}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="whyYouShouldBeAccepted"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Alasan Anda Layak Diterima <span className="text-red-500">*</span>
            </label>
            <textarea
              id="whyYouShouldBeAccepted"
              name="whyYouShouldBeAccepted"
              rows={4}
              value={formData.whyYouShouldBeAccepted}
              onChange={handleInputChange}
              className={`block w-full rounded-md border ${
                errors.whyYouShouldBeAccepted
                  ? "border-red-500"
                  : "border-gray-300"
              } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              aria-invalid={!!errors.whyYouShouldBeAccepted}
            />
            {errors.whyYouShouldBeAccepted && (
              <p className="mt-1 text-sm text-red-600">
                {errors.whyYouShouldBeAccepted}
              </p>
            )}
          </div>

          {/* Software Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Software yang Sudah Pernah Digunakan
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="corelDraw"
                  name="corelDraw"
                  checked={formData.software.corelDraw}
                  onChange={handleSoftwareChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="corelDraw"
                  className="ml-2 block text-sm text-gray-700"
                >
                  CorelDraw
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="photoshop"
                  name="photoshop"
                  checked={formData.software.photoshop}
                  onChange={handleSoftwareChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="photoshop"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Photoshop
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="adobePremierePro"
                  name="adobePremierePro"
                  checked={formData.software.adobePremierePro}
                  onChange={handleSoftwareChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="adobePremierePro"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Adobe Premiere Pro
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="adobeAfterEffect"
                  name="adobeAfterEffect"
                  checked={formData.software.adobeAfterEffect}
                  onChange={handleSoftwareChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="adobeAfterEffect"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Adobe After Effect
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autodeskEagle"
                  name="autodeskEagle"
                  checked={formData.software.autodeskEagle}
                  onChange={handleSoftwareChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="autodeskEagle"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Autodesk Eagle
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="arduinoIde"
                  name="arduinoIde"
                  checked={formData.software.arduinoIde}
                  onChange={handleSoftwareChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="arduinoIde"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Arduino IDE
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="androidStudio"
                  name="androidStudio"
                  checked={formData.software.androidStudio}
                  onChange={handleSoftwareChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="androidStudio"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Android Studio
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="visualStudio"
                  name="visualStudio"
                  checked={formData.software.visualStudio}
                  onChange={handleSoftwareChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="visualStudio"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Visual Studio
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="missionPlaner"
                  name="missionPlaner"
                  checked={formData.software.missionPlaner}
                  onChange={handleSoftwareChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="missionPlaner"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Mission Planer
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autodeskInventor"
                  name="autodeskInventor"
                  checked={formData.software.autodeskInventor}
                  onChange={handleSoftwareChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="autodeskInventor"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Autodesk Inventor
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autodeskAutocad"
                  name="autodeskAutocad"
                  checked={formData.software.autodeskAutocad}
                  onChange={handleSoftwareChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="autodeskAutocad"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Autodesk AutoCAD
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="solidworks"
                  name="solidworks"
                  checked={formData.software.solidworks}
                  onChange={handleSoftwareChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="solidworks"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Solidworks
                </label>
              </div>
            </div>

            <div className="mt-3">
              <label
                htmlFor="others"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Software Lainnya
              </label>
              <input
                type="text"
                id="others"
                name="others"
                value={formData.software.others}
                onChange={handleSoftwareChange}
                className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Document Uploads */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pasfoto <span className="text-red-500">*</span>
              </label>
              <FileUpload
                onFileSelected={(base64) =>
                  setFormData((prev) => ({ ...prev, photo: base64 }))
                }
                error={errors.photo}
              />
              {errors.photo && (
                <p className="mt-1 text-sm text-red-600">{errors.photo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kartu Tanda Mahasiswa atau Kartu Tanda Mahasiswa Sementara{" "}
                <span className="text-red-500">*</span>
              </label>
              <FileUpload
                onFileSelected={(base64) =>
                  setFormData((prev) => ({ ...prev, studentCard: base64 }))
                }
                error={errors.studentCard}
              />
              {errors.studentCard && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.studentCard}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kartu Rencana Studi <span className="text-red-500">*</span>
              </label>
              <FileUpload
                onFileSelected={(base64) =>
                  setFormData((prev) => ({ ...prev, studyPlanCard: base64 }))
                }
                error={errors.studyPlanCard}
              />
              {errors.studyPlanCard && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.studyPlanCard}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Bukti Follow Akun IG <span className="text-red-500">*</span>
                </label>
                <a
                  href="https://www.instagram.com/robotic_unp?igsh=MWZhM2x0bTdvZGN2MQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center bg-gradient-to-r from-pink-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs hover:shadow-lg transition-all duration-300 hover:scale-105"
                  title="Follow Instagram UKRO UNP"
                >
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  Follow IG
                </a>
              </div>
              <FileUpload
                onFileSelected={(base64) =>
                  setFormData((prev) => ({ ...prev, igFollowProof: base64 }))
                }
                error={errors.igFollowProof}
              />
              {errors.igFollowProof && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.igFollowProof}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Bukti Follow Akun TikTok{" "}
                  <span className="text-red-500">*</span>
                </label>
                <a
                  href="https://www.tiktok.com/@robotic_unp?is_from_webapp=1&sender_device=pc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center bg-black text-white px-2 py-1 rounded-full text-xs hover:bg-gray-800 transition-all duration-300 hover:scale-105"
                  title="Follow TikTok UKRO UNP"
                >
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                  Follow TikTok
                </a>
              </div>
              <FileUpload
                onFileSelected={(base64) =>
                  setFormData((prev) => ({
                    ...prev,
                    tiktokFollowProof: base64,
                  }))
                }
                error={errors.tiktokFollowProof}
              />
              {errors.tiktokFollowProof && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.tiktokFollowProof}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button and Back to Step 1 Button */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Kembali ke Langkah 1
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isSubmitting ? "Mengirim..." : "Kirim Aplikasi"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
