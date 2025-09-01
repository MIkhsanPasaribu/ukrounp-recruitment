import { useState, useEffect, useCallback } from "react";
import { InterviewerUser, InterviewCandidate } from "@/types/interview";
import { interviewerApi } from "@/services/interviewerApi";

interface Props {
  token: string;
  interviewer: InterviewerUser;
  onStartInterview: (sessionId: string) => void;
  onLogout: () => void;
}

export default function InterviewerDashboard({
  token,
  interviewer,
  onStartInterview,
  onLogout,
}: Props) {
  const [candidates, setCandidates] = useState<InterviewCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCandidates(1, searchTerm);
  };

  const handleCreateSession = async (applicantId: string) => {
    try {
      const sessionData = {
        applicantId,
        interviewDate: new Date().toISOString(),
        location: "Online/Offline",
        notes: "Sesi wawancara dibuat otomatis",
      };

      const response = await interviewerApi.createSession(token, sessionData);

      if (response.success && response.data) {
        alert("Sesi wawancara berhasil dibuat!");
        // Refresh candidates data to show updated status
        await fetchCandidates(currentPage, searchTerm);
        // Navigate to interview form
        onStartInterview(response.data.id);
      } else {
        alert(response.message || "Gagal membuat sesi wawancara");
      }
    } catch (err) {
      console.error("Error creating session:", err);
      alert(err instanceof Error ? err.message : "Terjadi kesalahan");
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
          {/* Search Section */}
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

          {/* Candidates List */}
          {!loading && (
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
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {candidate.interviewStatus}
                                </span>
                                {candidate.totalScore && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Skor: {candidate.totalScore}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Belum dijadwalkan
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {candidate.sessionId ? (
                              // Jika sudah ada session, tampilkan tombol mulai wawancara
                              <button
                                onClick={() => {
                                  onStartInterview(candidate.sessionId!);
                                }}
                                className="text-green-600 hover:text-green-900 mr-4 bg-green-50 hover:bg-green-100 px-3 py-1 rounded"
                              >
                                Mulai Wawancara
                              </button>
                            ) : (
                              // Jika belum ada session, tampilkan tombol buat sesi
                              <button
                                onClick={() =>
                                  handleCreateSession(candidate.id)
                                }
                                className="text-indigo-600 hover:text-indigo-900 mr-4 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded"
                              >
                                Buat Sesi Wawancara
                              </button>
                            )}
                            <button
                              onClick={() => {
                                /* View details */
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Lihat Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() =>
                        fetchCandidates(currentPage - 1, searchTerm)
                      }
                      disabled={currentPage <= 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sebelumnya
                    </button>
                    <span className="text-sm text-gray-700">
                      Halaman {currentPage} dari {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        fetchCandidates(currentPage + 1, searchTerm)
                      }
                      disabled={currentPage >= totalPages}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
