"use client";

import { useState, useEffect } from "react";
import { ApplicationData } from "@/types";
import Link from "next/link";
import AdminDashboard from "@/components/AdminDashboard";
import Pagination from "@/components/Pagination";
import AdminHeaderButtons from "@/components/AdminHeaderButtons";

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
  const [activeTab, setActiveTab] = useState("applications"); // Add this state
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
      setError("Invalid password");
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/admin/applications");
      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }
      const data = await response.json();
      setApplications(data.applications);
    } catch (err) {
      setError("Error fetching applications");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id: string, newStatus: string) => {
    // Add confirmation dialog
    if (
      !confirm(`Are you sure you want to change the status to "${newStatus}"?`)
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
          applications.map((app) => {
            return app._id === id ? { ...app, status: newStatus } : app;
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
        "Are you sure you want to delete this application? This action cannot be undone."
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
        setApplications(applications.filter((app) => app._id !== id));
      } else {
        const data = await response.json();
        alert(`Failed to delete: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("An error occurred while deleting the application");
    }
  };

  const exportToCSV = () => {
    if (applications.length === 0) return;

    // Define the headers
    const headers = [
      "Email",
      "Full Name",
      "Nickname",
      "Gender",
      "Birth Date",
      "Faculty",
      "Department",
      "Study Program",
      "Previous School",
      "Padang Address",
      "Phone Number",
      "Status",
      "Submitted At",
    ];

    // Create CSV content
    let csvContent = headers.join(",") + "\n";

    applications.forEach((app) => {
      const row = [
        `"${app.email || ""}"`,
        `"${app.fullName || ""}"`,
        `"${app.nickname || ""}"`,
        `"${app.gender || ""}"`,
        `"${app.birthDate || ""}"`,
        `"${app.faculty || ""}"`,
        `"${app.department || ""}"`,
        `"${app.studyProgram || ""}"`,
        `"${app.previousSchool || ""}"`,
        `"${app.padangAddress || ""}"`,
        `"${app.phoneNumber || ""}"`,
        `"${app.status || "Under Review"}"`,
        `"${
          app.submittedAt ? new Date(app.submittedAt).toLocaleString() : ""
        }"`,
      ];
      csvContent += row.join(",") + "\n";
    });

    // Create a download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `applications_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
  const totalPages = Math.ceil(filteredApplications.length / applicationsPerPage);

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedApplications.length === 0) {
      alert("No applications selected");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to change the status to "${newStatus}" for ${selectedApplications.length} applications?`
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
        applications.map((app) => {
          return selectedApplications.includes(app._id)
            ? { ...app, status: newStatus }
            : app;
        })
      );

      // Clear selections after successful update
      setSelectedApplications([]);
      setSelectAll(false);
      alert(
        `Successfully updated ${selectedApplications.length} applications to "${newStatus}"`
      );
    } catch (error) {
      console.error("Error updating statuses:", error);
      alert("An error occurred while updating statuses");
    }
  };

  // Add function to handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedApplications.length === 0) {
      alert("No applications selected");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedApplications.length} applications? This action cannot be undone.`
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
        applications.filter((app) => !selectedApplications.includes(app._id))
      );

      // Clear selections after successful delete
      setSelectedApplications([]);
      setSelectAll(false);
      alert(`Successfully deleted ${selectedApplications.length} applications`);
    } catch (error) {
      console.error("Error deleting applications:", error);
      alert("An error occurred while deleting applications");
    }
  };

  // Add function to handle selection of all applications
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(filteredApplications.map((app) => app._id));
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
            Back to Home
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
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
    <div className="container mx-auto p-4">
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
            Back to Home
          </Link>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
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
          Registration is currently {isRegistrationOpen ? "OPEN" : "CLOSED"}
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
            Statistics
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
                placeholder="Search by name, email or phone"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <select
                title="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="Under Review">Under Review</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interview">Interview</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Bulk actions */}
          {selectedApplications.length > 0 && (
            <div className="mb-4 p-3 bg-gray-100 rounded-md">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">
                  {selectedApplications.length} applications selected
                </span>
                <div className="flex-1"></div>
                <div className="flex flex-wrap gap-2">
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value) {
                        handleBulkStatusUpdate(value);
                        e.target.value = "";
                      }
                    }}
                    value=""
                  >
                    <option value="" disabled>
                      Change status to...
                    </option>
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview">Interview</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <button
                    onClick={handleBulkDelete}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium"
                  >
                    Delete Selected
                  </button>
                  <button
                    onClick={() => setSelectedApplications([])}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Applications table */}
          {loading ? (
            <p>Loading applications...</p>
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
                    <th className="px-4 py-2 border">Full Name</th>
                    <th className="px-4 py-2 border">Faculty</th>
                    <th className="px-4 py-2 border">Department</th>
                    <th className="px-4 py-2 border">Phone</th>
                    <th className="px-4 py-2 border">Status</th>
                    <th className="px-4 py-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentApplications.length > 0 ? currentApplications.map((app, index) => (
                    <tr
                      key={app._id || index}
                      className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="px-4 py-2 border text-center">
                        <input
                          type="checkbox"
                          checked={selectedApplications?.includes(app._id)}
                          onChange={() => handleSelectApplication(app._id)}
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
                          value={app.status || "Under Review"}
                          onChange={(e) =>
                            updateApplicationStatus(app._id, e.target.value)
                          }
                          className="w-full p-1 border border-gray-300 rounded"
                        >
                          <option value="Under Review">Under Review</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Interview">Interview</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="px-4 py-2 border">
                        <div className="flex items-center">
                          <button
                            onClick={() => viewApplicationDetails(app)}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                            title="View Details"
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
                            onClick={() => deleteApplication(app._id)}
                            className="text-red-600 hover:text-red-800 mr-2"
                            title="Delete Application"
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

                      {/* Add the application detail modal */}
                      {showDetailModal && selectedApplication && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
                              <h2 className="text-xl font-bold">
                                Application Details
                              </h2>
                              <button
                                title="Close Detail"
                                onClick={closeDetailModal}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>

                            <div className="p-6">
                              {/* Application Status */}
                              <div className="mb-6">
                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                  <div>
                                    <span className="font-medium mr-2">
                                      Status:
                                    </span>
                                    <select
                                      value={
                                        selectedApplication.status ||
                                        "Under Review"
                                      }
                                      onChange={(e) => {
                                        updateApplicationStatus(
                                          selectedApplication._id,
                                          e.target.value
                                        );
                                        setSelectedApplication({
                                          ...selectedApplication,
                                          status: e.target.value,
                                        });
                                      }}
                                      className="px-2 py-1 border border-gray-300 rounded"
                                    >
                                      <option value="Under Review">
                                        Under Review
                                      </option>
                                      <option value="Shortlisted">
                                        Shortlisted
                                      </option>
                                      <option value="Interview">
                                        Interview
                                      </option>
                                      <option value="Accepted">Accepted</option>
                                      <option value="Rejected">Rejected</option>
                                    </select>
                                  </div>
                                  <div>
                                    <span className="font-medium mr-2">
                                      Submitted:
                                    </span>
                                    <span>
                                      {selectedApplication.submittedAt
                                        ? new Date(
                                            selectedApplication.submittedAt
                                          ).toLocaleString()
                                        : "N/A"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium mr-2">
                                      Application ID:
                                    </span>
                                    <span className="font-mono text-sm">
                                      {selectedApplication._id}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Personal Information */}
                              <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3 pb-2 border-b">
                                  Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="font-medium">Full Name</p>
                                    <p>
                                      {selectedApplication.fullName || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Nickname</p>
                                    <p>
                                      {selectedApplication.nickname || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Gender</p>
                                    <p>
                                      {selectedApplication.gender === "male"
                                        ? "Laki-laki"
                                        : "Perempuan"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Birth Date</p>
                                    <p>
                                      {selectedApplication.birthDate || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Email</p>
                                    <p>{selectedApplication.email || "N/A"}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Phone Number</p>
                                    <p>
                                      {selectedApplication.phoneNumber || "N/A"}
                                    </p>
                                  </div>
                                  <div className="md:col-span-2">
                                    <p className="font-medium">
                                      Padang Address
                                    </p>
                                    <p>
                                      {selectedApplication.padangAddress ||
                                        "N/A"}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Academic Information */}
                              <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3 pb-2 border-b">
                                  Academic Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="font-medium">Faculty</p>
                                    <p>
                                      {selectedApplication.faculty || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Department</p>
                                    <p>
                                      {selectedApplication.department || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Study Program</p>
                                    <p>
                                      {selectedApplication.studyProgram ||
                                        "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      Previous School
                                    </p>
                                    <p>
                                      {selectedApplication.previousSchool ||
                                        "N/A"}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Software Experience */}
                              <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3 pb-2 border-b">
                                  Software Experience
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                  {selectedApplication.software && (
                                    <>
                                      {selectedApplication.software
                                        .corelDraw && (
                                        <div className="bg-blue-50 p-2 rounded">
                                          CorelDraw
                                        </div>
                                      )}
                                      {selectedApplication.software
                                        .photoshop && (
                                        <div className="bg-blue-50 p-2 rounded">
                                          Photoshop
                                        </div>
                                      )}
                                      {selectedApplication.software
                                        .adobePremierePro && (
                                        <div className="bg-blue-50 p-2 rounded">
                                          Adobe Premiere Pro
                                        </div>
                                      )}
                                      {selectedApplication.software
                                        .adobeAfterEffect && (
                                        <div className="bg-blue-50 p-2 rounded">
                                          Adobe After Effect
                                        </div>
                                      )}
                                      {selectedApplication.software
                                        .autodeskEagle && (
                                        <div className="bg-blue-50 p-2 rounded">
                                          Autodesk Eagle
                                        </div>
                                      )}
                                      {selectedApplication.software
                                        .arduinoIde && (
                                        <div className="bg-blue-50 p-2 rounded">
                                          Arduino IDE
                                        </div>
                                      )}
                                      {selectedApplication.software
                                        .androidStudio && (
                                        <div className="bg-blue-50 p-2 rounded">
                                          Android Studio
                                        </div>
                                      )}
                                      {selectedApplication.software
                                        .visualStudio && (
                                        <div className="bg-blue-50 p-2 rounded">
                                          Visual Studio
                                        </div>
                                      )}
                                      {selectedApplication.software
                                        .missionPlaner && (
                                        <div className="bg-blue-50 p-2 rounded">
                                          Mission Planer
                                        </div>
                                      )}
                                      {selectedApplication.software
                                        .autodeskInventor && (
                                        <div className="bg-blue-50 p-2 rounded">
                                          Autodesk Inventor
                                        </div>
                                      )}
                                      {selectedApplication.software
                                        .autodeskAutocad && (
                                        <div className="bg-blue-50 p-2 rounded">
                                          Autodesk Autocad
                                        </div>
                                      )}
                                      {selectedApplication.software
                                        .solidworks && (
                                        <div className="bg-blue-50 p-2 rounded">
                                          Solidworks
                                        </div>
                                      )}
                                      {selectedApplication.software.others && (
                                        <div className="bg-blue-50 p-2 rounded col-span-full">
                                          <span className="font-medium">
                                            Others:{" "}
                                          </span>
                                          {selectedApplication.software.others}
                                        </div>
                                      )}
                                    </>
                                  )}
                                  {!selectedApplication.software ||
                                    (Object.values(
                                      selectedApplication.software
                                    ).every((val) => !val) && (
                                      <p>No software experience specified</p>
                                    ))}
                                </div>
                              </div>

                              {/* Essays */}
                              <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3 pb-2 border-b">
                                  Essays
                                </h3>

                                <div className="mb-4">
                                  <h4 className="font-medium mb-2">
                                    Motivation for Joining Robotics:
                                  </h4>
                                  <div className="bg-gray-50 p-3 rounded border">
                                    {selectedApplication.motivation ||
                                      "Not provided"}
                                  </div>
                                </div>

                                <div className="mb-4">
                                  <h4 className="font-medium mb-2">
                                    Future Plans After Joining:
                                  </h4>
                                  <div className="bg-gray-50 p-3 rounded border">
                                    {selectedApplication.futurePlans ||
                                      "Not provided"}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-medium mb-2">
                                    Why Should Be Accepted:
                                  </h4>
                                  <div className="bg-gray-50 p-3 rounded border">
                                    {selectedApplication.whyYouShouldBeAccepted ||
                                      "Not provided"}
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                                <button
                                  onClick={() => {
                                    if (
                                      confirm(
                                        "Are you sure you want to delete this application? This action cannot be undone."
                                      )
                                    ) {
                                      deleteApplication(
                                        selectedApplication._id
                                      );
                                      closeDetailModal();
                                    }
                                  }}
                                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                                >
                                  Delete Application
                                </button>
                                <button
                                  onClick={closeDetailModal}
                                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
                                >
                                  Close
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </tr>
                  )) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No applications found.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
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
                window.scrollTo({ top: 0, behavior: 'smooth' });
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
