"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ApplicationData } from "@/types";

interface UseApplicationDetailProps {
  applicationId: string;
  initialData?: ApplicationData;
}

interface ApplicationDetailState {
  data: ApplicationData | null;
  loading: boolean;
  error: string | null;
  isRefreshing: boolean;
}

export function useApplicationDetail({
  applicationId,
  initialData,
}: UseApplicationDetailProps) {
  const [state, setState] = useState<ApplicationDetailState>({
    data: initialData || null,
    loading: !initialData,
    error: null,
    isRefreshing: false,
  });

  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Anti-timeout heartbeat mechanism
  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }

    heartbeatRef.current = setInterval(async () => {
      try {
        await fetch("/api/admin/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timestamp: Date.now() }),
        });
      } catch (error) {
        console.warn("Heartbeat gagal:", error);
      }
    }, 30000); // Setiap 30 detik
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  // Fetch detailed application data
  const fetchApplicationDetail = useCallback(
    async (isRefresh = false) => {
      try {
        // Cancel previous request if exists
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        setState((prev) => ({
          ...prev,
          loading: !isRefresh,
          isRefreshing: isRefresh,
          error: null,
        }));

        const response = await fetch(
          `/api/admin/applications/${applicationId}/detailed`,
          {
            signal: abortControllerRef.current.signal,
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Gagal mengambil data: ${response.statusText}`);
        }

        const detailedData = await response.json();

        setState({
          data: detailedData,
          loading: false,
          error: null,
          isRefreshing: false,
        });

        startHeartbeat();
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return; // Request was cancelled, don't update state
        }

        const errorMessage =
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan tidak terduga";

        setState((prev) => ({
          ...prev,
          loading: false,
          isRefreshing: false,
          error: errorMessage,
        }));
      }
    },
    [applicationId, startHeartbeat]
  );

  // Update application status
  const updateStatus = useCallback(
    async (
      newStatus:
        | "SEDANG_DITINJAU"
        | "DAFTAR_PENDEK"
        | "INTERVIEW"
        | "DITERIMA"
        | "DITOLAK"
    ) => {
      if (!state.data) return false;

      try {
        const response = await fetch("/api/admin/update-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: applicationId,
            status: newStatus,
          }),
        });

        if (!response.ok) {
          throw new Error("Gagal mengupdate status");
        }

        setState((prev) => ({
          ...prev,
          data: prev.data ? { ...prev.data, status: newStatus } : null,
        }));

        return true;
      } catch (error) {
        console.error("Error updating status:", error);
        return false;
      }
    },
    [applicationId, state.data]
  );

  // Delete application
  const deleteApplication = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/delete-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: applicationId }),
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus pendaftaran");
      }

      return true;
    } catch (error) {
      console.error("Error deleting application:", error);
      return false;
    }
  }, [applicationId]);

  // Download PDF
  const downloadPDF = useCallback(async () => {
    if (!state.data) return false;

    try {
      const response = await fetch(`/api/admin/download-pdf/${applicationId}`);

      if (!response.ok) {
        throw new Error("Gagal mendownload PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `formulir-pendaftaran-${state.data.fullName.replace(
        /\s+/g,
        "-"
      )}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return true;
    } catch (error) {
      console.error("Error downloading PDF:", error);
      return false;
    }
  }, [applicationId, state.data]);

  // Refresh data
  const refreshData = useCallback(() => {
    fetchApplicationDetail(true);
  }, [fetchApplicationDetail]);

  // Initialize data fetching
  useEffect(() => {
    if (!initialData) {
      fetchApplicationDetail();
    } else {
      startHeartbeat();
    }

    return () => {
      stopHeartbeat();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchApplicationDetail, initialData, startHeartbeat, stopHeartbeat]);

  return {
    ...state,
    updateStatus,
    deleteApplication,
    downloadPDF,
    refreshData,
    retry: () => fetchApplicationDetail(),
  };
}

export type UseApplicationDetailReturn = ReturnType<
  typeof useApplicationDetail
>;
