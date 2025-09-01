import { useState, useEffect, useCallback, useMemo } from "react";
import { InterviewerUser, InterviewCandidate } from "@/types/interview";
import { interviewerApi } from "@/services/interviewerApi";
import { useDebounce, useQueryCache } from "@/hooks/useOptimizedInterview";

interface Props {
  token: string;
  interviewer: InterviewerUser;
  onStartInterview: (sessionId: string) => void;
  onLogout: () => void;
}

export default function OptimizedInterviewerDashboard({
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
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search term untuk menghindari terlalu banyak API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Cache untuk menyimpan hasil query
  const { getCachedData, setCachedData, clearCache } = useQueryCache<{
    data: InterviewCandidate[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasMore: boolean;
    };
  }>();

  // Generate cache key
  const getCacheKey = useCallback((page: number, search: string) => {
    return `candidates-${page}-${search}`;
  }, []);

  // Fetch candidates dengan optimasi
  const fetchCandidates = useCallback(
    async (page = 1, search = "", useCache = true) => {
      try {
        const cacheKey = getCacheKey(page, search);

        // Check cache first
        if (useCache) {
          const cachedData = getCachedData(cacheKey);
          if (cachedData) {
            setCandidates(cachedData.data);
            setTotalPages(cachedData.pagination.totalPages);
            setCurrentPage(page);
            setLoading(false);
            return;
          }
        }

        setLoading(true);
        setIsSearching(!!search);

        // Use lightweight mode for search to improve performance
        const isLightweight = !!search;

        const response = await interviewerApi.fetchCandidates(
          token,
          page,
          10,
          search,
          isLightweight
        );

        if (response.success && response.data) {
          setCandidates(response.data);
          setTotalPages(response.pagination?.totalPages || 1);
          setCurrentPage(page);

          // Cache the result
          setCachedData(cacheKey, {
            data: response.data,
            pagination: response.pagination,
          });
        } else {
          setError("Gagal mengambil data peserta");
        }
      } catch (err) {
        console.error("Error fetching candidates:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    [token, getCacheKey, getCachedData, setCachedData]
  );

  // Effect untuk fetch initial data
  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // Effect untuk debounced search
  useEffect(() => {
    if (debouncedSearchTerm) {
      fetchCandidates(1, debouncedSearchTerm);
    } else if (searchTerm === "" && debouncedSearchTerm === "") {
      fetchCandidates(1, "");
    }
  }, [debouncedSearchTerm, fetchCandidates, searchTerm]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle pagination
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        fetchCandidates(newPage, debouncedSearchTerm);
      }
    },
    [fetchCandidates, totalPages, debouncedSearchTerm]
  );

  // Handle create session dengan optimasi
  const handleCreateSession = useCallback(
    async (applicantId: string) => {
      try {
        const sessionData = {
          applicantId,
          interviewDate: new Date().toISOString(),
          location: "Online/Offline",
          notes: "Sesi wawancara dibuat otomatis",
        };

        const response = await interviewerApi.createSession(token, sessionData);

        if (response.success && response.data) {
          // Clear cache untuk refresh data
          clearCache();

          // Refresh current page data
          await fetchCandidates(currentPage, debouncedSearchTerm, false);

          // Navigate to interview form
          onStartInterview(response.data.id);

          alert("Sesi wawancara berhasil dibuat!");
        } else {
          alert(response.message || "Gagal membuat sesi wawancara");
        }
      } catch (err) {
        console.error("Error creating session:", err);
        alert(err instanceof Error ? err.message : "Terjadi kesalahan");
      }
    },
    [
      token,
      clearCache,
      fetchCandidates,
      currentPage,
      debouncedSearchTerm,
      onStartInterview,
    ]
  );

  // Handle logout
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

  // Memoized candidate list untuk performa
  const candidateList = useMemo(() => {
    return candidates.map((candidate) => (
      <tr key={candidate.id}>
        <td className="px-6 py-4 whitespace-nowrap">
          <div>
            <div className="text-sm font-medium text-gray-900">
              {candidate.fullName}
            </div>
            {candidate.nickname && (
              <div className="text-sm text-gray-500">
                ({candidate.nickname})
              </div>
            )}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {candidate.email || "N/A"}
          </div>
          <div className="text-sm text-gray-500">
            {candidate.phoneNumber || "N/A"}
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
              onClick={() => handleCreateSession(candidate.id)}
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
    ));
  }, [candidates, onStartInterview, handleCreateSession]);

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
              {isSearching && (
                <span className="ml-2 text-sm text-blue-600">(Mencari...)</span>
              )}
            </h2>
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama, email, NIM, atau NIA..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
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
                  {searchTerm
                    ? `Tidak ada peserta ditemukan untuk pencarian "${searchTerm}"`
                    : "Tidak ada peserta dengan status interview ditemukan"}
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
                      {candidateList}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Optimized Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sebelumnya
                      </button>

                      {/* Page numbers */}
                      {Array.from(
                        { length: Math.min(totalPages, 5) },
                        (_, i) => {
                          const pageNum = Math.max(1, currentPage - 2) + i;
                          if (pageNum > totalPages) return null;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${
                                pageNum === currentPage
                                  ? "bg-indigo-600 border-indigo-600 text-white"
                                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Selanjutnya
                      </button>
                    </div>

                    <span className="text-sm text-gray-700">
                      Halaman {currentPage} dari {totalPages}
                    </span>
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
