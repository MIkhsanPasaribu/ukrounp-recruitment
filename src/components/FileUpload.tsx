"use client";

import { useState, useRef } from "react";

interface FileUploadProps {
  onFileSelected: (base64: string) => void;
  error?: string;
  required?: boolean;
}

export default function FileUpload({
  onFileSelected,
  error,
  required = false,
}: FileUploadProps) {
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to compress image
  const compressImage = (
    file: File,
    maxWidth: number = 800,
    quality: number = 0.7
  ): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("File terlalu besar! Maksimal 5MB");
      return;
    }

    setFileName(file.name);
    setIsLoading(true);

    try {
      // Compress image before converting to base64
      const compressedBase64 = await compressImage(file, 600, 0.6); // More aggressive compression

      // Check compressed size (roughly)
      const compressedSize = (compressedBase64.length * 3) / 4; // Estimate base64 to bytes
      if (compressedSize > 1024 * 1024) {
        // 1MB
        // Try more compression
        const moreCompressed = await compressImage(file, 400, 0.5);
        onFileSelected(moreCompressed);
      } else {
        onFileSelected(compressedBase64);
      }
    } catch (error) {
      console.error("Error compressing image:", error);
      // Fallback to original method if compression fails
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onFileSelected(base64String);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mt-1 flex items-center">
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        required={required}
      />
      <button
        type="button"
        onClick={handleButtonClick}
        className={`inline-flex items-center px-4 py-2 border ${
          error ? "border-red-500" : "border-gray-300"
        } shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
      >
        {isLoading ? "Loading..." : "Choose File"}
      </button>
      <span className="ml-3 text-sm text-gray-500">
        {fileName || "No file selected"}
      </span>
      {required && !fileName && (
        <span className="ml-2 text-sm text-red-500">*</span>
      )}
    </div>
  );
}
