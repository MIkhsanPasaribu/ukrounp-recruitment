"use client";

import { useState, useEffect, useCallback } from "react";
import { ApplicationData, ApplicationStatus } from "@/types";
import AdminDashboard from "@/components/AdminDashboard";
import AdminLogin from "@/components/AdminLogin";
import Pagination from "@/components/Pagination";
import AdminHeaderButtons from "@/components/AdminHeaderButtons";
import ApplicationDetailModal from "@/components/ApplicationDetailModal";
import ModifyDataModal from "@/components/ModifyDataModal";
import { exportApplicationsToCSV } from "@/utils/csvExport";

export default function AdminPage() {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<{
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: string;
  } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [registrationStatusLoading, setRegistrationStatusLoading] =
    useState(false);
  const [activeTab, setActiveTab] = useState("applications");
  const [selectedApplications, setSelectedApplications] = useState<string[]>(
    []
  );
  const [selectAll, setSelectAll] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [applicationsPerPage, setApplicationsPerPage] = useState(20); // Increase default
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null>(null);

  // Check for stored token on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    const storedAdmin = localStorage.getItem("adminInfo");

    if (storedToken && storedAdmin) {
      try {
        const parsedAdmin = JSON.parse(storedAdmin);
        setToken(storedToken);
        setAdmin(parsedAdmin);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing stored admin info:", error);
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminInfo");
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (
    newToken: string,
    adminInfo: {
      id: string;
      username: string;
      email: string;
      fullName: string;
      role: string;
    }
  ) => {
    setToken(newToken);
    setAdmin(adminInfo);
    setIsAuthenticated(true);
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    setToken(null);
    setAdmin(null);
    setIsAuthenticated(false);
    setApplications([]);
  }, []);

  // Function to fetch registration status
  const fetchRegistrationStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/registration-status", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setIsRegistrationOpen(data.isOpen);
      }
    } catch (error) {
      console.error("Error fetching registration status:", error);
    }
  }, [token]);

  // Function to fetch applications with pagination dan timeout
  const fetchApplications = useCallback(
    async (page = 1, limit = 20, search = "", status = "all") => {
      if (!token) return;

      try {
        setLoading(true);
        setError("");

        // Create AbortController untuk timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          lightweight: "false", // Use full data for admin view
        });

        if (search) params.append("search", search);
        if (status !== "all") params.append("status", status);

        const response = await fetch(`/api/admin/applications?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          setApplications(data.applications || []);
          setPagination(data.pagination || null);
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Error dalam mengambil data aplikasi");
        }
      } catch (error: unknown) {
        console.error("Error fetching applications:", error);
        if (error instanceof Error && error.name === "AbortError") {
          setError(
            "Request timeout - Silakan coba lagi atau gunakan filter untuk mengurangi data"
          );
        } else {
          setError("Error dalam mengambil data aplikasi - Silakan coba lagi");
        }
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Fetch data when authenticated - initial load
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchRegistrationStatus();
      fetchApplications(
        currentPage,
        applicationsPerPage,
        searchTerm,
        statusFilter
      );
    }
  }, [
    isAuthenticated,
    token,
    fetchRegistrationStatus,
    currentPage,
    applicationsPerPage,
    searchTerm,
    statusFilter,
    fetchApplications,
  ]);

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (isAuthenticated && token) {
        setCurrentPage(1); // Reset to first page on search
        fetchApplications(1, applicationsPerPage, searchTerm, statusFilter);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [
    searchTerm,
    statusFilter,
    isAuthenticated,
    token,
    fetchApplications,
    applicationsPerPage,
  ]);

  // Function to toggle registration status
  const toggleRegistrationStatus = async () => {
    if (
      !confirm(
        `Are you sure you want to ${
          isRegistrationOpen ? "close" : "open"
        } registration?`
      )
    ) {
      return;
    }

    setRegistrationStatusLoading(true);

    try {
      const response = await fetch("/api/admin/registration-status", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isOpen: !isRegistrationOpen }),
      });

      if (response.ok) {
        setIsRegistrationOpen(!isRegistrationOpen);
        alert(
          `Registration has been ${!isRegistrationOpen ? "opened" : "closed"}.`
        );
      } else {
        alert("Failed to update registration status");
      }
    } catch (error) {
      console.error("Error toggling registration status:", error);
      alert("Failed to update registration status");
    } finally {
      setRegistrationStatusLoading(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (
    id: string,
    newStatus: ApplicationStatus
  ) => {
    if (!token) return;

    try {
      const response = await fetch("/api/admin/update-status", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (response.ok) {
        setApplications(
          applications.map((app) =>
            app.id === id ? { ...app, status: newStatus } : app
          )
        );
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (status: ApplicationStatus) => {
    if (!token || selectedApplications.length === 0) return;

    if (
      !confirm(
        `Update status to ${status} for ${selectedApplications.length} selected applications?`
      )
    ) {
      return;
    }

    try {
      const updatePromises = selectedApplications.map((id) =>
        fetch("/api/admin/update-status", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, status }),
        })
      );

      await Promise.all(updatePromises);

      setApplications(
        applications.map((app) =>
          selectedApplications.includes(app.id) ? { ...app, status } : app
        )
      );

      setSelectedApplications([]);
      setSelectAll(false);
      alert("Bulk status update completed");
    } catch (error) {
      console.error("Error in bulk update:", error);
      alert("Failed to update some applications");
    }
  };

  // Handle delete application
  const handleDelete = async (id: string) => {
    if (!token) return;

    if (!confirm("Apakah Anda yakin ingin menghapus data pendaftaran ini?"))
      return;

    try {
      const response = await fetch("/api/admin/delete-application", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setApplications(applications.filter((app) => app.id !== id));
        alert("Data pendaftaran berhasil dihapus");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Gagal menghapus data pendaftaran");
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("Gagal menghapus data pendaftaran");
    }
  };

  // Server-side filtering - tidak perlu filter di client
  // applications sudah di-filter di server berdasarkan searchTerm dan statusFilter
  const filteredApplications = applications;

  // Server-side pagination - tidak perlu slice di client
  const currentApplications = applications; // Data sudah di-paginate di server

  // Get total pages dari API response
  const totalPages = pagination?.totalPages || 1;

  // Handle selection
  const handleSelectApplication = (id: string) => {
    setSelectedApplications((prev) =>
      prev.includes(id) ? prev.filter((appId) => appId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedApplications([]);
    } else {
      // Pilih semua data yang terfilter, bukan hanya yang ada di halaman saat ini
      setSelectedApplications(filteredApplications.map((app) => app.id));
    }
    setSelectAll(!selectAll);
  };

  // Handler untuk download PDF individual
  const handleDownloadPDF = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/download-pdf/${id}`);
      if (!response.ok) throw new Error("Gagal download PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `formulir-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Gagal mendownload PDF");
    }
  };

  // Handler untuk bulk download PDF
  const handleBulkDownloadPDF = async () => {
    if (selectedApplications.length === 0) {
      alert("Pilih setidaknya satu aplikasi untuk didownload");
      return;
    }

    try {
      const response = await fetch("/api/admin/bulk-download-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ applicationIds: selectedApplications }),
      });

      if (!response.ok) throw new Error("Gagal bulk download PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `formulir-pendaftaran-bulk.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error bulk downloading PDF:", error);
      alert("Gagal bulk download PDF");
    }
  };

  // Handler untuk edit aplikasi
  const handleEditApplication = (application: ApplicationData) => {
    setSelectedApplication(application);
    setShowEditModal(true);
  };

  // Handler untuk update setelah edit berhasil
  const handleUpdateSuccess = (updatedData: ApplicationData) => {
    // Update data di state applications
    setApplications((prev) =>
      prev.map((app) => (app.id === updatedData.id ? updatedData : app))
    );

    // Update selectedApplication juga
    setSelectedApplication(updatedData);
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          Memuat...
        </div>
      );
    }
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-4 sm:gap-0">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Panel Admin
              </h1>
              {/* Registration Status Indicator */}
              <div className="ml-4 sm:ml-6">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    isRegistrationOpen
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      isRegistrationOpen ? "bg-green-400" : "bg-red-400"
                    }`}
                  ></div>
                  {isRegistrationOpen
                    ? "Pendaftaran Dibuka"
                    : "Pendaftaran Ditutup"}
                </span>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <AdminHeaderButtons
                onLogout={handleLogout}
                isRegistrationOpen={isRegistrationOpen}
                onToggleRegistration={toggleRegistrationStatus}
                registrationStatusLoading={registrationStatusLoading}
                hasApplications={applications.length > 0}
                onExportCSV={() => exportApplicationsToCSV(applications)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-4 sm:space-x-8">
            <button
              onClick={() => setActiveTab("applications")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "applications"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="hidden sm:inline">
                Pendaftaran ({applications.length})
              </span>
              <span className="sm:hidden">Data ({applications.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "dashboard"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Statistik
            </button>
          </nav>
        </div>

        {activeTab === "dashboard" && (
          <AdminDashboard
            token={token!}
            admin={admin || undefined}
            onLogout={handleLogout}
          />
        )}

        {activeTab === "applications" && (
          <>
            {/* Search and Filter Controls */}
            <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama, email, atau NIM..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-auto">
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Semua Status</option>
                    <option value="SEDANG_DITINJAU">Sedang Ditinjau</option>
                    <option value="DAFTAR_PENDEK">Daftar Pendek</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="DITERIMA">Diterima</option>
                    <option value="DITOLAK">Ditolak</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedApplications.length > 0 && (
              <div className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">
                      {selectedApplications.length} pendaftaran dipilih
                    </span>
                    <button
                      onClick={() => setSelectedApplications([])}
                      className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                      Batal Pilih
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {/* Bulk Status Update Dropdown */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600 whitespace-nowrap">
                        Ubah Status:
                      </label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleBulkStatusUpdate(
                              e.target.value as ApplicationStatus
                            );
                            e.target.value = ""; // Reset dropdown
                          }
                        }}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm min-w-[140px]"
                        defaultValue=""
                      >
                        <option value="">Pilih Status</option>
                        <option value="SEDANG_DITINJAU">Sedang Ditinjau</option>
                        <option value="DAFTAR_PENDEK">Daftar Pendek</option>
                        <option value="INTERVIEW">Interview</option>
                        <option value="DITERIMA">Diterima</option>
                        <option value="DITOLAK">Ditolak</option>
                      </select>
                    </div>

                    {/* Other Bulk Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          exportApplicationsToCSV(
                            applications.filter((app) =>
                              selectedApplications.includes(app.id)
                            )
                          )
                        }
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm whitespace-nowrap"
                      >
                        Ekspor Terpilih
                      </button>
                      <button
                        onClick={() => handleBulkDownloadPDF()}
                        className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm whitespace-nowrap"
                      >
                        Download PDF Terpilih
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Applications Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  Memuat data pendaftaran...
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="text-red-600 mb-4">
                      <svg
                        className="w-12 h-12 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      <p className="text-lg font-semibold">{error}</p>
                    </div>
                    <div className="space-y-3">
                      <button
                        onClick={() =>
                          fetchApplications(
                            currentPage,
                            applicationsPerPage,
                            searchTerm,
                            statusFilter
                          )
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        disabled={loading}
                      >
                        {loading ? "Mencoba ulang..." : "Coba Lagi"}
                      </button>
                      <p className="text-sm text-gray-600">
                        Tips: Coba gunakan filter untuk mengurangi jumlah data
                        yang dimuat
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={selectAll}
                              onChange={handleSelectAll}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Pendaftar
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kontak
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Akademik
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentApplications.map((application) => (
                          <tr key={application.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedApplications.includes(
                                  application.id
                                )}
                                onChange={() =>
                                  handleSelectApplication(application.id)
                                }
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {application.fullName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {application.nickname}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {application.email}
                              </div>
                              <div className="text-sm text-gray-500">
                                {application.phoneNumber}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {application.nim} - {application.nia}
                              </div>
                              <div className="text-sm text-gray-500">
                                {application.faculty} -{" "}
                                {application.studyProgram}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={application.status || "SEDANG_DITINJAU"}
                                onChange={(e) =>
                                  handleStatusUpdate(
                                    application.id,
                                    e.target.value as ApplicationStatus
                                  )
                                }
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  application.status === "DITERIMA"
                                    ? "bg-green-100 text-green-800"
                                    : application.status === "DITOLAK"
                                    ? "bg-red-100 text-red-800"
                                    : application.status === "INTERVIEW"
                                    ? "bg-blue-100 text-blue-800"
                                    : application.status === "DAFTAR_PENDEK"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                <option value="SEDANG_DITINJAU">
                                  Sedang Ditinjau
                                </option>
                                <option value="DAFTAR_PENDEK">
                                  Daftar Pendek
                                </option>
                                <option value="INTERVIEW">Interview</option>
                                <option value="DITERIMA">Diterima</option>
                                <option value="DITOLAK">Ditolak</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex flex-col space-y-1">
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => {
                                      setSelectedApplication(application);
                                      setShowDetailModal(true);
                                    }}
                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                    title="Lihat Detail"
                                  >
                                    Lihat
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDownloadPDF(application.id)
                                    }
                                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                    title="Download PDF"
                                  >
                                    PDF
                                  </button>
                                </div>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() =>
                                      handleEditApplication(application)
                                    }
                                    className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                                    title="Edit Data"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(application.id)}
                                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                    title="Hapus Data"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-4 p-4">
                    {/* Mobile Select All Controls */}
                    <div className="bg-gray-100 rounded-lg p-3 flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">
                          {selectAll
                            ? `Semua ${applications.length} data dipilih`
                            : `Pilih semua (${applications.length} data)`}
                        </span>
                      </div>
                      {selectedApplications.length > 0 && (
                        <span className="text-xs text-indigo-600 font-medium">
                          {selectedApplications.length} terpilih
                        </span>
                      )}
                    </div>
                    {currentApplications.map((application) => (
                      <div
                        key={application.id}
                        className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={selectedApplications.includes(
                                application.id
                              )}
                              onChange={() =>
                                handleSelectApplication(application.id)
                              }
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {application.fullName}
                              </h3>
                              <p className="text-xs text-gray-500 truncate">
                                {application.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div>
                            <span className="font-medium text-gray-500">
                              NIM/NIA:
                            </span>
                            <p className="text-gray-900 truncate">
                              {application.nim} - {application.nia}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">
                              Telepon:
                            </span>
                            <p className="text-gray-900 truncate">
                              {application.phoneNumber}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium text-gray-500">
                              Program:
                            </span>
                            <p className="text-gray-900 truncate">
                              {application.studyProgram}
                            </p>
                          </div>
                        </div>

                        {/* Status dan Actions dalam satu baris */}
                        <div className="flex items-center justify-between gap-2">
                          <select
                            value={application.status || "SEDANG_DITINJAU"}
                            onChange={(e) =>
                              handleStatusUpdate(
                                application.id,
                                e.target.value as ApplicationStatus
                              )
                            }
                            className={`px-2 py-1 rounded text-xs font-semibold border-0 focus:ring-1 focus:ring-indigo-500 ${
                              application.status === "DITERIMA"
                                ? "bg-green-100 text-green-800"
                                : application.status === "DITOLAK"
                                ? "bg-red-100 text-red-800"
                                : application.status === "INTERVIEW"
                                ? "bg-blue-100 text-blue-800"
                                : application.status === "DAFTAR_PENDEK"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            <option value="SEDANG_DITINJAU">
                              Sedang Ditinjau
                            </option>
                            <option value="DAFTAR_PENDEK">Daftar Pendek</option>
                            <option value="INTERVIEW">Interview</option>
                            <option value="DITERIMA">Diterima</option>
                            <option value="DITOLAK">Ditolak</option>
                          </select>

                          {/* Mobile Actions Dropdown */}
                          <div className="relative">
                            <select
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === "detail") {
                                  setSelectedApplication(application);
                                  setShowDetailModal(true);
                                } else if (value === "pdf") {
                                  handleDownloadPDF(application.id);
                                } else if (value === "edit") {
                                  handleEditApplication(application);
                                } else if (value === "delete") {
                                  if (
                                    confirm(
                                      `Apakah Anda yakin ingin menghapus data pendaftaran ${application.fullName}?`
                                    )
                                  ) {
                                    handleDelete(application.id);
                                  }
                                }
                                e.target.value = "";
                              }}
                              className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                              defaultValue=""
                            >
                              <option value="">Aksi</option>
                              <option value="detail">📋 Lihat Detail</option>
                              <option value="pdf">📄 Download PDF</option>
                              <option value="edit">✏️ Edit Data</option>
                              <option value="delete">🗑️ Hapus</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="mt-6 px-4 sm:px-0">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      itemsPerPage={applicationsPerPage}
                      totalItems={pagination?.total || 0}
                      onPageChange={setCurrentPage}
                      onItemsPerPageChange={(newLimit) => {
                        setApplicationsPerPage(newLimit);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Application Detail Modal */}
      {showDetailModal && selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedApplication(null);
          }}
          onDelete={handleDelete}
          onStatusChange={(id: string, status: string) =>
            handleStatusUpdate(id, status as ApplicationStatus)
          }
        />
      )}

      {/* Application Edit Modal */}
      {showEditModal && selectedApplication && (
        <ModifyDataModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedApplication(null);
          }}
          isAdminMode={true}
          applicationData={selectedApplication}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
}
