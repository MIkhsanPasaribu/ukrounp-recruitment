"use client";

import React, { useState } from "react";

interface RegistrationStatusToggleProps {
  isOpen: boolean;
  isLoading: boolean;
  onToggle: () => void;
}

export default function RegistrationStatusToggle({
  isOpen,
  isLoading,
  onToggle,
}: RegistrationStatusToggleProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleToggleClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    setShowConfirmDialog(false);
    onToggle();
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      {/* Toggle Button */}
      <div className="relative">
        <button
          onClick={handleToggleClick}
          disabled={isLoading}
          className={`
            relative inline-flex items-center px-6 py-3 rounded-xl font-semibold text-sm
            transition-all duration-200 transform hover:scale-105 
            focus:outline-none focus:ring-4 focus:ring-opacity-50
            ${
              isOpen
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white focus:ring-red-300"
                : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white focus:ring-green-300"
            }
            ${
              isLoading
                ? "opacity-75 cursor-not-allowed"
                : "shadow-lg hover:shadow-xl"
            }
          `}
        >
          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Button Content */}
          <div
            className={`flex items-center space-x-3 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
          >
            <div className="text-xl">{isOpen ? "🔓" : "🔒"}</div>
            <span>{isOpen ? "Tutup Pendaftaran" : "Buka Pendaftaran"}</span>
          </div>
        </button>

        {/* Status Indicator */}
        <div className="absolute -top-2 -right-2">
          <div
            className={`
              w-4 h-4 rounded-full border-2 border-white
              ${isOpen ? "bg-green-500 animate-pulse" : "bg-red-500"}
            `}
            title={isOpen ? "Pendaftaran Terbuka" : "Pendaftaran Tertutup"}
          ></div>
        </div>
      </div>

      {/* Status Info Card */}
      <div
        className={`
        ml-4 px-4 py-2 rounded-lg text-sm font-medium
        ${
          isOpen
            ? "bg-green-100 text-green-800 border border-green-200"
            : "bg-red-100 text-red-800 border border-red-200"
        }
      `}
      >
        <div className="flex items-center space-x-2">
          <div className="text-base">{isOpen ? "✅" : "❌"}</div>
          <span>
            Status: {isOpen ? "Pendaftaran Terbuka" : "Pendaftaran Ditutup"}
          </span>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div
              className={`
              px-6 py-4 text-white
              ${
                isOpen
                  ? "bg-gradient-to-r from-red-500 to-red-600"
                  : "bg-gradient-to-r from-green-500 to-green-600"
              }
            `}
            >
              <h3 className="text-lg font-semibold flex items-center">
                <span className="text-2xl mr-3">{isOpen ? "🔒" : "🔓"}</span>
                Konfirmasi Perubahan Status
              </h3>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Apakah Anda yakin ingin{" "}
                  <strong
                    className={isOpen ? "text-red-600" : "text-green-600"}
                  >
                    {isOpen ? "menutup" : "membuka"}
                  </strong>{" "}
                  pendaftaran?
                </p>

                <div
                  className={`
                  p-4 rounded-lg border-l-4
                  ${
                    isOpen
                      ? "bg-red-50 border-red-400 text-red-700"
                      : "bg-green-50 border-green-400 text-green-700"
                  }
                `}
                >
                  <div className="text-sm">
                    <strong>Dampak perubahan:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {isOpen ? (
                        <>
                          <li>Pendaftar baru tidak dapat mengakses formulir</li>
                          <li>
                            Halaman pendaftaran akan menampilkan pesan
                            &quot;Ditutup&quot;
                          </li>
                          <li>Proses seleksi dapat dimulai</li>
                        </>
                      ) : (
                        <>
                          <li>Pendaftar baru dapat mengakses formulir</li>
                          <li>Halaman pendaftaran akan aktif kembali</li>
                          <li>Data baru akan mulai masuk</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  ❌ Batal
                </button>
                <button
                  onClick={handleConfirm}
                  className={`
                    flex-1 px-4 py-3 rounded-lg font-medium text-white transition-colors
                    ${
                      isOpen
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }
                  `}
                >
                  ✅ {isOpen ? "Tutup Pendaftaran" : "Buka Pendaftaran"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
