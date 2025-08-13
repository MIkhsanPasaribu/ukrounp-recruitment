"use client";

import { useState } from "react";

interface WhatsAppVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ApplicationData {
  fullName: string;
  email: string;
  status: string;
}

export default function WhatsAppVerificationModal({
  isOpen,
  onClose,
}: WhatsAppVerificationModalProps) {
  const [step, setStep] = useState<"email" | "birthdate" | "verified">("email");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [applicationData, setApplicationData] =
    useState<ApplicationData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Status mapping untuk display
  const statusDisplayMap: Record<string, string> = {
    SEDANG_DITINJAU: "Sedang Ditinjau",
    DAFTAR_PENDEK: "Masuk Daftar Pendek",
    INTERVIEW: "Interview",
    DITERIMA: "Diterima",
    DITOLAK: "Ditolak",
    // Legacy support
    UNDER_REVIEW: "Sedang Ditinjau",
    SHORTLISTED: "Masuk Daftar Pendek",
    ACCEPTED: "Diterima",
    REJECTED: "Ditolak",
  };

  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/verify-whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          step: "check_email",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setApplicationData(data.data);
        setStep("birthdate");
      } else {
        setErrorMessage(data.message);
      }
    } catch {
      setErrorMessage("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleBirthdateVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/verify-whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          birthDate,
          step: "verify_birthdate",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setApplicationData(data.data);
        setStep("verified");
      } else {
        setErrorMessage(data.message);
      }
    } catch {
      setErrorMessage("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    window.open(
      "https://chat.whatsapp.com/JosrQEBvJF29qktEmhDvhS?mode=ac_t",
      "_blank"
    );
    handleClose();
  };

  const handleClose = () => {
    setStep("email");
    setEmail("");
    setBirthDate("");
    setApplicationData(null);
    setErrorMessage("");
    setLoading(false);
    onClose();
  };

  const handleBack = () => {
    if (step === "birthdate") {
      setStep("email");
      setBirthDate("");
    }
    setErrorMessage("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            {step === "email" && "Verifikasi Data Pendaftar"}
            {step === "birthdate" && "Verifikasi Tanggal Lahir"}
            {step === "verified" && "Verifikasi Berhasil!"}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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

        <div className="p-6">
          {step === "email" && (
            <>
              <p className="text-gray-600 mb-6">
                Untuk bergabung ke grup WhatsApp UKRO, masukkan email yang
                digunakan saat mendaftar.
              </p>

              <form onSubmit={handleEmailCheck} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Masukkan email Anda"
                    required
                  />
                </div>

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{errorMessage}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Mencari..." : "Cek Email"}
                  </button>
                </div>
              </form>
            </>
          )}

          {step === "birthdate" && (
            <>
              <div className="mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-green-800 text-sm">
                    ✓ Email ditemukan:{" "}
                    <strong>{applicationData?.fullName}</strong>
                  </p>
                  <p className="text-green-600 text-xs mt-1">
                    Status:{" "}
                    {statusDisplayMap[applicationData?.status || ""] ||
                      applicationData?.status}
                  </p>
                </div>
                <p className="text-gray-600">
                  Silakan masukkan tanggal lahir Anda untuk verifikasi
                  identitas.
                </p>
              </div>

              <form
                onSubmit={handleBirthdateVerification}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="birthDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    id="birthDate"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{errorMessage}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Memverifikasi..." : "Verifikasi"}
                  </button>
                </div>
              </form>
            </>
          )}

          {step === "verified" && (
            <>
              <div className="text-center mb-6">
                <svg
                  className="mx-auto h-16 w-16 text-green-500 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Halo, {applicationData?.fullName}!
                </h4>
                <p className="text-gray-600 mb-2">
                  Data Anda berhasil diverifikasi. Sekarang Anda dapat bergabung
                  dengan grup WhatsApp UKRO UNP.
                </p>
                <p className="text-sm text-green-600">
                  Status Pendaftaran:{" "}
                  {statusDisplayMap[applicationData?.status || ""] ||
                    applicationData?.status}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Nanti Saja
                </button>
                <button
                  onClick={handleWhatsAppRedirect}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787" />
                  </svg>
                  Gabung WhatsApp
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
