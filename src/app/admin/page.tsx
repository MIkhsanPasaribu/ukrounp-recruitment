"use client";

import { useState, useEffect } from "react";
import { ApplicationData, ApplicationStatus } from "@/types";
import Link from "next/link";
import AdminDashboard from "@/components/AdminDashboard";
import Pagination from "@/components/Pagination";
import AdminHeaderButtons from "@/components/AdminHeaderButtons";
import ApplicationDetailModal from "@/components/ApplicationDetailModal";
import { exportApplicationsToCSV } from "@/utils/csvExport";

export default function AdminPage() {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [adminPassword, setAdminPassword] = useState("");
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
  const [currentPage, setCurrentPage] = useState(1);
  const [applicationsPerPage, setApplicationsPerPage] = useState(10);

  // Fetch admin password from API
  useEffect(() => {
    const fetchAdminPassword = async () => {
      try {
        const response = await fetch("/api/admin/get-password");
        if (response.ok) {
          const data = await response.json();
          setAdminPassword(data.password);
        }
      } catch (error) {
        console.error("Error fetching admin password:", error);
      }
    };

    fetchAdminPassword();

    // Also fetch registration status when component mounts
    fetchRegistrationStatus();
  }, []);

  // Function to fetch registration status
  const fetchRegistrationStatus = async () => {
    try {
      const response = await fetch("/api/admin/registration-status");
      if (response.ok) {
        const data = await response.json();
        setIsRegistrationOpen(data.isOpen);
      }
    } catch (error) {
      console.error("Error fetching registration status:", error);
    }
  };

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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isOpen: !isRegistrationOpen }),
      });

      if (response.ok) {
        setIsRegistrationOpen(!isRegistrationOpen);
        alert(
          `Registration ${
            !isRegistrationOpen ? "opened" : "closed"
          } successfully`
        );
      }
    } catch (error) {
      console.error("Error updating registration status:", error);
    } finally {
      setRegistrationStatusLoading(false);
    }
  };

  const authenticate = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple authentication - in a real app, use proper auth
    if (password === adminPassword && adminPassword !== "") {
      setIsAuthenticated(true);
      fetchApplications();
    } else {
      setError("Password salah");
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/admin/applications");
      if (!response.ok) {
        throw new Error("Gagal mengambil data aplikasi");
      }
      const data = await response.json();
      setApplications(data.applications);
    } catch (err) {
      setError("Error dalam mengambil data aplikasi");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (
    id: string,
    newStatus: ApplicationStatus
  ) => {
    // Create display map for confirmation
    const displayMap: Record<ApplicationStatus, string> = {
      SEDANG_DITINJAU: "Sedang Ditinjau",
      DAFTAR_PENDEK: "Masuk Daftar Pendek",
      INTERVIEW: "Interview",
      DITERIMA: "Diterima",
      DITOLAK: "Ditolak",
    };

    // Add confirmation dialog
    if (
      !confirm(
        `Apakah Anda yakin ingin mengubah status menjadi "${displayMap[newStatus]}"?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/admin/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (response.ok) {
        // Update the local state to reflect the change
        setApplications(
          applications.map((app: ApplicationData) => {
            return app.id === id ? { ...app, status: newStatus } : app;
          })
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const deleteApplication = async (id: string) => {
    // Add confirmation dialog
    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus aplikasi ini? Tindakan ini tidak dapat dibatalkan."
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/admin/delete-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        // Remove the deleted application from the local state
        setApplications(applications.filter((app) => app.id !== id));
      } else {
        const data = await response.json();
        alert(`Gagal menghapus: ${data.message || "Error tidak diketahui"}`);
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("Terjadi error saat menghapus aplikasi");
    }
  };

  const exportToCSV = () => {
    if (applications.length === 0) {
      alert("Tidak ada aplikasi untuk diekspor");
      return;
    }

    exportApplicationsToCSV(applications);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setApplications([]);
    setError("");
  };

  // Filter applications based on search term and status
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phoneNumber?.includes(searchTerm);

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate pagination indexes and current page data
  const indexOfLastApplication = currentPage * applicationsPerPage;
  const indexOfFirstApplication = indexOfLastApplication - applicationsPerPage;
  const currentApplications = filteredApplications.slice(
    indexOfFirstApplication,
    indexOfLastApplication
  );
  // Calculate total pages
  const totalPages = Math.ceil(
    filteredApplications.length / applicationsPerPage
  );

  const handleBulkStatusUpdate = async (newStatus: ApplicationStatus) => {
    // Create display map for confirmation
    const displayMap: Record<ApplicationStatus, string> = {
      SEDANG_DITINJAU: "Sedang Ditinjau",
      DAFTAR_PENDEK: "Masuk Daftar Pendek",
      INTERVIEW: "Interview",
      DITERIMA: "Diterima",
      DITOLAK: "Ditolak",
    };

    if (selectedApplications.length === 0) {
      alert("Tidak ada aplikasi yang dipilih");
      return;
    }

    if (
      !confirm(
        `Apakah Anda yakin ingin mengubah status menjadi "${displayMap[newStatus]}" untuk ${selectedApplications.length} aplikasi?`
      )
    ) {
      return;
    }

    try {
      const promises = selectedApplications.map((id) =>
        fetch("/api/admin/update-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, status: newStatus }),
        })
      );

      await Promise.all(promises);

      // Update the local state to reflect the changes
      setApplications(
        applications.map((app: ApplicationData) =>
          selectedApplications.includes(app.id)
            ? { ...app, status: newStatus }
            : app
        )
      );

      // Clear selections after successful update
      setSelectedApplications([]);
      setSelectAll(false);
      alert(
        `Berhasil mengupdate ${selectedApplications.length} aplikasi menjadi "${displayMap[newStatus]}"`
      );
    } catch (error) {
      console.error("Error updating statuses:", error);
      alert("Terjadi error saat mengupdate status");
    }
  };

  // Add function to handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedApplications.length === 0) {
      alert("Tidak ada aplikasi yang dipilih");
      return;
    }

    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus ${selectedApplications.length} aplikasi? Tindakan ini tidak dapat dibatalkan.`
      )
    ) {
      return;
    }

    try {
      const promises = selectedApplications.map((id) =>
        fetch("/api/admin/delete-application", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        })
      );

      await Promise.all(promises);

      // Update the local state to reflect the changes
      setApplications(
        applications.filter((app) => !selectedApplications.includes(app.id))
      );

      // Clear selections after successful delete
      setSelectedApplications([]);
      setSelectAll(false);
      alert(`Berhasil menghapus ${selectedApplications.length} aplikasi`);
    } catch (error) {
      console.error("Error deleting applications:", error);
      alert("Terjadi error saat menghapus aplikasi");
    }
  };

  // Add function to handle selection of all applications
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(filteredApplications.map((app) => app.id));
    }
    setSelectAll(!selectAll);
  };

  // Add function to handle selection of a single application
  const handleSelectApplication = (id: string) => {
    if (selectedApplications.includes(id)) {
      setSelectedApplications(
        selectedApplications.filter((appId) => appId !== id)
      );
    } else {
      setSelectedApplications([...selectedApplications, id]);
    }
  };

  // Add function to view application details
  const viewApplicationDetails = (application: ApplicationData) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };

  // Add function to close the modal
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedApplication(null);
  };

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
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
            Kembali ke Beranda
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">Login Admin</h1>
        <form onSubmit={authenticate}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  // If authenticated, show the admin dashboard
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
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
            Kembali ke Beranda
          </Link>
          <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        </div>
        <AdminHeaderButtons
          isRegistrationOpen={isRegistrationOpen}
          registrationStatusLoading={registrationStatusLoading}
          hasApplications={applications.length > 0}
          onToggleRegistration={toggleRegistrationStatus}
          onExportCSV={exportToCSV}
          onLogout={handleLogout}
        />
      </div>

      {/* Registration status indicator */}
      <div
        className={`mb-4 p-3 rounded-md ${
          isRegistrationOpen
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        <p className="font-medium">
          Pendaftaran saat ini {isRegistrationOpen ? "DIBUKA" : "DITUTUP"}
        </p>
      </div>

      {/* Tab navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab("applications")}
            className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
              activeTab === "applications"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Applications
          </button>
          <button
            onClick={() => setActiveTab("statistics")}
            className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
              activeTab === "statistics"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Statistik
          </button>
        </nav>
      </div>

      {activeTab === "statistics" ? (
        <AdminDashboard />
      ) : (
        <>
          {/* Search and filter controls */}
          <div className="mb-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cari berdasarkan nama, email atau telepon"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <select
                title="Filter berdasarkan Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">Semua Status</option>
                <option value="SEDANG_DITINJAU">Sedang Ditinjau</option>
                <option value="DAFTAR_PENDEK">Masuk Daftar Pendek</option>
                <option value="INTERVIEW">Interview</option>
                <option value="DITERIMA">Diterima</option>
                <option value="DITOLAK">Ditolak</option>
              </select>
            </div>
          </div>

          {/* Bulk actions */}
          {selectedApplications.length > 0 && (
            <div className="mb-4 p-3 bg-gray-100 rounded-md">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">
                  {selectedApplications.length} aplikasi dipilih
                </span>
                <div className="flex-1"></div>
                <div className="flex flex-wrap gap-2">
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value) {
                        handleBulkStatusUpdate(value as ApplicationStatus);
                        e.target.value = "";
                      }
                    }}
                    value=""
                    disabled={selectedApplications.length === 0}
                  >
                    <option value="" disabled>
                      Ubah status...
                    </option>
                    <option value="SEDANG_DITINJAU">Sedang Ditinjau</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="DITERIMA">Diterima</option>
                    <option value="DITOLAK">Ditolak</option>
                  </select>
                  <button
                    onClick={handleBulkDelete}
                    disabled={selectedApplications.length === 0}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium"
                  >
                    Hapus yang Dipilih
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Applications table */}
          {loading ? (
            <p>Memuat aplikasi...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="h-4 w-4"
                      />
                    </th>
                    <th className="px-4 py-2 border">Email</th>
                    <th className="px-4 py-2 border">Nama Lengkap</th>
                    <th className="px-4 py-2 border">Fakultas</th>
                    <th className="px-4 py-2 border">Jurusan</th>
                    <th className="px-4 py-2 border">Telepon</th>
                    <th className="px-4 py-2 border">Status</th>
                    <th className="px-4 py-2 border">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentApplications.length > 0 ? (
                    currentApplications.map((app, index) => (
                      <tr
                        key={app.id || index}
                        className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        <td className="px-4 py-2 border text-center">
                          <input
                            type="checkbox"
                            checked={selectedApplications?.includes(app.id)}
                            onChange={() => handleSelectApplication(app.id)}
                            className="h-4 w-4"
                          />
                        </td>
                        <td className="px-4 py-2 border">{app.email}</td>
                        <td className="px-4 py-2 border">{app.fullName}</td>
                        <td className="px-4 py-2 border">{app.faculty}</td>
                        <td className="px-4 py-2 border">{app.department}</td>
                        <td className="px-4 py-2 border">{app.phoneNumber}</td>
                        <td className="px-4 py-2 border">
                          <select
                            value={app.status || "SEDANG_DITINJAU"}
                            onChange={(e) =>
                              updateApplicationStatus(
                                app.id,
                                e.target.value as ApplicationStatus
                              )
                            }
                            className="w-full p-1 border border-gray-300 rounded"
                          >
                            <option value="SEDANG_DITINJAU">
                              Sedang Ditinjau
                            </option>
                            <option value="DAFTAR_PENDEK">
                              Masuk Daftar Pendek
                            </option>
                            <option value="INTERVIEW">Interview</option>
                            <option value="DITERIMA">Diterima</option>
                            <option value="DITOLAK">Ditolak</option>
                          </select>
                        </td>
                        <td className="px-4 py-2 border">
                          <div className="flex items-center">
                            <button
                              onClick={() => viewApplicationDetails(app)}
                              className="text-blue-600 hover:text-blue-800 mr-2"
                              title="Lihat Detail"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteApplication(app.id)}
                              className="text-red-600 hover:text-red-800 mr-2"
                              title="Hapus Aplikasi"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Tidak ada aplikasi ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Move the modal outside of the table structure */}
          {showDetailModal && selectedApplication && (
            <ApplicationDetailModal
              application={selectedApplication}
              onClose={closeDetailModal}
              onDelete={deleteApplication}
              onStatusChange={(id, status) => {
                updateApplicationStatus(id, status as ApplicationStatus);
                setSelectedApplication({
                  ...selectedApplication,
                  status: status as ApplicationStatus,
                });
              }}
            />
          )}

          {/* Pagination Controls */}
          {filteredApplications.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={applicationsPerPage}
              totalItems={filteredApplications.length}
              onPageChange={(pageNumber) => {
                setCurrentPage(pageNumber);
                // Optionally scroll to top of table when changing pages
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onItemsPerPageChange={(newItemsPerPage) => {
                setApplicationsPerPage(newItemsPerPage);
                setCurrentPage(1); // Reset to first page when changing items per page
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
