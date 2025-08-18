"use client";

import { ApplicationData, ApplicationStatus } from "@/types";
import { adminApi } from "@/services/adminApi";

interface MobileApplicationsViewProps {
  applications: ApplicationData[];
  selectedApplications: string[];
  selectAll: boolean;
  onSelectApplication: (id: string) => void;
  onSelectAll: () => void;
  onStatusUpdate: (id: string, status: ApplicationStatus) => void;
  onEditApplication: (application: ApplicationData) => void;
  onDelete: (id: string) => void;
  onShowDetail: (application: ApplicationData) => void;
}

export default function MobileApplicationsView({
  applications,
  selectedApplications,
  selectAll,
  onSelectApplication,
  onSelectAll,
  onStatusUpdate,
  onEditApplication,
  onDelete,
  onShowDetail,
}: MobileApplicationsViewProps) {
  const handleDownloadPDF = async (id: string) => {
    try {
      await adminApi.downloadPDF(id);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Gagal mendownload PDF");
    }
  };

  return (
    <div className="lg:hidden space-y-4 p-4">
      {/* Mobile Select All Controls */}
      <div className="bg-gray-100 rounded-lg p-3 flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={onSelectAll}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">
            {selectAll
              ? `Semua ${applications.length} data dipilih`
              : `Pilih semua (${applications.length} data)`}
          </span>
        </div>
        {selectedApplications.length > 0 && (
          <span className="text-xs text-indigo-600 font-medium">
            {selectedApplications.length} terpilih
          </span>
        )}
      </div>

      {applications.map((application) => (
        <div
          key={application.id}
          className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <input
                type="checkbox"
                checked={selectedApplications.includes(application.id)}
                onChange={() => onSelectApplication(application.id)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {application.fullName}
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  {application.email}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div>
              <span className="font-medium text-gray-500">NIM/NIA:</span>
              <p className="text-gray-900 truncate">
                {application.nim} - {application.nia}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Telepon:</span>
              <p className="text-gray-900 truncate">
                {application.phoneNumber}
              </p>
            </div>
            <div className="col-span-2">
              <span className="font-medium text-gray-500">Program:</span>
              <p className="text-gray-900 truncate">
                {application.studyProgram}
              </p>
            </div>
          </div>

          {/* Status dan Actions dalam satu baris */}
          <div className="flex items-center justify-between gap-2">
            <select
              value={application.status || "SEDANG_DITINJAU"}
              onChange={(e) =>
                onStatusUpdate(
                  application.id,
                  e.target.value as ApplicationStatus
                )
              }
              className={`px-2 py-1 rounded text-xs font-semibold border-0 focus:ring-1 focus:ring-indigo-500 ${
                application.status === "DITERIMA"
                  ? "bg-green-100 text-green-800"
                  : application.status === "DITOLAK"
                  ? "bg-red-100 text-red-800"
                  : application.status === "INTERVIEW"
                  ? "bg-blue-100 text-blue-800"
                  : application.status === "DAFTAR_PENDEK"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              <option value="SEDANG_DITINJAU">Sedang Ditinjau</option>
              <option value="DAFTAR_PENDEK">Daftar Pendek</option>
              <option value="INTERVIEW">Interview</option>
              <option value="DITERIMA">Diterima</option>
              <option value="DITOLAK">Ditolak</option>
            </select>

            {/* Mobile Actions Dropdown */}
            <div className="relative">
              <select
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "detail") {
                    onShowDetail(application);
                  } else if (value === "pdf") {
                    handleDownloadPDF(application.id);
                  } else if (value === "edit") {
                    onEditApplication(application);
                  } else if (value === "delete") {
                    if (
                      confirm(
                        `Apakah Anda yakin ingin menghapus data pendaftaran ${application.fullName}?`
                      )
                    ) {
                      onDelete(application.id);
                    }
                  }
                  e.target.value = "";
                }}
                className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                defaultValue=""
              >
                <option value="">Aksi</option>
                <option value="detail">📋 Lihat Detail</option>
                <option value="pdf">📄 Download PDF</option>
                <option value="edit">✏️ Edit Data</option>
                <option value="delete">🗑️ Hapus</option>
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
