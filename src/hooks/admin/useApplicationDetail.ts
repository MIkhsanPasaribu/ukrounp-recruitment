"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ApplicationData } from "@/types";
import { adminApi } from "@/utils/apiClient";

// Interface for API response from detailed endpoint
interface DetailedApplicationResponse {
  success: boolean;
  data: ApplicationData;
  metadata: {
    retrievedAt: string;
    version: string;
  };
}

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
        // Use adminApi for proper token handling
        await adminApi.heartbeat();
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
        setState((prev) => ({
          ...prev,
          loading: !isRefresh,
          isRefreshing: isRefresh,
          error: null,
        }));

        const detailedData = (await adminApi.getApplicationDetail(
          applicationId
        )) as DetailedApplicationResponse;

        console.log("🔍 useApplicationDetail Raw API Response:", {
          apiCallUrl: `/api/admin/applications/${applicationId}/detailed`,
          responseStructure: {
            hasSuccess: "success" in detailedData,
            hasData: "data" in detailedData,
            isDirectObject:
              !("success" in detailedData) && !("data" in detailedData),
          },
          essayFieldsInResponse: {
            motivation: {
              inRoot: "motivation" in detailedData,
              inData: detailedData?.data?.motivation !== undefined,
              rootValue: detailedData?.data?.motivation,
              dataValue: detailedData?.data?.motivation,
            },
            futurePlans: {
              inRoot: "futurePlans" in detailedData,
              inData: detailedData?.data?.futurePlans !== undefined,
              rootValue: detailedData?.data?.futurePlans,
              dataValue: detailedData?.data?.futurePlans,
            },
            whyYouShouldBeAccepted: {
              inRoot: "whyYouShouldBeAccepted" in detailedData,
              inData: detailedData?.data?.whyYouShouldBeAccepted !== undefined,
              rootValue: detailedData?.data?.whyYouShouldBeAccepted,
              dataValue: detailedData?.data?.whyYouShouldBeAccepted,
            },
          },
          fullResponse: detailedData,
        });

        console.log("useApplicationDetail fetched data:", {
          success: detailedData?.success || true,
          hasData: !!(detailedData?.data || detailedData),
          motivation: detailedData?.data?.motivation,
          futurePlans: detailedData?.data?.futurePlans,
          whyYouShouldBeAccepted:
            detailedData?.data?.whyYouShouldBeAccepted ||
            detailedData?.data?.whyYouShouldBeAccepted,
        });

        setState({
          data: (detailedData?.data || detailedData) as ApplicationData, // Handle both formats
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
        await adminApi.updateStatus(applicationId, newStatus);

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
      await adminApi.deleteApplication(applicationId);
      return true;
    } catch (error) {
      console.error("Error deleting application:", error);
      return false;
    }
  }, [applicationId]);

  // Download PDF
  const downloadPDF = useCallback(async () => {
    if (!state.data || !state.data.fullName) return false;

    try {
      const blob = await adminApi.downloadPDF(applicationId);
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

    // Copy current ref value for cleanup
    const currentAbortController = abortControllerRef.current;

    return () => {
      stopHeartbeat();
      if (currentAbortController) {
        currentAbortController.abort();
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
