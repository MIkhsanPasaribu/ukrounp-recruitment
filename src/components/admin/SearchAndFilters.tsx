"use client";

interface SearchAndFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

export default function SearchAndFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
}: SearchAndFiltersProps) {
  return (
    <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Cari berdasarkan nama, email, atau NIM..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto">
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="SEDANG_DITINJAU">Sedang Ditinjau</option>
            <option value="DAFTAR_PENDEK">Daftar Pendek</option>
            <option value="INTERVIEW">Interview</option>
            <option value="DITERIMA">Diterima</option>
            <option value="DITOLAK">Ditolak</option>
          </select>
        </div>
      </div>
    </div>
  );
}
