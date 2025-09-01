"use client";

import { useState } from "react";

interface InterviewWorkflowProps {
  onAttendanceConfirmed?: (nim: string) => void;
  onInterviewerAssigned?: (applicantId: string, interviewer: string) => void;
}

interface WaitingAssignmentApplicant {
  id: string;
  nim: string;
  fullName: string;
  email: string;
  faculty: string;
  department: string;
  interviewStatus: string;
}

export default function InterviewWorkflow({
  onAttendanceConfirmed,
  onInterviewerAssigned,
}: InterviewWorkflowProps) {
  const [nim, setNim] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [waitingApplicants, setWaitingApplicants] = useState<
    WaitingAssignmentApplicant[]
  >([]);

  // Step 1: Konfirmasi kehadiran dengan NIM
  const handleAttendanceConfirmation = async () => {
    if (!nim.trim()) {
      setMessage("Silakan masukkan NIM");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/interview-workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ nim: nim.trim() }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage(`✅ ${result.message}`);
        setNim("");
        onAttendanceConfirmed?.(nim.trim());
        // Refresh waiting list
        fetchWaitingApplicants();
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error("Error confirming attendance:", error);
      setMessage("❌ Terjadi kesalahan saat mengkonfirmasi kehadiran");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Assign interviewer
  const handleInterviewerAssignment = async (
    applicantId: string,
    interviewerUsername: string
  ) => {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/interview-workflow", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({
          applicantId,
          interviewerUsername,
          scheduledDateTime: new Date().toISOString(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage(`✅ ${result.message}`);
        onInterviewerAssigned?.(applicantId, interviewerUsername);
        // Refresh waiting list
        fetchWaitingApplicants();
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error("Error assigning interviewer:", error);
      setMessage("❌ Terjadi kesalahan saat menugaskan interviewer");
    } finally {
      setLoading(false);
    }
  };

  // Fetch applicants waiting for assignment
  const fetchWaitingApplicants = async () => {
    try {
      const response = await fetch("/api/admin/applications?status=INTERVIEW", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Filter only those waiting for assignment
        const waiting = result.data.filter(
          (
            app: WaitingAssignmentApplicant & {
              attendanceConfirmed?: boolean;
              assignedInterviewer?: string;
            }
          ) => app.attendanceConfirmed && !app.assignedInterviewer
        );
        setWaitingApplicants(waiting);
      }
    } catch (error) {
      console.error("Error fetching waiting applicants:", error);
    }
  };

  const interviewers = [
    "pewawancara1",
    "pewawancara2",
    "pewawancara3",
    "pewawancara4",
    "pewawancara5",
    "pewawancara6",
    "pewawancara7",
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-6 text-gray-800">
        🎯 Workflow Interview
      </h3>

      {/* Step 1: Konfirmasi Kehadiran */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-lg font-medium mb-3 text-blue-800">
          📝 Step 1: Konfirmasi Kehadiran
        </h4>
        <p className="text-sm text-gray-600 mb-3">
          Masukkan NIM pendaftar yang telah hadir untuk mengubah statusnya ke
          INTERVIEW
        </p>

        <div className="flex gap-3">
          <input
            type="text"
            value={nim}
            onChange={(e) => setNim(e.target.value)}
            placeholder="Masukkan NIM (contoh: 25350082)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={handleAttendanceConfirmation}
            disabled={loading || !nim.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "⏳ Proses..." : "✅ Konfirmasi Hadir"}
          </button>
        </div>
      </div>

      {/* Step 2: Daftar Menunggu Assignment */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-lg font-medium text-green-800">
            👥 Step 2: Menunggu Penugasan Interviewer (
            {waitingApplicants.length})
          </h4>
          <button
            onClick={fetchWaitingApplicants}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            🔄 Refresh
          </button>
        </div>

        {waitingApplicants.length === 0 ? (
          <p className="text-gray-600 text-sm">
            Tidak ada pendaftar yang menunggu penugasan interviewer
          </p>
        ) : (
          <div className="space-y-3">
            {waitingApplicants.map((applicant) => (
              <div
                key={applicant.id}
                className="flex justify-between items-center p-3 bg-white rounded border"
              >
                <div>
                  <div className="font-medium">{applicant.fullName}</div>
                  <div className="text-sm text-gray-600">
                    NIM: {applicant.nim} • {applicant.faculty} -{" "}
                    {applicant.department}
                  </div>
                </div>

                <div className="flex gap-2">
                  {interviewers.map((interviewer) => (
                    <button
                      key={interviewer}
                      onClick={() =>
                        handleInterviewerAssignment(applicant.id, interviewer)
                      }
                      disabled={loading}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                    >
                      {interviewer.replace("pewawancara", "P")}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-3 rounded-md ${
            message.includes("✅")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
