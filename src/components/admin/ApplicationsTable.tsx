"use client";

import { ApplicationData, ApplicationStatus } from "@/types";
import { adminApi } from "@/services/adminApi";

interface ApplicationsTableProps {
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

export default function ApplicationsTable({
  applications,
  selectedApplications,
  selectAll,
  onSelectApplication,
  onSelectAll,
  onStatusUpdate,
  onEditApplication,
  onDelete,
  onShowDetail,
}: ApplicationsTableProps) {
  const handleDownloadPDF = async (id: string) => {
    try {
      await adminApi.downloadPDF(id);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Gagal mendownload PDF");
    }
  };

  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={onSelectAll}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pendaftar
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kontak
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Akademik
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {applications.map((application) => (
            <tr key={application.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedApplications.includes(application.id)}
                  onChange={() => onSelectApplication(application.id)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {application.fullName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {application.nickname}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{application.email}</div>
                <div className="text-sm text-gray-500">
                  {application.phoneNumber}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {application.nim} - {application.nia}
                </div>
                <div className="text-sm text-gray-500">
                  {application.faculty} - {application.studyProgram}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  value={application.status || "SEDANG_DITINJAU"}
                  onChange={(e) =>
                    onStatusUpdate(
                      application.id,
                      e.target.value as ApplicationStatus
                    )
                  }
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
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
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex flex-col space-y-1">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onShowDetail(application)}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      title="Lihat Detail"
                    >
                      Lihat
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(application.id)}
                      className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                      title="Download PDF"
                    >
                      PDF
                    </button>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onEditApplication(application)}
                      className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                      title="Edit Data"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(application.id)}
                      className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                      title="Hapus Data"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
