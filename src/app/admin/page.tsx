"use client";

import { useState } from "react";
import { ApplicationData } from "@/types";

export default function AdminPage() {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const authenticate = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple authentication - in a real app, use proper auth
    if (password === "admin123") {
      // Change this to a secure password
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

  // Keep only this version of updateApplicationStatus with confirmation dialog
  const updateApplicationStatus = async (id: string, newStatus: string) => {
    // Add confirmation dialog
    if (!confirm(`Are you sure you want to change the status to "${newStatus}"?`)) {
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

  // Filter applications based on search term and status
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phoneNumber?.includes(searchTerm);

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
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

  // Add this new function to delete an application
  const deleteApplication = async (id: string) => {
    // Add confirmation dialog
    if (!confirm("Are you sure you want to delete this application? This action cannot be undone.")) {
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
        setApplications(applications.filter(app => app._id !== id));
      } else {
        const data = await response.json();
        alert(`Failed to delete: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("An error occurred while deleting the application");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setApplications([]);
    setError('');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Applications</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
      
      <div className="mb-4 flex justify-end">
        <button
          onClick={exportToCSV}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          disabled={applications.length === 0}
        >
          Export to CSV
        </button>
      </div>

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
                    <select
                      title="Application Status"
                      value={app.status || "Under Review"}
                      onChange={(e) =>
                        updateApplicationStatus(app._id, e.target.value)
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option value="Under Review">Under Review</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview">Interview</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 border">
                    <div className="flex space-x-2">
                      <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
                        onClick={() => alert(JSON.stringify(app, null, 2))}
                      >
                        View
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                        onClick={() => deleteApplication(app._id)}
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
    </div>
  );
}
