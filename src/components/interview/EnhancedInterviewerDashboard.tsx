"use client";

import { useState, useEffect, useCallback } from "react";
import {
  InterviewerUser,
  InterviewCandidate,
  InterviewSession,
} from "@/types/interview";
import { interviewerApi } from "@/services/interviewerApi";
import InterviewForm from "./InterviewForm";

interface Props {
  token: string;
  interviewer: InterviewerUser;
  onLogout: () => void;
}

type TabType = "candidates" | "history" | "interview";

export default function EnhancedInterviewerDashboard({
  token,
  interviewer,
  onLogout,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("candidates");
  const [candidates, setCandidates] = useState<InterviewCandidate[]>([]);
  const [interviewHistory, setInterviewHistory] = useState<InterviewSession[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  // Fetch candidates
  const fetchCandidates = useCallback(
    async (page = 1, search = "") => {
      try {
        setLoading(true);
        const response = await interviewerApi.fetchCandidates(
          token,
          page,
          10,
          search
        );

        if (response.success && response.data) {
          setCandidates(response.data);
          setTotalPages(response.pagination?.totalPages || 1);
          setCurrentPage(page);
        } else {
          setError("Gagal mengambil data peserta");
        }
      } catch (err) {
        console.error("Error fetching candidates:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Fetch interview history
  const fetchInterviewHistory = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const response = await interviewerApi.getInterviewHistory(
          token,
          page,
          10,
          "all"
        );

        if (response.success && response.data) {
          setInterviewHistory(response.data);
          setTotalPages(response.pagination?.totalPages || 1);
          setCurrentPage(page);
        } else {
          setError("Gagal mengambil riwayat wawancara");
        }
      } catch (err) {
        console.error("Error fetching history:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (activeTab === "candidates") {
      fetchCandidates();
    } else if (activeTab === "history") {
      fetchInterviewHistory();
    }
  }, [activeTab, fetchCandidates, fetchInterviewHistory]);

  const handleCreateSession = async (applicantId: string) => {
    try {
      const response = await interviewerApi.createSession(token, {
        applicantId,
        interviewDate: new Date().toISOString(),
        location: "Online/Virtual",
        notes: "Sesi dibuat oleh pewawancara",
      });

      if (response.success) {
        alert("Sesi wawancara berhasil dibuat!");
        fetchCandidates(currentPage, searchTerm);
      } else {
        alert("Gagal membuat sesi wawancara");
      }
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Terjadi kesalahan saat membuat sesi");
    }
  };

  const handleStartInterview = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setActiveTab("interview");
  };

  const handleEditInterview = (sessionId: string) => {
    setEditingSessionId(sessionId);
    setCurrentSessionId(sessionId);
    setActiveTab("interview");
  };

  const handleBackFromInterview = () => {
    setCurrentSessionId(null);
    setEditingSessionId(null);
    setActiveTab("candidates");
  };

  const handleCompleteInterview = () => {
    setCurrentSessionId(null);
    setEditingSessionId(null);
    setActiveTab("history");
    fetchInterviewHistory();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "candidates") {
      fetchCandidates(1, searchTerm);
    }
  };

  const handleDownloadPDF = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/interview/download-pdf/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengunduh PDF");
      }

      const contentDisposition = response.headers.get("content-disposition");
      let filename = "hasil-wawancara.pdf";

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      alert(err instanceof Error ? err.message : "Gagal mengunduh PDF");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/interview/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      onLogout();
    }
  };

  // Show interview form
  if (activeTab === "interview" && currentSessionId) {
    return (
      <InterviewForm
        token={token}
        sessionId={currentSessionId}
        isEditing={!!editingSessionId}
        onBack={handleBackFromInterview}
        onComplete={handleCompleteInterview}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Pewawancara
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Selamat datang, {interviewer.fullName}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {interviewer.role === "HEAD_INTERVIEWER"
                  ? "Ketua Pewawancara"
                  : "Pewawancara"}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("candidates")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "candidates"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Daftar Peserta
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "history"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Riwayat Wawancara
              </button>
            </nav>
          </div>

          {/* Search Section (only for candidates tab) */}
          {activeTab === "candidates" && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Cari Peserta Wawancara
              </h2>
              <form onSubmit={handleSearch} className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama, email, NIM, atau NIA..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium"
                >
                  Cari
                </button>
              </form>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <div className="animate-spin mx-auto h-8 w-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
              <p className="mt-2 text-gray-500">Memuat data...</p>
            </div>
          )}

          {/* Content based on active tab */}
          {!loading && activeTab === "candidates" && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Daftar Peserta ({candidates.length} peserta)
                </h2>
              </div>

              {candidates.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Tidak ada peserta dengan status interview ditemukan
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Peserta
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kontak
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Akademik
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status Wawancara
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {candidates.map((candidate) => (
                        <tr key={candidate.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {candidate.fullName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {candidate.nickname &&
                                  `(${candidate.nickname})`}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {candidate.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              {candidate.phoneNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {candidate.faculty} - {candidate.department}
                            </div>
                            <div className="text-sm text-gray-500">
                              NIM: {candidate.nim} | NIA: {candidate.nia}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {candidate.hasInterview ? (
                              <div>
                                {candidate.sessionStatus === "COMPLETED" ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    Selesai Wawancara
                                  </span>
                                ) : candidate.sessionStatus ===
                                  "IN_PROGRESS" ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Sedang Berlangsung
                                  </span>
                                ) : candidate.sessionId ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Siap Wawancara
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Perlu Sesi Baru
                                  </span>
                                )}
                                {candidate.totalScore && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Skor: {candidate.totalScore}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Belum dijadwalkan
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex flex-col space-y-2">
                              {candidate.sessionId ? (
                                candidate.sessionStatus === "COMPLETED" ? (
                                  <div className="flex flex-col space-y-1">
                                    <button
                                      onClick={() =>
                                        handleDownloadPDF(candidate.sessionId!)
                                      }
                                      className="text-purple-600 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded text-center text-xs"
                                    >
                                      Download PDF
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleEditInterview(
                                          candidate.sessionId!
                                        )
                                      }
                                      className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded text-center text-xs"
                                    >
                                      Edit Hasil
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      handleStartInterview(
                                        candidate.sessionId!
                                      );
                                    }}
                                    className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded text-center"
                                  >
                                    {candidate.sessionStatus === "IN_PROGRESS"
                                      ? "Lanjutkan Wawancara"
                                      : "Mulai Wawancara"}
                                  </button>
                                )
                              ) : (
                                <button
                                  onClick={() =>
                                    handleCreateSession(candidate.id)
                                  }
                                  className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded text-center"
                                >
                                  Buat Sesi Wawancara
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Interview History Tab */}
          {!loading && activeTab === "history" && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Riwayat Wawancara ({interviewHistory.length} wawancara)
                </h2>
              </div>

              {interviewHistory.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Belum ada riwayat wawancara
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Peserta
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Skor & Rekomendasi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {interviewHistory.map((session) => (
                        <tr key={session.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {session.applicants?.fullName || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {session.applicants?.email || "N/A"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {session.interviewDate
                                ? new Date(
                                    session.interviewDate
                                  ).toLocaleDateString("id-ID")
                                : "Belum dijadwalkan"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {session.location || "Online"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                session.status === "COMPLETED"
                                  ? "bg-green-100 text-green-800"
                                  : session.status === "IN_PROGRESS"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {session.status === "COMPLETED"
                                ? "Selesai"
                                : session.status === "IN_PROGRESS"
                                ? "Berlangsung"
                                : "Dijadwalkan"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900">
                                Skor: {session.totalScore || 0}
                              </div>
                              <div className="text-sm text-gray-500">
                                {session.recommendation || "Belum ada"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex flex-col space-y-1">
                              {session.status === "COMPLETED" && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleDownloadPDF(session.id)
                                    }
                                    className="text-purple-600 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded text-center text-xs"
                                  >
                                    Download PDF
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleEditInterview(session.id)
                                    }
                                    className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded text-center text-xs"
                                  >
                                    Edit Hasil
                                  </button>
                                </>
                              )}
                              {session.status !== "COMPLETED" && (
                                <button
                                  onClick={() =>
                                    handleStartInterview(session.id)
                                  }
                                  className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded text-center text-xs"
                                >
                                  {session.status === "IN_PROGRESS"
                                    ? "Lanjutkan"
                                    : "Mulai"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => {
                    const newPage = Math.max(1, currentPage - 1);
                    if (activeTab === "candidates") {
                      fetchCandidates(newPage, searchTerm);
                    } else {
                      fetchInterviewHistory(newPage);
                    }
                  }}
                  disabled={currentPage <= 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    const newPage = Math.min(totalPages, currentPage + 1);
                    if (activeTab === "candidates") {
                      fetchCandidates(newPage, searchTerm);
                    } else {
                      fetchInterviewHistory(newPage);
                    }
                  }}
                  disabled={currentPage >= totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Halaman <span className="font-medium">{currentPage}</span>{" "}
                    dari <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => {
                        const newPage = Math.max(1, currentPage - 1);
                        if (activeTab === "candidates") {
                          fetchCandidates(newPage, searchTerm);
                        } else {
                          fetchInterviewHistory(newPage);
                        }
                      }}
                      disabled={currentPage <= 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => {
                        const newPage = Math.min(totalPages, currentPage + 1);
                        if (activeTab === "candidates") {
                          fetchCandidates(newPage, searchTerm);
                        } else {
                          fetchInterviewHistory(newPage);
                        }
                      }}
                      disabled={currentPage >= totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
