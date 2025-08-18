"use client";

import { ApplicationStatus } from "@/types";

interface BulkActionsProps {
  selectedApplicationsCount: number;
  onClearSelection: () => void;
  onBulkStatusUpdate: (status: ApplicationStatus) => void;
  onBulkExportCSV: () => void;
  onBulkDownloadPDF: () => void;
}

export default function BulkActions({
  selectedApplicationsCount,
  onClearSelection,
  onBulkStatusUpdate,
  onBulkExportCSV,
  onBulkDownloadPDF,
}: BulkActionsProps) {
  if (selectedApplicationsCount === 0) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">
            {selectedApplicationsCount} pendaftaran dipilih
          </span>
          <button
            onClick={onClearSelection}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Batal Pilih
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Bulk Status Update Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">
              Ubah Status:
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onBulkStatusUpdate(e.target.value as ApplicationStatus);
                  e.target.value = ""; // Reset dropdown
                }
              }}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm min-w-[140px]"
              defaultValue=""
            >
              <option value="">Pilih Status</option>
              <option value="SEDANG_DITINJAU">Sedang Ditinjau</option>
              <option value="DAFTAR_PENDEK">Daftar Pendek</option>
              <option value="INTERVIEW">Interview</option>
              <option value="DITERIMA">Diterima</option>
              <option value="DITOLAK">Ditolak</option>
            </select>
          </div>

          {/* Other Bulk Actions */}
          <div className="flex gap-2">
            <button
              onClick={onBulkExportCSV}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm whitespace-nowrap"
            >
              Ekspor Terpilih
            </button>
            <button
              onClick={onBulkDownloadPDF}
              className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm whitespace-nowrap"
            >
              Download PDF Terpilih
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
