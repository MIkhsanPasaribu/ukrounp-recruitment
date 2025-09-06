"use client";

import React, { useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsFilters } from "@/types/analytics";
import {
  CustomPieChart,
  CustomBarChart,
  TimelineChart,
  FunnelChart,
} from "@/components/charts/Charts";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtext?: string;
}

function StatCard({ title, value, icon, color, subtext }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div
          className={`p-3 rounded-full text-2xl ${color
            .replace("text-", "bg-")
            .replace("-600", "-100")}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="ml-2 text-gray-600">Memuat analytics...</span>
    </div>
  );
}

function ErrorMessage({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center h-64 text-red-600">
      <span className="text-2xl mr-2">⚠️</span>
      <span>Error memuat analytics: {error}</span>
    </div>
  );
}

function DevelopmentBanner() {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-lg mb-6 shadow-lg">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-bold">
            🚧 Fitur Masih Dalam Pengembangan
          </h3>
          <p className="text-sm opacity-90">
            Dashboard Analytics sedang dalam tahap pengembangan. Data yang
            ditampilkan mungkin tidak akurat atau lengkap. Mohon tunggu hingga
            pengembangan selesai untuk menggunakan fitur ini secara penuh.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const { data, loading, error } = useAnalytics(filters);

  const handleFilterChange = (newFilters: Partial<AnalyticsFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <div>Tidak ada data tersedia</div>;

  // Transform data for charts
  const statusChartData = Object.entries(data.statusBreakdown || {}).map(
    ([status, count]) => ({
      name: status
        .replace("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      value: count,
    })
  );

  const facultyChartData = Object.entries(data.facultyBreakdown || {}).map(
    ([faculty, count]) => ({
      name: faculty,
      value: count,
    })
  );

  const educationChartData = Object.entries(data.educationBreakdown || {}).map(
    ([level, count]) => ({
      name: level,
      value: count,
    })
  );

  const genderChartData = Object.entries(data.genderBreakdown || {}).map(
    ([gender, count]) => ({
      name: gender,
      value: count,
    })
  );

  const skillsChartData = Object.entries(data.skillsAnalysis || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([skill, count]) => ({
      name: skill,
      value: count,
    }));

  const timelineChartData = Object.entries(data.timeline || {}).map(
    ([date, stats]) => ({
      date,
      applications: stats.total || 0,
      interviews: (stats.statuses && stats.statuses["INTERVIEW"]) || 0,
      accepted: (stats.statuses && stats.statuses["DITERIMA"]) || 0,
    })
  );

  const interviewerPerformanceData = Object.entries(
    data.interviewerPerformance || {}
  ).map(([, perf]) => ({
    name: perf?.name || "Unknown",
    value: perf?.totalSessions || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Development Banner */}
      <DevelopmentBanner />

      {/* Disabled Content Overlay */}
      <div className="relative">
        {/* Overlay to disable interactions */}
        <div className="absolute inset-0 bg-gray-200 bg-opacity-50 z-10 rounded-lg"></div>

        {/* Main Content - Visually Disabled */}
        <div className="opacity-60 pointer-events-none">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Analytics
              </h1>
              <p className="text-gray-600">
                Analytics komprehensif untuk proses rekrutmen
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                disabled
                className="flex items-center px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
              >
                <span className="mr-2">📁</span>
                Export CSV
              </button>
              <button
                disabled
                className="flex items-center px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
              >
                <span className="mr-2">🔄</span>
                Perbarui
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Dari
                </label>
                <input
                  type="date"
                  value={filters.dateFrom || ""}
                  onChange={(e) =>
                    handleFilterChange({ dateFrom: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Sampai
                </label>
                <input
                  type="date"
                  value={filters.dateTo || ""}
                  onChange={(e) =>
                    handleFilterChange({ dateTo: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fakultas
                </label>
                <select
                  value={filters.faculty || "all"}
                  onChange={(e) =>
                    handleFilterChange({
                      faculty:
                        e.target.value === "all" ? undefined : e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Fakultas</option>
                  {Object.keys(data.facultyBreakdown || {}).map((faculty) => (
                    <option key={faculty} value={faculty}>
                      {faculty}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Hapus Filter
              </button>
            </div>
            {(filters.dateFrom || filters.dateTo || filters.faculty) && (
              <div className="mt-2 text-sm text-gray-600">
                Difilter dari{" "}
                {data.metadata?.generatedAt || "waktu tidak diketahui"}
              </div>
            )}
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Pendaftar"
              value={(data.overview?.total_applications || 0).toLocaleString()}
              icon="📊"
              color="text-blue-600"
            />
            <StatCard
              title="Wawancara Selesai"
              value={(data.overview?.interviewed_count || 0).toLocaleString()}
              icon="👥"
              color="text-green-600"
            />
            <StatCard
              title="Diterima"
              value={(data.overview?.accepted_count || 0).toLocaleString()}
              icon="✅"
              color="text-emerald-600"
              subtext={`${(
                ((data.overview?.accepted_count || 0) /
                  (data.overview?.total_applications || 1)) *
                100
              ).toFixed(1)}% tingkat penerimaan`}
            />
            <StatCard
              title="Skor Wawancara Rata-rata"
              value={(data.overview?.avg_interview_score || 0).toFixed(1)}
              icon="🎓"
              color="text-purple-600"
              subtext="Dari 100"
            />
          </div>

          {/* Conversion Funnel */}
          {data.conversionFunnel && (
            <FunnelChart
              title="Funnel Rekrutmen"
              data={data.conversionFunnel}
              className="col-span-full"
            />
          )}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Breakdown */}
            <CustomPieChart
              title="Distribusi Status Aplikasi"
              data={statusChartData}
            />

            {/* Faculty Breakdown */}
            <CustomBarChart
              title="Aplikasi berdasarkan Fakultas"
              data={facultyChartData}
              color="#82ca9d"
            />

            {/* Education Level */}
            <CustomPieChart
              title="Distribusi Tingkat Pendidikan"
              data={educationChartData}
              colors={["#ffc658", "#ff7300", "#8dd1e1", "#d084d0"]}
            />

            {/* Gender Distribution */}
            <CustomPieChart
              title="Distribusi Jenis Kelamin"
              data={genderChartData}
              colors={["#8884d8", "#82ca9d", "#ffc658"]}
            />
          </div>

          {/* Skills Analysis */}
          <CustomBarChart
            title="10 Skill Teratas yang Disebutkan"
            data={skillsChartData}
            color="#ff7300"
            className="col-span-full"
          />

          {/* Interviewer Performance */}
          <CustomBarChart
            title="Sesi Wawancara per Interviewer"
            data={interviewerPerformanceData}
            color="#8dd1e1"
            className="col-span-full"
          />

          {/* Timeline */}
          {timelineChartData.length > 0 && (
            <TimelineChart
              title="Timeline Aplikasi"
              data={timelineChartData}
              className="col-span-full"
            />
          )}

          {/* Metadata */}
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
            <div className="flex items-center">
              <span className="mr-2">🕒</span>
              Terakhir diperbarui:{" "}
              {data.metadata?.generatedAt
                ? new Date(data.metadata?.generatedAt).toLocaleString()
                : "Waktu tidak diketahui"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
