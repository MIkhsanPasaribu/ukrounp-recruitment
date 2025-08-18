"use client";

import { ApplicationData } from "@/types";

interface DetailModalHeaderProps {
  application: ApplicationData;
  onClose: () => void;
  isLoading?: boolean;
}

export default function DetailModalHeader({
  application,
  onClose,
  isLoading = false,
}: DetailModalHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              Detail Pendaftaran
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
              <span className="flex items-center gap-1">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Dikirim:{" "}
                {application.submittedAt
                  ? new Date(application.submittedAt).toLocaleString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Tidak tersedia"}
              </span>

              <span className="flex items-center gap-1">
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
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                ID: <span className="font-mono">{application.id}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Status Badge */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
          <div
            className={`w-2 h-2 rounded-full ${
              application.status === "DITERIMA"
                ? "bg-green-500"
                : application.status === "DITOLAK"
                ? "bg-red-500"
                : application.status === "INTERVIEW"
                ? "bg-purple-500"
                : application.status === "DAFTAR_PENDEK"
                ? "bg-blue-500"
                : "bg-yellow-500"
            }`}
          ></div>
          <span className="text-sm font-medium text-gray-700">
            {application.status === "SEDANG_DITINJAU"
              ? "Sedang Ditinjau"
              : application.status === "DAFTAR_PENDEK"
              ? "Daftar Pendek"
              : application.status === "INTERVIEW"
              ? "Interview"
              : application.status === "DITERIMA"
              ? "Diterima"
              : application.status === "DITOLAK"
              ? "Ditolak"
              : application.status || "Tidak Diketahui"}
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200 group"
          title="Tutup Detail"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 group-hover:scale-110 transition-transform"
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
    </div>
  );
}
