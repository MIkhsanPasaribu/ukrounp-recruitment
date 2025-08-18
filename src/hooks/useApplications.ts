"use client";

import { useState, useEffect, useCallback } from "react";
import { ApplicationData, ApplicationStatus } from "@/types";
import { adminApi } from "@/services/adminApi";

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const useApplications = (token: string | null) => {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [applicationsPerPage, setApplicationsPerPage] = useState(20);
  const [pagination, setPagination] = useState<PaginationData | null>(null);

  // Function to fetch applications with pagination and timeout
  const fetchApplications = useCallback(
    async (page = 1, limit = 20, search = "", status = "all") => {
      if (!token) return;

      try {
        setLoading(true);
        setError("");

        const data = await adminApi.fetchApplications(token, {
          page,
          limit,
          search,
          status,
        });

        setApplications(data.applications || []);
        setPagination(data.pagination || null);
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

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (token) {
        setCurrentPage(1);
        fetchApplications(1, applicationsPerPage, searchTerm, statusFilter);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter, token, fetchApplications, applicationsPerPage]);

  // Fetch data when dependencies change
  useEffect(() => {
    if (token) {
      fetchApplications(
        currentPage,
        applicationsPerPage,
        searchTerm,
        statusFilter
      );
    }
  }, [
    token,
    currentPage,
    applicationsPerPage,
    searchTerm,
    statusFilter,
    fetchApplications,
  ]);

  // Handle status update
  const handleStatusUpdate = async (
    id: string,
    newStatus: ApplicationStatus
  ) => {
    if (!token) return;

    try {
      await adminApi.updateStatus(token, id, newStatus);
      setApplications(
        applications.map((app) =>
          app.id === id ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  // Handle delete application
  const handleDelete = async (id: string) => {
    if (!token) return;

    if (!confirm("Apakah Anda yakin ingin menghapus data pendaftaran ini?"))
      return;

    try {
      await adminApi.deleteApplication(token, id);
      setApplications(applications.filter((app) => app.id !== id));
      alert("Data pendaftaran berhasil dihapus");
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("Gagal menghapus data pendaftaran");
    }
  };

  // Handler untuk update setelah edit berhasil
  const handleUpdateSuccess = (updatedData: ApplicationData) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === updatedData.id ? updatedData : app))
    );
  };

  return {
    applications,
    setApplications,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    applicationsPerPage,
    setApplicationsPerPage,
    pagination,
    fetchApplications,
    handleStatusUpdate,
    handleDelete,
    handleUpdateSuccess,
  };
};
