'use client';

import { useState, useRef } from 'react';

interface FileUploadProps {
  onFileSelected: (base64: string) => void;
  error?: string;
  required?: boolean;
}

export default function FileUpload({ onFileSelected, error, required = false }: FileUploadProps) {
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onFileSelected(base64String);
      setIsLoading(false);
    };
    reader.onerror = () => {
      console.error('Error reading file');
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
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
          error ? 'border-red-500' : 'border-gray-300'
        } shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
      >
        {isLoading ? 'Loading...' : 'Choose File'}
      </button>
      <span className="ml-3 text-sm text-gray-500">
        {fileName || 'No file selected'}
      </span>
      {required && !fileName && (
        <span className="ml-2 text-sm text-red-500">*</span>
      )}
    </div>
  );
}