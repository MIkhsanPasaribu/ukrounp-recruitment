"use client";

import { useState } from "react";
import { Section1Data } from "@/types";
import FileUpload from "./FileUpload";
import {
  validateEmail,
  validateFileType,
  validateFileSize,
} from "@/utils/validation";

interface Section1FormProps {
  onSubmit: (data: Section1Data) => void;
}

export default function Section1Form({ onSubmit }: Section1FormProps) {
  const [email, setEmail] = useState("");
  const [mbtiProof, setMbtiProof] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    mbtiProof?: string;
  }>({});

  const validateForm = () => {
    const newErrors: { email?: string; mbtiProof?: string } = {};

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.message;
    }

    if (!mbtiProof) {
      newErrors.mbtiProof = "Bukti tes MBTI harus diunggah";
    } else {
      const sizeValidation = validateFileSize(mbtiProof, 2); // 2MB max
      if (!sizeValidation.valid) {
        newErrors.mbtiProof = sizeValidation.message;
      }

      const typeValidation = validateFileType(
        mbtiProof,
        ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
        "Bukti tes MBTI"
      );
      if (!typeValidation.valid) {
        newErrors.mbtiProof = typeValidation.message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({
        email,
        mbtiProof,
      });
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Langkah 1: Informasi Dasar</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            className={`block w-full rounded-md border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div className="mb-6">
          <div className="block text-sm font-medium text-gray-700 mb-1">
            <label>
              Bukti Tes MBTI <span className="text-red-500">*</span>
            </label>
            <a
              href="https://www.16personalities.com/id/tes-kepribadian"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Tes MBTI Disini
            </a>
          </div>
          <FileUpload onFileSelected={setMbtiProof} error={errors.mbtiProof} />
          {errors.mbtiProof && (
            <p className="mt-1 text-sm text-red-600">{errors.mbtiProof}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Lanjut ke Langkah 2
          </button>
        </div>
      </form>
    </div>
  );
}
