"use client";

import { useState, useEffect, useCallback } from "react";
import { ApplicationData } from "@/types";
import { useApplicationDetail } from "@/hooks/admin/useApplicationDetail";
import { useModalNavigation } from "@/hooks/admin/useModalNavigation";

// Import modular components
import DetailModalHeader from "./DetailModalHeader";
import DetailModalTabs from "./DetailModalTabs";
import OverviewSection from "./OverviewSection";
import PersonalInfoSection from "./PersonalInfoSection";
import AcademicInfoSection from "./AcademicInfoSection";
import SoftwareExperienceSection from "./SoftwareExperienceSection";
import EssaySection from "./EssaySection";
import FilesSection from "./FilesSection";
import ActionButtonsSection from "./ActionButtonsSection";

interface ApplicationDetailModalProps {
  application: ApplicationData;
  onClose: () => void;
  onDelete: (id: string) => void;
  onStatusChange: (
    id: string,
    status:
      | "SEDANG_DITINJAU"
      | "DAFTAR_PENDEK"
      | "INTERVIEW"
      | "DITERIMA"
      | "DITOLAK"
  ) => void;
}

export default function ApplicationDetailModal({
  application,
  onClose,
  onDelete,
  onStatusChange,
}: ApplicationDetailModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  // Application detail management with anti-timeout
  const {
    data: detailedData,
    loading,
    error,
    isRefreshing,
    updateStatus,
    deleteApplication,
    downloadPDF,
    retry,
  } = useApplicationDetail({
    applicationId: application.id,
    initialData: application,
  });

  // Modal navigation management
  const navigation = useModalNavigation({
    initialTab: "overview",
  });

  // Use detailed data if available, fallback to initial application
  const currentData = detailedData || application;

  // Debug logging untuk melihat data yang diterima
  console.log("🔍 ApplicationDetailModal Data:", {
    hasDetailedData: !!detailedData,
    hasInitialData: !!application,
    currentDataKeys: currentData ? Object.keys(currentData) : [],
    essayFields: {
      motivation: currentData?.motivation,
      futurePlans: currentData?.futurePlans,
      whyYouShouldBeAccepted: currentData?.whyYouShouldBeAccepted,
    },
    fileFields: {
      photo: !!currentData?.photo,
      studentCard: !!currentData?.studentCard,
      studyPlanCard: !!currentData?.studyPlanCard,
    }
  });

  // Handle status change with optimistic updates
  const handleStatusChange = async (
    newStatus:
      | "SEDANG_DITINJAU"
      | "DAFTAR_PENDEK"
      | "INTERVIEW"
      | "DITERIMA"
      | "DITOLAK"
  ) => {
    console.log("🔄 Attempting status change:", { applicationId: application.id, newStatus });
    
    const success = await updateStatus(newStatus);
    if (success) {
      console.log("✅ Status update successful");
      onStatusChange(application.id, newStatus);
      alert("Status berhasil diperbarui!");
    } else {
      console.error("❌ Status update failed");
      alert("Gagal mengupdate status. Silakan periksa koneksi dan coba lagi.");
    }
  };

  // Handle delete with confirmation
  const handleDelete = async () => {
    const confirmMessage = `Apakah Anda yakin ingin menghapus pendaftaran dari "${currentData.fullName}"?\\n\\nTindakan ini tidak dapat dibatalkan dan akan menghapus semua data termasuk file upload.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    const success = await deleteApplication();
    if (success) {
      onDelete(application.id);
      handleClose();
    } else {
      alert("Gagal menghapus pendaftaran. Silakan coba lagi.");
    }
  };

  // Handle download PDF
  const handleDownloadPDF = async () => {
    const success = await downloadPDF();
    if (!success) {
      alert("Gagal mendownload PDF. Silakan coba lagi.");
    }
  };

  // Handle modal close with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Render content based on active tab
  const renderTabContent = () => {
    const { activeTab } = navigation;

    switch (activeTab) {
      case "overview":
        return (
          <OverviewSection
            data={currentData}
            onStatusChange={handleStatusChange}
            isUpdating={loading || isRefreshing}
          />
        );
      case "personal":
        return <PersonalInfoSection data={currentData} />;
      case "academic":
        return <AcademicInfoSection data={currentData} />;
      case "software":
        return <SoftwareExperienceSection data={currentData} />;
      case "essays":
        return <EssaySection data={currentData} />;
      case "files":
        return <FilesSection data={currentData} />;
      case "actions":
        return (
          <ActionButtonsSection
            data={currentData}
            onStatusUpdate={handleStatusChange}
            onDownloadPDF={handleDownloadPDF}
            onDelete={handleDelete}
            onClose={handleClose}
          />
        );
      default:
        return (
          <OverviewSection
            data={currentData}
            onStatusChange={handleStatusChange}
          />
        );
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all duration-200 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden transition-all duration-200 mx-4 ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Modal Header */}
        <DetailModalHeader
          data={currentData}
          onClose={handleClose}
          isLoading={loading || isRefreshing}
        />

        {/* Modal Tabs */}
        <DetailModalTabs navigation={navigation} />

        {/* Modal Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
          {error ? (
            // Error State
            <div className="p-8 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-red-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Gagal Memuat Data
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={retry}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          ) : loading && !currentData ? (
            // Loading State
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Memuat Data Pendaftaran
              </h3>
              <p className="text-gray-600">
                Sedang mengambil informasi detail...
              </p>
            </div>
          ) : (
            // Main Content
            <div className="p-6">{renderTabContent()}</div>
          )}
        </div>

        {/* Loading Overlay for Refreshing */}
        {isRefreshing && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl p-6 flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700 font-medium">
                Memperbarui data...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
