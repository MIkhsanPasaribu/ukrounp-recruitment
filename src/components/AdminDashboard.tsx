import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface StatisticsData {
  totalApplications: number;
  statusCounts: Array<{ _id: string; count: number }>;
  facultyCounts: Array<{ _id: string; count: number }>;
  genderCounts: Array<{ _id: string; count: number }>;
  dailyApplications: Array<{ _id: string; count: number }>;
}

interface Props {
  token: string;
  admin?: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: string;
  };
  onLogout: () => void;
}

export default function AdminDashboard({ token, admin, onLogout }: Props) {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage and call onLogout
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminInfo");
      onLogout();
    }
  };

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/statistics", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Statistics API error:", {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          });

          if (response.status === 401) {
            // Token expired, logout user
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminInfo");
            onLogout();
            return;
          }

          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Statistics API response:", data);

        if (data.success && data.statistics) {
          setStatistics(data.statistics);
          setError("");
        } else if (data.error) {
          console.error("API returned error:", data);
          setError(data.error + (data.details ? `: ${data.details}` : ""));
        } else {
          console.error("Unexpected API response format:", data);
          setError("Format respons API tidak valid");
        }
      } catch (err) {
        console.error("Statistics fetch error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(`Gagal mengambil statistik: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [token, onLogout]);

  if (loading)
    return <div className="text-center py-10">Memuat statistik...</div>;
  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!statistics)
    return (
      <div className="text-center py-10">Data statistik tidak tersedia</div>
    );

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

  // Gender mapping untuk display
  const genderDisplayMap: Record<string, string> = {
    LAKI_LAKI: "Laki-laki",
    PEREMPUAN: "Perempuan",
    // Legacy support
    male: "Laki-laki",
    female: "Perempuan",
    MALE: "Laki-laki",
    FEMALE: "Perempuan",
  };

  // Prepare data for status chart
  const statusData = {
    labels: statistics.statusCounts.map(
      (item) => statusDisplayMap[item._id] || item._id || "Sedang Ditinjau"
    ),
    datasets: [
      {
        label: "Aplikasi berdasarkan Status",
        data: statistics.statusCounts.map((item) => item.count),
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 99, 132, 0.6)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 99, 132, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for faculty chart
  const facultyData = {
    labels: statistics.facultyCounts.map((item) => item._id),
    datasets: [
      {
        label: "Aplikasi berdasarkan Fakultas",
        data: statistics.facultyCounts.map((item) => item.count),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for gender chart
  const genderData = {
    labels: statistics.genderCounts.map(
      (item) => genderDisplayMap[item._id] || item._id
    ),
    datasets: [
      {
        label: "Aplikasi berdasarkan Jenis Kelamin",
        data: statistics.genderCounts.map((item) => item.count),
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for daily applications chart
  const dailyData = {
    labels: statistics.dailyApplications.map((item) => item._id),
    datasets: [
      {
        label: "Aplikasi Harian",
        data: statistics.dailyApplications.map((item) => item.count),
        fill: false,
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Admin Dashboard
                </h1>
                {admin && (
                  <p className="text-sm text-gray-500 hidden sm:block">
                    Welcome, {admin.fullName || admin.username}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {admin && (
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {admin.fullName || admin.username}
                  </p>
                  <p className="text-xs text-gray-500">{admin.role}</p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                <svg
                  className="h-4 w-4 sm:mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-4 sm:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Aplikasi
                    </dt>
                    <dd className="text-lg sm:text-xl font-semibold text-gray-900">
                      {statistics.totalApplications}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-4 sm:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-white"
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
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Diterima
                    </dt>
                    <dd className="text-lg sm:text-xl font-semibold text-gray-900">
                      {statistics.statusCounts.find((s) =>
                        ["DITERIMA", "ACCEPTED"].includes(s._id)
                      )?.count || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-4 sm:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Sedang Ditinjau
                    </dt>
                    <dd className="text-lg sm:text-xl font-semibold text-gray-900">
                      {statistics.statusCounts.find((s) =>
                        ["SEDANG_DITINJAU", "UNDER_REVIEW"].includes(s._id)
                      )?.count || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-4 sm:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Fakultas Terdaftar
                    </dt>
                    <dd className="text-lg sm:text-xl font-semibold text-gray-900">
                      {statistics.facultyCounts.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Aplikasi berdasarkan Status
            </h3>
            <div className="h-64 sm:h-80">
              <Pie
                data={statusData}
                options={{ maintainAspectRatio: false, responsive: true }}
              />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Aplikasi berdasarkan Fakultas
            </h3>
            <div className="h-64 sm:h-80">
              <Bar
                data={facultyData}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0,
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      display: true,
                      position: "top",
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Aplikasi berdasarkan Jenis Kelamin
            </h3>
            <div className="h-64 sm:h-80">
              <Pie
                data={genderData}
                options={{ maintainAspectRatio: false, responsive: true }}
              />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Aplikasi Harian (30 Hari Terakhir)
            </h3>
            <div className="h-64 sm:h-80">
              <Line
                data={dailyData}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0,
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      display: true,
                      position: "top",
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
