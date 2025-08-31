import {
  InterviewAttendance,
  InterviewerAssignment,
  CreateAttendanceRequest,
  CreateAssignmentRequest,
  UpdateAttendanceRequest,
  UpdateAssignmentRequest,
} from "@/types/interview";

// Attendance API functions
export const attendanceApi = {
  // Create new attendance
  async createAttendance(
    data: CreateAttendanceRequest
  ): Promise<{
    success: boolean;
    data?: InterviewAttendance;
    message: string;
  }> {
    try {
      const response = await fetch("/api/admin/interview-attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("❌ Error creating attendance:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat membuat absensi",
      };
    }
  },

  // Get attendance records
  async getAttendanceRecords(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
    } = {}
  ): Promise<{
    success: boolean;
    data?: InterviewAttendance[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasMore: boolean;
    };
    message?: string;
  }> {
    try {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append("page", params.page.toString());
      if (params.limit) searchParams.append("limit", params.limit.toString());
      if (params.search) searchParams.append("search", params.search);
      if (params.status) searchParams.append("status", params.status);

      const response = await fetch(
        `/api/admin/interview-attendance?${searchParams}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("❌ Error fetching attendance:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat mengambil data absensi",
      };
    }
  },

  // Update attendance
  async updateAttendance(
    data: UpdateAttendanceRequest
  ): Promise<{
    success: boolean;
    data?: InterviewAttendance;
    message: string;
  }> {
    try {
      const response = await fetch("/api/admin/interview-attendance", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("❌ Error updating attendance:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat mengupdate absensi",
      };
    }
  },

  // Delete attendance
  async deleteAttendance(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`/api/admin/interview-attendance?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("❌ Error deleting attendance:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat menghapus absensi",
      };
    }
  },
};

// Assignment API functions
export const assignmentApi = {
  // Create new assignment
  async createAssignment(
    data: CreateAssignmentRequest
  ): Promise<{
    success: boolean;
    data?: InterviewerAssignment;
    message: string;
  }> {
    try {
      const response = await fetch("/api/admin/interviewer-assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("❌ Error creating assignment:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat membuat penugasan",
      };
    }
  },

  // Get assignments
  async getAssignments(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      interviewerId?: string;
      status?: string;
    } = {}
  ): Promise<{
    success: boolean;
    data?: InterviewerAssignment[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasMore: boolean;
    };
    message?: string;
  }> {
    try {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append("page", params.page.toString());
      if (params.limit) searchParams.append("limit", params.limit.toString());
      if (params.search) searchParams.append("search", params.search);
      if (params.interviewerId)
        searchParams.append("interviewerId", params.interviewerId);
      if (params.status) searchParams.append("status", params.status);

      const response = await fetch(
        `/api/admin/interviewer-assignments?${searchParams}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("❌ Error fetching assignments:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat mengambil data penugasan",
      };
    }
  },

  // Update assignment
  async updateAssignment(
    data: UpdateAssignmentRequest
  ): Promise<{
    success: boolean;
    data?: InterviewerAssignment;
    message: string;
  }> {
    try {
      const response = await fetch("/api/admin/interviewer-assignments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("❌ Error updating assignment:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat mengupdate penugasan",
      };
    }
  },

  // Delete assignment
  async deleteAssignment(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(
        `/api/admin/interviewer-assignments?id=${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("❌ Error deleting assignment:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat menghapus penugasan",
      };
    }
  },

  // Bulk assign interviewers
  async bulkAssignInterviewers(
    assignments: Array<{
      nim: string;
      interviewerId: string;
      scheduledAt?: string;
      notes?: string;
    }>
  ): Promise<{
    success: boolean;
    successCount?: number;
    failureCount?: number;
    failures?: Array<{ nim: string; error: string }>;
    message: string;
  }> {
    try {
      const results = await Promise.allSettled(
        assignments.map((assignment) => this.createAssignment(assignment))
      );

      const successes = results.filter(
        (result) => result.status === "fulfilled" && result.value.success
      );
      const failures = results
        .map((result, index) => ({ result, index }))
        .filter(
          ({ result }) =>
            result.status === "rejected" ||
            (result.status === "fulfilled" && !result.value.success)
        )
        .map(({ result, index }) => ({
          nim: assignments[index].nim,
          error:
            result.status === "rejected"
              ? result.reason?.message || "Unknown error"
              : (
                  result as PromiseFulfilledResult<{
                    success: boolean;
                    message: string;
                  }>
                ).value.message || "Unknown error",
        }));

      return {
        success: successes.length > 0,
        successCount: successes.length,
        failureCount: failures.length,
        failures,
        message: `${successes.length} penugasan berhasil, ${failures.length} gagal`,
      };
    } catch (error) {
      console.error("❌ Error in bulk assignment:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat melakukan penugasan massal",
      };
    }
  },
};

// Combined API functions
export const adminInterviewApi = {
  attendance: attendanceApi,
  assignment: assignmentApi,

  // Get interviewers list
  async getInterviewers(): Promise<{
    success: boolean;
    data?: Array<{ id: string; fullName: string; email: string }>;
    message?: string;
  }> {
    try {
      const response = await fetch("/api/admin/interviewers", {
        method: "GET",
        credentials: "include",
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("❌ Error fetching interviewers:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat mengambil data pewawancara",
      };
    }
  },

  // Get candidates with INTERVIEW status
  async getInterviewCandidates(
    params: {
      page?: number;
      limit?: number;
      search?: string;
    } = {}
  ): Promise<{
    success: boolean;
    data?: Array<{
      id: string;
      nim: string;
      fullName: string;
      email: string;
      faculty: string;
      department: string;
      studyProgram: string;
      status: string;
    }>;
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasMore: boolean;
    };
    message?: string;
  }> {
    try {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append("page", params.page.toString());
      if (params.limit) searchParams.append("limit", params.limit.toString());
      if (params.search) searchParams.append("search", params.search);
      searchParams.append("status", "INTERVIEW");

      const response = await fetch(`/api/admin/applications?${searchParams}`, {
        method: "GET",
        credentials: "include",
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("❌ Error fetching interview candidates:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat mengambil data kandidat wawancara",
      };
    }
  },
};
