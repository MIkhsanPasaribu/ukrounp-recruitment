"use client";

import { useState } from "react";
import Link from "next/link";

interface StatusResponse {
  success: boolean;
  application?: {
    id: string;
    email: string;
    fullName: string;
    status: string;
    submittedAt: string;
    birthDate: string;
  };
  message?: string;
}

export default function StatusPage() {
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  // Status mapping untuk display
  const statusDisplayMap: Record<string, string> = {
    SEDANG_DITINJAU: "Sedang Ditinjau",
    DAFTAR_PENDEK: "Masuk Daftar Pendek",
    INTERVIEW: "Interview",
    DITERIMA: "Diterima",
    DITOLAK: "Ditolak",
    // Legacy support untuk data lama
    UNDER_REVIEW: "Sedang Ditinjau",
    SHORTLISTED: "Masuk Daftar Pendek",
    ACCEPTED: "Diterima",
    REJECTED: "Ditolak",
  };

  const checkStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus(data);
      } else {
        setError(data.message || "Gagal mengambil status pendaftaran");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat mengecek status Anda");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!status?.application) return;

    setDownloading(true);
    setError("");

    try {
      const response = await fetch("/api/download-confirmation-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: status.application.email,
          birthDate: birthDate,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `surat-konfirmasi-${status.application.fullName.replace(
          /\s+/g,
          "-"
        )}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Gagal mendownload PDF");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat mendownload PDF");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      {/* Back button to landing page */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Home
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Cek Status Aplikasi</h1>

      <form
        onSubmit={checkStatus}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Alamat Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            placeholder="Masukkan email Anda"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={loading}
          >
            {loading ? "Mengecek..." : "Cek Status"}
          </button>
        </div>
      </form>

      {status?.application && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
          <h2 className="text-xl font-semibold mb-4">Status Aplikasi</h2>
          <div className="mb-4">
            <p className="text-sm text-gray-600">Nama:</p>
            <p className="font-medium">{status.application.fullName}</p>
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-600">Status:</p>
            <p className="font-medium">
              {statusDisplayMap[status.application.status] ||
                status.application.status}
            </p>
          </div>
          <div className="mb-6">
            <p className="text-sm text-gray-600">Dikirim pada:</p>
            <p className="font-medium">
              {new Date(status.application.submittedAt).toLocaleString()}
            </p>
          </div>

          {/* Download PDF Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              Download Surat Konfirmasi
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Untuk mendownload surat konfirmasi Anda, silakan masukkan tanggal
              lahir Anda untuk verifikasi.
            </p>

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="birthDate"
              >
                Tanggal Lahir
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />
            </div>

            <button
              onClick={downloadPDF}
              disabled={downloading || !birthDate}
              className="bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {downloading ? "Mendownload..." : "Download PDF"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
