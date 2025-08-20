"use client";

import React, { useState, useCallback } from "react";
import { ApplicationData } from "@/types";

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
  if (!isOpen || !fileUrl) return null;

  const isImage = fileType?.startsWith("image/") || false;

  const handleDownload = () => {
    if (!fileUrl) return;

    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{fileName}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              💾 Unduh
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[calc(90vh-120px)] overflow-auto">
          {isImage ? (
            <div className="flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fileUrl}
                alt={fileName}
                className="max-w-full max-h-full object-contain rounded-lg"
                onError={(e) => {
                  console.error("Error loading image in modal:", e);
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-gray-600 mb-4">
                Preview tidak tersedia untuk tipe file ini
              </p>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                💾 Unduh File
              </button>
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
  data: ApplicationData;
  onPreview: (fileUrl: string, fileName: string, fileType: string) => void;
}

function FileCard({ fieldName, label, icon, data, onPreview }: FileCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileData = data[fieldName as keyof ApplicationData] as string;
  const hasFile =
    fileData && typeof fileData === "string" && fileData.length > 0;

  // Debug logging untuk setiap field
  console.log(`🔍 FileCard Debug - ${fieldName}:`, {
    hasFile,
    dataLength: fileData?.length,
    dataType: typeof fileData,
    dataStart: fileData?.substring(0, 50),
  });

  const handlePreview = useCallback(async () => {
    if (!hasFile) return;

    setLoading(true);
    setError(null);

    try {
      let fileUrl: string;
      let fileType: string;

      if (fileData.startsWith("data:")) {
        // Already a data URL
        fileUrl = fileData;
        fileType = fileData.split(";")[0].split(":")[1];
      } else {
        // Assume base64 image data
        const isJpeg = fileData.startsWith("/9j/");
        const isPng = fileData.startsWith("iVBORw0KGgo");

        if (isJpeg) {
          fileUrl = `data:image/jpeg;base64,${fileData}`;
          fileType = "image/jpeg";
        } else if (isPng) {
          fileUrl = `data:image/png;base64,${fileData}`;
          fileType = "image/png";
        } else {
          // Try to detect other image types or treat as generic file
          fileUrl = `data:application/octet-stream;base64,${fileData}`;
          fileType = "application/octet-stream";
        }
      }

      console.log(`📄 FileCard Preview - ${fieldName}:`, {
        fileUrl: fileUrl.substring(0, 100) + "...",
        fileType,
      });

      onPreview(fileUrl, label, fileType);
    } catch (err) {
      console.error(`❌ Error previewing ${fieldName}:`, err);
      setError("Gagal memuat preview file");
    } finally {
      setLoading(false);
    }
  }, [hasFile, fileData, fieldName, label, onPreview]);

  const handleDownload = useCallback(() => {
    if (!hasFile) return;

    try {
      let fileUrl: string;
      let fileName: string;

      if (fileData.startsWith("data:")) {
        fileUrl = fileData;
        const extension = fileData.includes("image/jpeg")
          ? "jpg"
          : fileData.includes("image/png")
          ? "png"
          : "file";
        fileName = `${label}_${data.fullName || "file"}.${extension}`;
      } else {
        // Assume it's base64 image
        const extension = fileData.startsWith("/9j/") ? "jpg" : "png";
        fileUrl = `data:image/${
          extension === "jpg" ? "jpeg" : extension
        };base64,${fileData}`;
        fileName = `${label}_${data.fullName || "file"}.${extension}`;
      }

      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`💾 Download ${fieldName}:`, { fileName });
    } catch (err) {
      console.error(`❌ Error downloading ${fieldName}:`, err);
      setError("Gagal mengunduh file");
    }
  }, [hasFile, fileData, fieldName, label, data.fullName]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-50 rounded-lg text-2xl">{icon}</div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{label}</h3>
          <p className="text-sm text-gray-500">
            {hasFile ? "File tersedia" : "Tidak ada file"}
          </p>
        </div>
        {hasFile && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {hasFile ? (
          <>
            {/* Preview Thumbnail for Images */}
            {(fileData?.startsWith("data:image/") ||
              fileData?.startsWith("/9j/") ||
              fileData?.startsWith("iVBORw0KGgo")) && (
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    fileData.startsWith("data:")
                      ? fileData
                      : fileData.startsWith("/9j/")
                      ? `data:image/jpeg;base64,${fileData}`
                      : `data:image/png;base64,${fileData}`
                  }
                  alt={label}
                  className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={handlePreview}
                  onError={(e) => {
                    console.error(`❌ Error loading image ${fieldName}:`, e);
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-white text-2xl">👁️</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handlePreview}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? "⏳" : "👁️"}
                {loading ? "Memuat..." : "Lihat"}
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                💾 Unduh
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                ⚠️ {error}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-3">📄</div>
            <p className="text-sm">File tidak diupload</p>
            <p className="text-xs text-gray-400">
              Pendaftar belum mengirim berkas untuk {label.toLowerCase()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FilesSection({ data }: FilesSectionProps) {
  const [viewerModal, setViewerModal] = useState({
    isOpen: false,
    fileUrl: null as string | null,
    fileName: "",
    fileType: null as string | null,
  });

  // Debug logging untuk melihat data yang diterima
  console.log("🔍 FilesSection Debug - Data received:", {
    hasData: !!data,
    dataKeys: data ? Object.keys(data) : [],
    photoLength: data?.photo?.length,
    studentCardLength: data?.studentCard?.length,
    studyPlanCardLength: data?.studyPlanCard?.length,
    mbtiProofLength: data?.mbtiProof?.length,
    igFollowProofLength: data?.igFollowProof?.length,
    tiktokFollowProofLength: data?.tiktokFollowProof?.length,
  });

  const handlePreview = useCallback(
    (fileUrl: string, fileName: string, fileType: string) => {
      setViewerModal({
        isOpen: true,
        fileUrl,
        fileName,
        fileType,
      });
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    setViewerModal({
      isOpen: false,
      fileUrl: null,
      fileName: "",
      fileType: null,
    });
  }, []);

  const fileFields = [
    {
      fieldName: "photo",
      label: "Foto Diri",
      icon: "📸",
    },
    {
      fieldName: "studentCard",
      label: "Kartu Mahasiswa",
      icon: "🎓",
    },
    {
      fieldName: "studyPlanCard",
      label: "Kartu Rencana Studi",
      icon: "📚",
    },
    {
      fieldName: "mbtiProof",
      label: "Bukti Tes MBTI",
      icon: "🧠",
    },
    {
      fieldName: "igFollowProof",
      label: "Bukti Follow Instagram",
      icon: "📱",
    },
    {
      fieldName: "tiktokFollowProof",
      label: "Bukti Follow TikTok",
      icon: "🎵",
    },
  ];

  // Count uploaded files
  const uploadedCount = fileFields.filter(({ fieldName }) => {
    const fileData = data[fieldName as keyof ApplicationData] as string;
    return fileData && typeof fileData === "string" && fileData.length > 0;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
              📁
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-800">Berkas Upload</h3>
              <p className="text-sm text-blue-600">
                {uploadedCount} dari {fileFields.length} file telah diupload
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-blue-700">
              {Math.round((uploadedCount / fileFields.length) * 100)}%
            </div>
            <div className="text-xs text-blue-600">Kelengkapan</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(uploadedCount / fileFields.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fileFields.map((field) => (
          <FileCard
            key={field.fieldName}
            fieldName={field.fieldName}
            label={field.label}
            icon={field.icon}
            data={data}
            onPreview={handlePreview}
          />
        ))}
      </div>

      {/* File Viewer Modal */}
      <FileViewerModal
        isOpen={viewerModal.isOpen}
        onClose={handleCloseModal}
        fileUrl={viewerModal.fileUrl}
        fileName={viewerModal.fileName}
        fileType={viewerModal.fileType}
      />
    </div>
  );
}
