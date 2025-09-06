import { useState, useEffect } from "react";
import { AnalyticsData, AnalyticsFilters } from "@/types/analytics";

export function useAnalytics(filters?: AnalyticsFilters) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async (currentFilters?: AnalyticsFilters) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      const activeFilters = currentFilters || filters;

      if (activeFilters?.dateFrom) {
        searchParams.append("dateFrom", activeFilters.dateFrom);
      }
      if (activeFilters?.dateTo) {
        searchParams.append("dateTo", activeFilters.dateTo);
      }
      if (activeFilters?.faculty) {
        searchParams.append("faculty", activeFilters.faculty);
      }

      const response = await fetch(
        `/api/admin/analytics?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Gagal mengambil analytics: ${response.status}`);
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      console.error("Error mengambil analytics:", err);
      setError(
        err instanceof Error ? err.message : "Error tidak diketahui terjadi"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = (newFilters?: AnalyticsFilters) => {
    fetchAnalytics(newFilters);
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
}

export function useAnalyticsExport() {
  const [exporting, setExporting] = useState(false);

  const exportToCSV = async (
    data: AnalyticsData,
    filename: string = "laporan-analytics"
  ) => {
    try {
      setExporting(true);

      // Konversi data ke format CSV
      const csvContent = convertToCSV(data);

      // Buat dan download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${filename}-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error export CSV:", error);
      throw error;
    } finally {
      setExporting(false);
    }
  };

  return {
    exportToCSV,
    exporting,
  };
}

function convertToCSV(data: AnalyticsData): string {
  const rows: string[] = [];

  // Header
  rows.push("Laporan Analytics");
  rows.push(`Dibuat: ${data.metadata.generatedAt}`);
  if (data.metadata.dateFrom)
    rows.push(`Tanggal Dari: ${data.metadata.dateFrom}`);
  if (data.metadata.dateTo)
    rows.push(`Tanggal Sampai: ${data.metadata.dateTo}`);
  if (data.metadata.faculty) rows.push(`Fakultas: ${data.metadata.faculty}`);
  rows.push("");

  // Overview
  rows.push("OVERVIEW");
  rows.push("Metrik,Nilai");
  rows.push(`Total Pendaftar,${data.overview.total_applications}`);
  rows.push(`Diterima,${data.overview.accepted_count}`);
  rows.push(`Ditolak,${data.overview.rejected_count}`);
  rows.push(`Sedang Ditinjau,${data.overview.under_review_count}`);
  rows.push(`Wawancara Dijadwalkan,${data.overview.interview_count}`);
  rows.push(`Wawancara Selesai,${data.overview.interviewed_count}`);
  rows.push(`Skor Wawancara Rata-rata,${data.overview.avg_interview_score}`);
  rows.push("");

  // Faculty Breakdown
  rows.push("BREAKDOWN FAKULTAS");
  rows.push("Fakultas,Aplikasi");
  Object.entries(data.facultyBreakdown).forEach(([faculty, count]) => {
    rows.push(`${faculty},${count}`);
  });
  rows.push("");

  // Status Breakdown
  rows.push("BREAKDOWN STATUS");
  rows.push("Status,Jumlah");
  Object.entries(data.statusBreakdown).forEach(([status, count]) => {
    rows.push(`${status},${count}`);
  });
  rows.push("");

  // Education Breakdown
  rows.push("BREAKDOWN PENDIDIKAN");
  rows.push("Tingkat,Jumlah");
  Object.entries(data.educationBreakdown).forEach(([level, count]) => {
    rows.push(`${level},${count}`);
  });
  rows.push("");

  // Skills Analysis
  rows.push("ANALISIS SKILL");
  rows.push("Skill,Penyebutan");
  Object.entries(data.skillsAnalysis).forEach(([skill, count]) => {
    rows.push(`${skill},${count}`);
  });
  rows.push("");

  // Interviewer Performance
  rows.push("PERFORMA INTERVIEWER");
  rows.push(
    "Interviewer,Total Sesi,Skor Rata-rata,Sangat Direkomendasikan,Direkomendasikan,Cukup,Tidak Direkomendasikan"
  );
  Object.entries(data.interviewerPerformance).forEach(([, perf]) => {
    rows.push(
      `${perf.name},${perf.totalSessions},${perf.averageScore},${perf.recommendations.SANGAT_DIREKOMENDASIKAN},${perf.recommendations.DIREKOMENDASIKAN},${perf.recommendations.CUKUP},${perf.recommendations.TIDAK_DIREKOMENDASIKAN}`
    );
  });

  return rows.join("\n");
}
