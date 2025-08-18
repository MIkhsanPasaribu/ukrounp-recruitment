"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Application } from "@/types";
import { useStreamingData, StreamingProgress } from "./StreamingDataLoader";
import ApplicationDetailModal from "./ApplicationDetailModal";
import ModifyDataModal from "./ModifyDataModal";
import Pagination from "./Pagination";

interface EnhancedAdminDashboardProps {
  initialApplications?: Application[];
  initialPagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function EnhancedAdminDashboard({
  initialApplications = [],
  initialPagination,
}: EnhancedAdminDashboardProps) {
  // State management
  const [applications, setApplications] =
    useState<Application[]>(initialApplications);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(initialPagination?.page || 1);
  const [useStreaming, setUseStreaming] = useState(false);
  const [useInfiniteScroll, setUseInfiniteScroll] = useState(false);

  // Modal states
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [editingApplication, setEditingApplication] =
    useState<Application | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Build API endpoint with parameters
  const apiEndpoint = useMemo(() => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: "50",
      search: debouncedSearch,
      status: statusFilter,
      stream: useStreaming.toString(),
    });
    return `/api/admin/applications?${params.toString()}`;
  }, [currentPage, debouncedSearch, statusFilter, useStreaming]);

  // Streaming data handler
  const handleStreamingData = useCallback(
    (data: unknown) => {
      if (Array.isArray(data)) {
        if (useInfiniteScroll) {
          setApplications((prev) => [...prev, ...data]);
        } else {
          setApplications(data);
        }
      } else if (data && typeof data === "object" && "applications" in data) {
        const result = data as {
          applications: Application[];
          pagination?: typeof pagination;
        };
        if (useInfiniteScroll) {
          setApplications((prev) => [...prev, ...result.applications]);
        } else {
          setApplications(result.applications);
        }
        if (result.pagination) {
          setPagination(result.pagination);
        }
      }
    },
    [useInfiniteScroll]
  );

  const handleStreamingComplete = useCallback(() => {
    setLoading(false);
  }, []);

  const handleStreamingError = useCallback((error: string) => {
    setError(error);
    setLoading(false);
  }, []);

  // Streaming hook
  const streamingState = useStreamingData({
    endpoint: apiEndpoint,
    onData: handleStreamingData,
    onComplete: handleStreamingComplete,
    onError: handleStreamingError,
    enabled: useStreaming,
    autoStart: false,
  });

  // Standard fetch function
  const fetchApplications = useCallback(
    async (reset = false) => {
      if (useStreaming) {
        setLoading(true);
        if (reset) {
          setApplications([]);
          setPagination(undefined);
          setError(null);
        }
        streamingState.startStreaming();
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(apiEndpoint);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (reset || !useInfiniteScroll) {
          setApplications(data.applications || []);
        } else {
          setApplications((prev) => [...prev, ...(data.applications || [])]);
        }

        if (data.pagination) {
          setPagination(data.pagination);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch applications";
        setError(errorMessage);
        console.error("Error fetching applications:", err);
      } finally {
        setLoading(false);
      }
    },
    [apiEndpoint, useStreaming, useInfiniteScroll, streamingState]
  );

  // Effect to fetch data when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchApplications(true);
  }, [debouncedSearch, statusFilter, useStreaming, fetchApplications]);

  // Effect to fetch data when page changes (standard pagination only)
  useEffect(() => {
    if (!useInfiniteScroll) {
      fetchApplications(false);
    }
  }, [currentPage, fetchApplications, useInfiniteScroll]);

  // Infinite scroll handler
  const loadMore = useCallback(() => {
    if (useInfiniteScroll && pagination?.hasNext && !loading) {
      setCurrentPage((prev) => prev + 1);
      fetchApplications(false);
    }
  }, [useInfiniteScroll, pagination?.hasNext, loading, fetchApplications]);

  // Force refresh with cache invalidation
  const forceRefresh = useCallback(async () => {
    const refreshEndpoint = `${apiEndpoint}&refresh=true`;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(refreshEndpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setApplications(data.applications || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to refresh data";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint]);

  // Clear client-side cache
  const clearCache = useCallback(() => {
    if (typeof window !== "undefined" && "caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
  }, []);

  // Modal handlers
  const handleViewDetails = useCallback((application: Application) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  }, []);

  const handleEditApplication = useCallback((application: Application) => {
    setEditingApplication(application);
    setShowEditModal(true);
  }, []);

  const handleUpdateSuccess = useCallback(() => {
    setShowEditModal(false);
    setEditingApplication(null);
    fetchApplications(true); // Refresh data after update
  }, [fetchApplications]);

  // Status update handler
  const updateStatus = useCallback(async (id: string, newStatus: string) => {
    try {
      const response = await fetch("/api/update-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id
            ? { ...app, status: newStatus as Application["status"] }
            : app
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update application status");
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or NIM..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="SEDANG_DITINJAU">Pending Review</option>
              <option value="DAFTAR_PENDEK">Shortlisted</option>
              <option value="INTERVIEW">Interview</option>
              <option value="DITERIMA">Accepted</option>
              <option value="DITOLAK">Rejected</option>
            </select>
          </div>

          {/* Streaming Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loading Mode
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={useStreaming}
                  onChange={(e) => setUseStreaming(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Streaming</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={useInfiniteScroll}
                  onChange={(e) => setUseInfiniteScroll(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Infinite Scroll</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actions
            </label>
            <div className="flex space-x-2">
              <button
                onClick={forceRefresh}
                disabled={loading}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                Refresh
              </button>
              <button
                onClick={clearCache}
                className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
              >
                Clear Cache
              </button>
            </div>
          </div>
        </div>

        {/* Performance indicators */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Total: {pagination?.total || applications.length} applications
            {useStreaming && (
              <span className="ml-2 text-blue-600">
                (Streaming:{" "}
                {streamingState.isConnected ? "Connected" : "Disconnected"})
              </span>
            )}
          </div>
          <div>
            Page: {pagination?.page || 1} of {pagination?.totalPages || 1}
          </div>
        </div>
      </div>

      {/* Loading Progress */}
      {useStreaming && (
        <StreamingProgress
          current={streamingState.progress.current}
          total={streamingState.progress.total}
          isLoading={streamingState.isLoading}
          isConnected={streamingState.isConnected}
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Applications Grid */}
      <div className="grid gap-4">
        {applications.map((application) => (
          <div
            key={application.id}
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {application.fullName}
                </h3>
                <p className="text-gray-600">{application.email}</p>
                <p className="text-gray-600">NIM: {application.nim}</p>
                <p className="text-gray-600">
                  {application.faculty} - {application.department}
                </p>
                <p className="text-gray-600">
                  Program: {application.studyProgram} (
                  {application.educationLevel})
                </p>
              </div>

              <div className="flex flex-col items-end space-y-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    application.status === "DITERIMA"
                      ? "bg-green-100 text-green-800"
                      : application.status === "DITOLAK"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {application.status}
                </span>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewDetails(application)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEditApplication(application)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Edit
                  </button>
                  {application.status === "SEDANG_DITINJAU" && (
                    <>
                      <button
                        onClick={() => updateStatus(application.id, "DITERIMA")}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateStatus(application.id, "DITOLAK")}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Infinite Scroll Load More */}
      {useInfiniteScroll && pagination?.hasNext && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {/* Standard Pagination */}
      {!useInfiniteScroll && pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          itemsPerPage={pagination.limit}
          totalItems={pagination.total}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={() => {}} // Not implemented in this version
        />
      )}

      {/* Modals */}
      {showDetailModal && selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedApplication(null);
          }}
          onDelete={() => {
            // Handle delete if needed
            setShowDetailModal(false);
            setSelectedApplication(null);
          }}
          onStatusChange={(newStatus) => {
            updateStatus(selectedApplication.id, newStatus);
            setShowDetailModal(false);
            setSelectedApplication(null);
          }}
        />
      )}

      {showEditModal && editingApplication && (
        <ModifyDataModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingApplication(null);
          }}
          applicationData={editingApplication}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
}
