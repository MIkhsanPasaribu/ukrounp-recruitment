import { ApplicationStatus } from "@/types";

interface FetchApplicationsParams {
  page: number;
  limit: number;
  search: string;
  status: string;
}

class AdminApiService {
  async fetchApplications(token: string, params: FetchApplicationsParams) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const searchParams = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
      lightweight: "false", // Use full data for admin view
    });

    if (params.search) searchParams.append("search", params.search);
    if (params.status !== "all") searchParams.append("status", params.status);

    try {
      const response = await fetch(`/api/admin/applications?${searchParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error dalam mengambil data aplikasi"
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async updateStatus(token: string, id: string, status: ApplicationStatus) {
    const response = await fetch("/api/admin/update-status", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, status }),
    });

    if (!response.ok) {
      throw new Error("Failed to update status");
    }

    return response.json();
  }

  async deleteApplication(token: string, id: string) {
    const response = await fetch("/api/admin/delete-application", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Gagal menghapus data pendaftaran");
    }

    return response.json();
  }

  async downloadPDF(id: string) {
    const response = await fetch(`/api/admin/download-pdf/${id}`);
    if (!response.ok) throw new Error("Gagal download PDF");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `formulir-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

export const adminApi = new AdminApiService();
