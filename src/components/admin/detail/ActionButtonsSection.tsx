"use client";

import { useState } from "react";
import { ApplicationData } from "@/types";

interface ActionButtonsSectionProps {
  application: ApplicationData;
  onStatusUpdate: (
    newStatus:
      | "SEDANG_DITINJAU"
      | "DAFTAR_PENDEK"
      | "INTERVIEW"
      | "DITERIMA"
      | "DITOLAK"
  ) => Promise<void>;
  onDelete: () => Promise<void>;
  onDownloadPDF: () => Promise<void>;
  onClose: () => void;
}

export default function ActionButtonsSection({
  application,
  onStatusUpdate,
  onDelete,
  onDownloadPDF,
  onClose,
}: ActionButtonsSectionProps) {
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleStatusUpdate = async (
    newStatus:
      | "SEDANG_DITINJAU"
      | "DAFTAR_PENDEK"
      | "INTERVIEW"
      | "DITERIMA"
      | "DITOLAK"
  ) => {
    setStatusLoading(true);
    try {
      await onStatusUpdate(newStatus);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await onDelete();
      setShowDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      await onDownloadPDF();
    } finally {
      setPdfLoading(false);
    }
  };

  const statusOptions = [
    {
      value: "SEDANG_DITINJAU" as const,
      label: "Sedang Ditinjau",
      color: "yellow",
      icon: "⏳",
      description: "Pendaftar sedang menunggu review dari admin",
    },
    {
      value: "DAFTAR_PENDEK" as const,
      label: "Masuk Daftar Pendek",
      color: "blue",
      icon: "📋",
      description: "Pendaftar masuk ke dalam daftar pendek",
    },
    {
      value: "INTERVIEW" as const,
      label: "Interview",
      color: "purple",
      icon: "💬",
      description: "Pendaftar lolos seleksi berkas dan akan diwawancara",
    },
    {
      value: "DITERIMA" as const,
      label: "Diterima",
      color: "green",
      icon: "✅",
      description: "Pendaftar resmi diterima menjadi anggota",
    },
    {
      value: "DITOLAK" as const,
      label: "Ditolak",
      color: "red",
      icon: "❌",
      description: "Pendaftar tidak memenuhi kriteria dan ditolak",
    },
  ];

  const getCurrentStatus = () => {
    return (
      statusOptions.find((status) => status.value === application.status) ||
      statusOptions[0]
    );
  };

  const getStatusColorClasses = (color: string) => {
    const colors = {
      yellow: "bg-yellow-50 text-yellow-800 border-yellow-200",
      blue: "bg-blue-50 text-blue-800 border-blue-200",
      green: "bg-green-50 text-green-800 border-green-200",
      red: "bg-red-50 text-red-800 border-red-200",
    };
    return colors[color as keyof typeof colors] || colors.yellow;
  };

  if (showDeleteConfirm) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Konfirmasi Hapus Data
          </h3>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium mb-2">
              Anda akan menghapus data pendaftar:
            </p>
            <p className="text-red-900 font-bold text-lg">
              {application.fullName}
            </p>
            <p className="text-red-700 text-sm mt-2">
              NIA: {application.nia || "Belum dibuat"} •{" "}
              {application.faculty || "Tidak tersedia"}
            </p>
          </div>

          <p className="text-gray-600 mb-6">
            <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan.
            Semua data termasuk file upload akan dihapus secara permanen.
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              disabled={deleteLoading}
            >
              Batal
            </button>

            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {deleteLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Menghapus...
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Ya, Hapus Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Status Display */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Status Pendaftaran Saat Ini
        </h3>

        <div
          className={`inline-flex items-center gap-3 px-4 py-3 border rounded-lg ${getStatusColorClasses(
            getCurrentStatus().color
          )}`}
        >
          <span className="text-2xl">{getCurrentStatus().icon}</span>
          <div>
            <div className="font-semibold text-lg">
              {getCurrentStatus().label}
            </div>
            <div className="text-sm opacity-80">
              {getCurrentStatus().description}
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Ubah Status Pendaftaran
        </h3>

        <p className="text-gray-600 mb-4">
          Pilih status baru untuk pendaftar. Perubahan akan tersimpan otomatis.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {statusOptions.map((status) => (
            <button
              key={status.value}
              onClick={() => handleStatusUpdate(status.value)}
              disabled={statusLoading || status.value === application.status}
              className={`p-4 border rounded-lg text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                status.value === application.status
                  ? `${getStatusColorClasses(status.color)} border-2`
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{status.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold">
                    {status.label}
                    {status.value === application.status && (
                      <span className="ml-2 text-sm font-normal opacity-75">
                        (Saat ini)
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {status.description}
                  </div>
                </div>
                {statusLoading && (
                  <svg
                    className="animate-spin h-5 w-5 text-gray-400"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Document Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-purple-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Tindakan Dokumen
        </h3>

        <div className="space-y-3">
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="w-full flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pdfLoading ? (
              <svg
                className="animate-spin h-6 w-6 text-blue-600"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600"
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
            )}
            <div className="flex-1">
              <div className="font-semibold text-blue-800">
                {pdfLoading ? "Mengunduh PDF..." : "Unduh Data PDF"}
              </div>
              <div className="text-sm text-blue-600">
                Unduh semua data pendaftar dalam format PDF
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          Zona Berbahaya
        </h3>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 text-sm">
            <strong>Peringatan:</strong> Tindakan di bawah ini bersifat permanen
            dan tidak dapat dibatalkan. Pastikan Anda yakin sebelum melanjutkan.
          </p>
        </div>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-left w-full text-red-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <div className="flex-1">
            <div className="font-semibold">Hapus Data Pendaftar</div>
            <div className="text-sm">
              Hapus semua data dan file upload pendaftar secara permanen
            </div>
          </div>
        </button>
      </div>

      {/* Modal Actions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Tutup Detail
          </button>
        </div>
      </div>
    </div>
  );
}
