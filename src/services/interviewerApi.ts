import {
  InterviewerUser,
  InterviewCandidate,
  InterviewSession,
  InterviewFormData,
  InterviewFormSubmit,
  ApiResponse,
  PaginationInfo,
} from "@/types/interview";

class InterviewerApiService {
  async fetchCandidates(
    token: string,
    page: number = 1,
    limit: number = 10,
    search: string = "",
    lightweight: boolean = false
  ): Promise<
    ApiResponse<InterviewCandidate[]> & { pagination: PaginationInfo }
  > {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append("search", search);
    if (lightweight) params.append("lightweight", "true");

    const response = await fetch(`/api/interview/applications?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Gagal mengambil data peserta");
    }

    return await response.json();
  }

  async createSession(
    token: string,
    sessionData: {
      applicantId: string;
      interviewDate?: string;
      location?: string;
      notes?: string;
    }
  ): Promise<ApiResponse<InterviewSession>> {
    const response = await fetch("/api/interview/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Gagal membuat sesi wawancara");
    }

    return await response.json();
  }

  async getInterviewForm(
    token: string,
    sessionId?: string
  ): Promise<
    ApiResponse<{
      questions: InterviewFormData[];
      session?: InterviewSession;
      totalQuestions: number;
    }>
  > {
    const params = sessionId ? `?sessionId=${sessionId}` : "";

    const response = await fetch(`/api/interview/forms${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Gagal mengambil form wawancara");
    }

    return await response.json();
  }

  async submitInterviewForm(
    token: string,
    formData: InterviewFormSubmit
  ): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    const response = await fetch("/api/interview/forms/submit", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Gagal menyimpan hasil wawancara");
    }

    return await response.json();
  }

  async downloadPDF(token: string, sessionId: string): Promise<void> {
    const response = await fetch(`/api/interview/download-pdf/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Gagal download PDF");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `wawancara-${sessionId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async getInterviewHistory(
    token: string,
    page: number = 1,
    limit: number = 10,
    status: string = "all"
  ): Promise<
    ApiResponse<InterviewSession[]> & {
      pagination: PaginationInfo;
      summary: {
        totalSessions: number;
        completedSessions: number;
        scheduledSessions: number;
        inProgressSessions: number;
      };
    }
  > {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      status,
    });

    const response = await fetch(`/api/interview/history?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Gagal mengambil riwayat wawancara");
    }

    return await response.json();
  }

  async login(
    identifier: string,
    password: string
  ): Promise<{
    success: boolean;
    message: string;
    token?: string;
    interviewer?: InterviewerUser;
  }> {
    const response = await fetch("/api/interview/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login gagal");
    }

    return data;
  }
}

export const interviewerApi = new InterviewerApiService();
