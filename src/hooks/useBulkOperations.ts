"use client";

import { useState } from "react";
import { ApplicationData, ApplicationStatus } from "@/types";
import { exportApplicationsToCSV } from "@/utils/csvExport";

export const useBulkOperations = (
  applications: ApplicationData[],
  setApplications: React.Dispatch<React.SetStateAction<ApplicationData[]>>,
  token: string | null
) => {
  const [selectedApplications, setSelectedApplications] = useState<string[]>(
    []
  );
  const [selectAll, setSelectAll] = useState(false);

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
      setSelectedApplications(applications.map((app) => app.id));
    }
    setSelectAll(!selectAll);
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

  // Handler untuk export CSV terpilih
  const handleBulkExportCSV = () => {
    const selectedData = applications.filter((app) =>
      selectedApplications.includes(app.id)
    );
    exportApplicationsToCSV(selectedData);
  };

  return {
    selectedApplications,
    selectAll,
    setSelectedApplications,
    handleSelectApplication,
    handleSelectAll,
    handleBulkStatusUpdate,
    handleBulkDownloadPDF,
    handleBulkExportCSV,
  };
};
