"use client";

import { useState } from "react";

interface AdminHeaderButtonsProps {
  hasApplications: boolean;
  onExportCSV: () => void;
  onBulkDownloadPDF?: () => void;
  onLogout: () => void;
}

export default function AdminHeaderButtons({
  hasApplications,
  onExportCSV,
  onBulkDownloadPDF,
  onLogout,
}: AdminHeaderButtonsProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop buttons - hidden on mobile */}
      <div className="hidden md:flex space-x-4">
        <button
          onClick={onExportCSV}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          disabled={!hasApplications}
        >
          Export ke CSV
        </button>

        {hasApplications && onBulkDownloadPDF && (
          <button
            onClick={onBulkDownloadPDF}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium flex items-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download Semua PDF
          </button>
        )}

        {/* Alternative download method for testing */}
        {hasApplications && (
          <button
            onClick={() => {
              window.open("/api/admin/bulk-download-pdf-alt", "_blank");
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium flex items-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download Semua Formulir
          </button>
        )}

        <button
          onClick={onLogout}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium"
        >
          Logout
        </button>
      </div>

      {/* Mobile menu button - visible only on mobile */}
      <div className="md:hidden">
        <button
          className="bg-gray-200 p-2 rounded-md"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="absolute right-4 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
            <div className="py-1">
              <button
                onClick={() => {
                  onExportCSV();
                  setMobileMenuOpen(false);
                }}
                disabled={!hasApplications}
                className="w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-100 disabled:text-gray-400 disabled:hover:bg-white"
              >
                Export ke CSV
              </button>

              {hasApplications && onBulkDownloadPDF && (
                <button
                  onClick={() => {
                    onBulkDownloadPDF();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-purple-700 hover:bg-purple-100"
                >
                  Download Semua PDF
                </button>
              )}

              {hasApplications && (
                <button
                  onClick={() => {
                    window.open("/api/admin/bulk-download-pdf-alt", "_blank");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-100"
                >
                  Download Semua Formulir
                </button>
              )}

              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
