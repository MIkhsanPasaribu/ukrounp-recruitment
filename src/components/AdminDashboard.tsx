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

export default function AdminDashboard() {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch("/api/admin/statistics");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.success && data.statistics) {
          setStatistics(data.statistics);
        } else if (data.error) {
          setError(data.error);
        } else {
          setError("Failed to fetch statistics");
        }
      } catch (err) {
        setError(`Error fetching statistics: ${(err as Error).message}`);
        console.error("Statistics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

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
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Aplikasi</h3>
          <p className="text-3xl font-bold text-blue-600">
            {statistics.totalApplications}
          </p>
        </div>

        {/* Add more summary cards here if needed */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            Aplikasi berdasarkan Status
          </h3>
          <div className="h-64">
            <Pie data={statusData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            Aplikasi berdasarkan Fakultas
          </h3>
          <div className="h-64">
            <Bar
              data={facultyData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            Aplikasi berdasarkan Jenis Kelamin
          </h3>
          <div className="h-64">
            <Pie data={genderData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            Aplikasi Harian (30 Hari Terakhir)
          </h3>
          <div className="h-64">
            <Line
              data={dailyData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
