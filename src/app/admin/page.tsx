"use client";

import { useState, useEffect } from "react";
import { ApplicationData } from "@/types";
import Link from 'next/link';
import AdminDashboard from '@/components/AdminDashboard';

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
  const [registrationStatusLoading, setRegistrationStatusLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('applications'); // Add this state

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
    if (!confirm(`Are you sure you want to ${isRegistrationOpen ? "close" : "open"} registration?`)) {
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
        alert(`Registration ${!isRegistrationOpen ? "opened" : "closed"} successfully`);
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

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        {/* Back button to landing page */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
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
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        <div className="flex space-x-4">
          {/* Registration control button */}
          <button
            onClick={toggleRegistrationStatus}
            className={`px-4 py-2 rounded-md font-medium ${
              isRegistrationOpen 
                ? "bg-red-600 hover:bg-red-700 text-white" 
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
            disabled={registrationStatusLoading}
          >
            {registrationStatusLoading 
              ? "Updating..." 
              : isRegistrationOpen 
                ? "Close Registration" 
                : "Open Registration"}
          </button>
          
          <button
            onClick={exportToCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            disabled={applications.length === 0}
          >
            Export to CSV
          </button>
          
          <button
            onClick={handleLogout}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Logout
          </button>
        </div>
      </div>
      
      {/* Registration status indicator */}
      <div className={`mb-4 p-3 rounded-md ${
        isRegistrationOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}>
        <p className="font-medium">
          Registration is currently {isRegistrationOpen ? "OPEN" : "CLOSED"}
        </p>
      </div>

      {/* Tab navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
              activeTab === 'applications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Applications
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
              activeTab === 'statistics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Statistics
          </button>
        </nav>
      </div>

      {activeTab === 'statistics' ? (
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
                  {filteredApplications.map((app, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="px-4 py-2 border">{app.email}</td>
                      <td className="px-4 py-2 border">{app.fullName}</td>
                      <td className="px-4 py-2 border">{app.faculty}</td>
                      <td className="px-4 py-2 border">{app.department}</td>
                      <td className="px-4 py-2 border">{app.phoneNumber}</td>
                      <td className="px-4 py-2 border">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            app.status === "Accepted"
                              ? "bg-green-100 text-green-800"
                              : app.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : app.status === "Interview"
                              ? "bg-blue-100 text-blue-800"
                              : app.status === "Shortlisted"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {app.status || "Under Review"}
                        </span>
                      </td>
                      <td className="px-4 py-2 border">
                        <div className="flex space-x-2">
                          <select
                            title="Change Status"
                            onChange={(e) =>
                              updateApplicationStatus(app._id, e.target.value)
                            }
                            className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                            value={app.status || "Under Review"}
                          >
                            <option value="Under Review">Under Review</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Interview">Interview</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          <button
                            onClick={() => deleteApplication(app._id)}
                            className="px-2 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
