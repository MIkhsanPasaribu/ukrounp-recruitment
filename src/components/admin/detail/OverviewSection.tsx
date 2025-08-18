"use client";

import { ApplicationData } from "@/types";

interface OverviewSectionProps {
  application: ApplicationData;
  onStatusChange?: (
    status:
      | "SEDANG_DITINJAU"
      | "DAFTAR_PENDEK"
      | "INTERVIEW"
      | "DITERIMA"
      | "DITOLAK"
  ) => void;
  isUpdating?: boolean;
}

export default function OverviewSection({
  application,
  onStatusChange,
  isUpdating = false,
}: OverviewSectionProps) {
  const statusOptions = [
    { value: "SEDANG_DITINJAU", label: "Sedang Ditinjau", color: "yellow" },
    { value: "DAFTAR_PENDEK", label: "Masuk Daftar Pendek", color: "blue" },
    { value: "INTERVIEW", label: "Interview", color: "purple" },
    { value: "DITERIMA", label: "Diterima", color: "green" },
    { value: "DITOLAK", label: "Ditolak", color: "red" },
  ] as const;

  const currentStatus =
    statusOptions.find((s) => s.value === application.status) ||
    statusOptions[0];

  return (
    <div className="space-y-6">
      {/* Status Management */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
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
          Status Pendaftaran
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Saat Ini
            </label>
            <div
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                currentStatus.color === "green"
                  ? "bg-green-50 border-green-200"
                  : currentStatus.color === "red"
                  ? "bg-red-50 border-red-200"
                  : currentStatus.color === "blue"
                  ? "bg-blue-50 border-blue-200"
                  : currentStatus.color === "purple"
                  ? "bg-purple-50 border-purple-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  currentStatus.color === "green"
                    ? "bg-green-500"
                    : currentStatus.color === "red"
                    ? "bg-red-500"
                    : currentStatus.color === "blue"
                    ? "bg-blue-500"
                    : currentStatus.color === "purple"
                    ? "bg-purple-500"
                    : "bg-yellow-500"
                }`}
              ></div>
              <span className="font-medium text-gray-900">
                {currentStatus.label}
              </span>
            </div>
          </div>

          {/* Status Update */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubah Status
            </label>
            <select
              value={application.status || "SEDANG_DITINJAU"}
              onChange={(e) => {
                const newStatus = e.target.value as
                  | "SEDANG_DITINJAU"
                  | "DAFTAR_PENDEK"
                  | "INTERVIEW"
                  | "DITERIMA"
                  | "DITOLAK";
                onStatusChange?.(newStatus);
              }}
              disabled={isUpdating || !onStatusChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Personal Info Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-blue-600"
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
            <h4 className="font-medium text-gray-900">Data Pribadi</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-900">
                {application.fullName}
              </span>
              <br />
              <span className="text-gray-600">
                {application.nickname && `(${application.nickname})`}
              </span>
            </div>
            <div className="text-gray-600">📧 {application.email}</div>
            <div className="text-gray-600">📱 {application.phoneNumber}</div>
          </div>
        </div>

        {/* Academic Info Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900">Data Akademik</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-900">
                {application.faculty}
              </span>
            </div>
            <div className="text-gray-600">{application.department}</div>
            <div className="text-gray-600">{application.studyProgram}</div>
            {application.nim && (
              <div className="text-gray-600 font-mono">
                NIM: {application.nim}
              </div>
            )}
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900">Info Tambahan</h4>
          </div>
          <div className="space-y-2 text-sm">
            {application.nia && (
              <div>
                <span className="text-gray-600">NIA: </span>
                <span className="font-mono font-medium text-blue-600">
                  {application.nia}
                </span>
              </div>
            )}
            {application.birthDate && (
              <div className="text-gray-600">
                🎂 {new Date(application.birthDate).toLocaleDateString("id-ID")}
              </div>
            )}
            {application.gender && (
              <div className="text-gray-600">
                👤{" "}
                {application.gender === "LAKI_LAKI"
                  ? "Laki-laki"
                  : application.gender === "PEREMPUAN"
                  ? "Perempuan"
                  : "Tidak diketahui"}
              </div>
            )}
            <div className="text-gray-600">📍 {application.padangAddress}</div>
          </div>
        </div>
      </div>

      {/* Timeline / History (Placeholder for future enhancement) */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-600"
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
          Timeline Pendaftaran
        </h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                Pendaftaran Diterima
              </p>
              <p className="text-xs text-green-600">
                {application.submittedAt
                  ? new Date(application.submittedAt).toLocaleString("id-ID")
                  : "Waktu tidak tersedia"}
              </p>
            </div>
          </div>

          {application.status !== "SEDANG_DITINJAU" && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">
                  Status Diperbarui: {currentStatus.label}
                </p>
                <p className="text-xs text-blue-600">
                  Sistem akan melacak perubahan status di masa mendatang
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
