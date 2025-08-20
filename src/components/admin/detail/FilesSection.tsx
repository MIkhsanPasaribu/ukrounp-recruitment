"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ApplicationData } from "@/types";
import { useFileViewer } from "@/hooks/admin/useFileViewer";
import { fileService } from "@/services/fileService";

interface FilesSectionProps {
  data: ApplicationData;
}

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string | null;
  fileName: string;
  fileType: string | null;
}

function FileViewerModal({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  fileType,
}: FileViewerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{fileName}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 max-h-[calc(90vh-120px)] overflow-auto">
          {fileUrl ? (
            fileType?.startsWith("image/") ? (
              <Image
                src={fileUrl}
                alt={fileName}
                width={800}
                height={600}
                className="max-w-full h-auto mx-auto rounded-lg shadow-sm"
                style={{ objectFit: "contain" }}
              />
            ) : fileType === "application/pdf" ? (
              <iframe
                src={fileUrl}
                className="w-full h-96 border rounded-lg"
                title={fileName}
              />
            ) : (
              <div className="text-center py-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-500 mt-4">
                  Tipe file ini tidak dapat ditampilkan preview
                </p>
                <p className="text-sm text-gray-400">{fileType}</p>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Gagal memuat file</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FileCardProps {
  fieldName: string;
  label: string;
  icon: string;
  application: ApplicationData;
  onPreview: (fieldName: string, label: string) => void;
}

function FileCard({
  fieldName,
  label,
  icon,
  application,
  onPreview,
}: FileCardProps) {
  const {
    isLoading,
    error,
    fileUrl,
    fileType,
    progress,
    loadFile,
    downloadFile,
    retry,
  } = useFileViewer({
    applicationId: application.id,
    fieldName,
    autoLoad: false,
  });

  const [showLoadButton, setShowLoadButton] = useState(true);

  const handleDownload = useCallback(async () => {
    await downloadFile(`${fieldName}-${application.fullName}`);
  }, [downloadFile, fieldName, application.fullName]);

  const handlePreview = useCallback(() => {
    if (fileUrl) {
      onPreview(fieldName, label);
    }
  }, [fileUrl, fieldName, label, onPreview]);

  // Check if file exists in application data
  const hasFile = application[fieldName as keyof ApplicationData];
  
  // Debug log untuk melihat data file
  console.log(`File ${fieldName}:`, {
    hasFile: !!hasFile,
    fileType: typeof hasFile,
    isBase64: typeof hasFile === 'string' && hasFile.startsWith('data:'),
    preview: typeof hasFile === 'string' ? hasFile.substring(0, 50) + '...' : null
  });

  const isImage =
    fileType?.startsWith("image/") ||
    (hasFile &&
      typeof hasFile === "string" &&
      hasFile.startsWith("data:image/"));

  // Load file when needed
  const handleLoadFile = useCallback(async () => {
    setShowLoadButton(false);
    await loadFile();
  }, [loadFile]);

  // Auto-load file if it's base64 data
  const shouldShowDirectPreview = hasFile && 
    typeof hasFile === "string" && 
    hasFile.startsWith("data:");

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <span className="text-lg">{icon}</span>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{label}</h4>
            <p className="text-sm text-gray-500">
              {hasFile ? "File tersedia" : "Tidak ada file"}
            </p>
          </div>
          <div
            className={`w-3 h-3 rounded-full ${
              hasFile ? "bg-green-500" : "bg-gray-300"
            }`}
          ></div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        {!hasFile ? (
          <div className="text-center py-6 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 mx-auto mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm">File tidak diupload</p>
          </div>
        ) : shouldShowDirectPreview ? (
          <div>
            {/* Direct base64 preview */}
            {hasFile.startsWith("data:image/") && (
              <div className="mb-3">
                <Image
                  src={hasFile}
                  alt={label}
                  width={200}
                  height={128}
                  className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onPreview(fieldName, label)}
                  unoptimized
                />
              </div>
            )}

            {/* Actions for base64 files */}
            <div className="flex gap-2">
              <button
                onClick={() => onPreview(fieldName, label)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Lihat Gambar
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download
              </button>
            </div>
          </div>
        ) : showLoadButton && !fileUrl ? (
          <div className="text-center py-6">
            <button
              onClick={handleLoadFile}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Memuat...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Lihat File
                </>
              )}
            </button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Memuat file...</p>
            {progress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 mx-auto mb-2 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-600 mb-2">{error}</p>
            <button
              onClick={retry}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Coba Lagi
            </button>
          </div>
        ) : fileUrl ? (
          <div>
            {/* Preview */}
            {isImage && (
              <div className="mb-3">
                <Image
                  src={fileUrl}
                  alt={label}
                  width={200}
                  height={128}
                  className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={handlePreview}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handlePreview}
                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Preview
              </button>

              <button
                onClick={handleDownload}
                className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Unduh
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function FilesSection({ data }: FilesSectionProps) {
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    fieldName: string;
    label: string;
    fileUrl: string | null;
    fileType: string | null;
  }>({
    isOpen: false,
    fieldName: "",
    label: "",
    fileUrl: null,
    fileType: null,
  });

  const handlePreview = useCallback(
    async (fieldName: string, label: string) => {
      try {
        // Cek apakah file sudah ada di data sebagai base64
        const fileData = data[fieldName as keyof ApplicationData] as string;
        
        if (fileData && typeof fileData === 'string' && fileData.startsWith('data:')) {
          // Gunakan data base64 langsung
          setPreviewModal({
            isOpen: true,
            fieldName,
            label,
            fileUrl: fileData,
            fileType: fileData.split(';')[0].split(':')[1] || 'image/jpeg',
          });
        } else {
          // Fallback ke API jika tidak ada data base64
          const result = await fileService.getFile(data.id, fieldName);
          if (result.success && result.file) {
            setPreviewModal({
              isOpen: true,
              fieldName,
              label,
              fileUrl: result.file,
              fileType: result.metadata?.mimeType || null,
            });
          } else {
            alert('Gagal memuat file untuk preview');
          }
        }
      } catch (error) {
        console.error("Error loading file for preview:", error);
        alert('Terjadi kesalahan saat memuat file');
      }
    },
    [data]
  );

  const closePreview = useCallback(() => {
    setPreviewModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const fileFields = [
    { field: "photo", label: "Foto Diri", icon: "📸" },
    { field: "studentCard", label: "Kartu Mahasiswa", icon: "🎓" },
    { field: "studyPlanCard", label: "Kartu Rencana Studi", icon: "📚" },
    { field: "mbtiProof", label: "Bukti Tes MBTI", icon: "🧠" },
    { field: "igFollowProof", label: "Bukti Follow Instagram", icon: "📱" },
    { field: "tiktokFollowProof", label: "Bukti Follow TikTok", icon: "🎵" },
  ];

  // Count uploaded files
  const uploadedCount = fileFields.filter(
    ({ field }) => data[field as keyof ApplicationData]
  ).length;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">📁</span>
            </div>
            <div>
              <h3 className="font-semibold text-purple-800">Berkas Upload</h3>
              <p className="text-sm text-purple-600">
                {uploadedCount} dari {fileFields.length} file telah diupload
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-purple-700">
              {Math.round((uploadedCount / fileFields.length) * 100)}%
            </div>
            <div className="text-xs text-purple-600">Kelengkapan</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-purple-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(uploadedCount / fileFields.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fileFields.map(({ field, label, icon }) => (
          <FileCard
            key={field}
            fieldName={field}
            label={label}
            icon={icon}
            application={data}
            onPreview={handlePreview}
          />
        ))}
      </div>

      {/* File Preview Modal */}
      <FileViewerModal
        isOpen={previewModal.isOpen}
        onClose={closePreview}
        fileUrl={previewModal.fileUrl}
        fileName={previewModal.label}
        fileType={previewModal.fileType}
      />
    </div>
  );
}
