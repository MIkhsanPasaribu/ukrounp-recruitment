"use client";

import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (pageNumber: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="mt-4 flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
      {/* Info dan Items per page */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <span className="text-sm text-gray-700 text-center sm:text-left">
          Menampilkan {totalItems > 0 ? indexOfFirstItem : 0} sampai{" "}
          {indexOfLastItem} dari {totalItems} data
        </span>
        <select
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-auto"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        >
          <option value={10}>10 per halaman</option>
          <option value={25}>25 per halaman</option>
          <option value={50}>50 per halaman</option>
          <option value={100}>100 per halaman</option>
        </select>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-center items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-2 text-sm rounded-md ${
            currentPage === 1
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-indigo-500 text-white hover:bg-indigo-600"
          }`}
        >
          <span className="sm:hidden">‹</span>
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        {/* Mobile page indicator */}
        <div className="sm:hidden flex items-center px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-md">
          {currentPage} / {totalPages}
        </div>

        {/* Desktop page numbers */}
        <div className="hidden sm:flex">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-2 text-sm rounded-md ${
                  currentPage === pageNum
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`px-3 py-2 text-sm rounded-md ${
            currentPage === totalPages || totalPages === 0
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-indigo-500 text-white hover:bg-indigo-600"
          }`}
        >
          <span className="sm:hidden">›</span>
          <span className="hidden sm:inline">Selanjutnya</span>
        </button>
      </div>
    </div>
  );
}
