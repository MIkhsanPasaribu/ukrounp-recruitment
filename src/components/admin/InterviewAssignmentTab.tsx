"use client";

import { useState, useEffect } from "react";

interface InterviewCandidate {
  id: string;
  nim: string;
  fullName: string;
  email: string;
  faculty: string;
  department: string;
  assignedInterviewer?: string;
  attendanceConfirmed?: boolean;
}

interface InterviewAssignmentTabProps {
  token: string;
}

export default function InterviewAssignmentTab({
  token,
}: InterviewAssignmentTabProps) {
  const [candidates, setCandidates] = useState<InterviewCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [nimInput, setNimInput] = useState("");
  const [confirmingAttendance, setConfirmingAttendance] = useState(false);
  const [assigningInterviewer, setAssigningInterviewer] = useState<
    string | null
  >(null);

  const interviewers = [
    { username: "pewawancara1", label: "P1", fullName: "Pewawancara 1" },
    { username: "pewawancara2", label: "P2", fullName: "Pewawancara 2" },
    { username: "pewawancara3", label: "P3", fullName: "Pewawancara 3" },
    { username: "pewawancara4", label: "P4", fullName: "Pewawancara 4" },
    { username: "pewawancara5", label: "P5", fullName: "Pewawancara 5" },
    { username: "pewawancara6", label: "P6", fullName: "Pewawancara 6" },
    { username: "pewawancara7", label: "P7", fullName: "Pewawancara 7" },
  ];

  // Fetch interview candidates
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/applications?status=INTERVIEW", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCandidates(data.applications || []);
      } else {
        console.error("Failed to fetch candidates");
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  // Confirm attendance by NIM
  const confirmAttendance = async () => {
    if (!nimInput.trim()) {
      alert("Masukkan NIM terlebih dahulu");
      return;
    }

    setConfirmingAttendance(true);
    try {
      console.log("Confirming attendance for NIM:", nimInput.trim());
      
      const response = await fetch("/api/admin/interview-workflow", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "mark_attendance",
          nim: nimInput.trim(),
        }),
      });

      const result = await response.json();
      console.log("Attendance confirmation response:", result);

      if (response.ok) {
        alert(
          `Kehadiran ${result.data.applicant.fullName} berhasil dikonfirmasi`
        );
        setNimInput("");
        fetchCandidates(); // Refresh data
      } else {
        console.error("Attendance confirmation failed:", result);
        alert(result.message || "Gagal mengkonfirmasi kehadiran");
      }
    } catch (error) {
      console.error("Error confirming attendance:", error);
      alert("Terjadi kesalahan saat mengkonfirmasi kehadiran");
    } finally {
      setConfirmingAttendance(false);
    }
  };

  // Assign interviewer
  const assignInterviewer = async (
    candidateId: string,
    interviewerUsername: string
  ) => {
    setAssigningInterviewer(candidateId);
    try {
      const response = await fetch("/api/admin/interview-workflow", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "assign_interviewer",
          applicantId: candidateId,
          interviewerId: interviewerUsername,
        }),
      });

      const result = await response.json();
      console.log("Assignment response:", result);

      if (response.ok) {
        alert(
          `${result.data.interviewer.fullName} berhasil ditugaskan untuk ${result.data.applicant.fullName}`
        );
        fetchCandidates(); // Refresh data
      } else {
        console.error("Assignment failed:", result);
        alert(result.message || "Gagal menugaskan pewawancara");
      }
    } catch (error) {
      console.error("Error assigning interviewer:", error);
      alert("Terjadi kesalahan saat menugaskan pewawancara");
    } finally {
      setAssigningInterviewer(null);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCandidates();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin mx-auto h-8 w-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
          <p className="mt-2 text-gray-600">
            Memuat data kandidat interview...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>🎤</span>
          Manajemen Interview & Assignment Pewawancara
        </h2>
        <p className="text-gray-600">
          Kelola kehadiran kandidat dan tugaskan pewawancara untuk melakukan
          interview.
        </p>
      </div>

      {/* Attendance Confirmation Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <span>✅</span>
          Konfirmasi Kehadiran
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={nimInput}
            onChange={(e) => setNimInput(e.target.value)}
            placeholder="Masukkan NIM untuk konfirmasi kehadiran..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            onKeyPress={(e) => e.key === "Enter" && confirmAttendance()}
            disabled={confirmingAttendance}
          />
          <button
            onClick={confirmAttendance}
            disabled={confirmingAttendance || !nimInput.trim()}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {confirmingAttendance ? "Memproses..." : "Konfirmasi"}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          💡 Masukkan NIM peserta yang hadir untuk mengubah status ke INTERVIEW
        </p>
      </div>

      {/* Interview Assignments Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <span>👥</span>
            Assignment Pewawancara
          </h3>
          <button
            onClick={fetchCandidates}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            🔄 Refresh Data
          </button>
        </div>

        {candidates.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <span className="text-6xl mb-4 block">🤷‍♂️</span>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Belum ada kandidat interview
            </h4>
            <p className="text-gray-600">
              Kandidat akan muncul di sini setelah status diubah ke
              &quot;INTERVIEW&quot;
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-lg">
                      {candidate.fullName}
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1 mt-1">
                      <div className="flex items-center gap-4">
                        <span>📧 {candidate.email}</span>
                        <span>🆔 NIM: {candidate.nim}</span>
                      </div>
                      <div>
                        🎓 {candidate.faculty} - {candidate.department}
                      </div>
                    </div>

                    {candidate.assignedInterviewer && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          ✅ Ditugaskan ke:{" "}
                          {interviewers.find(
                            (i) => i.username === candidate.assignedInterviewer
                          )?.fullName || candidate.assignedInterviewer}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {candidate.assignedInterviewer ? (
                      <div className="text-sm text-green-600 font-medium">
                        Sudah ditugaskan
                      </div>
                    ) : (
                      <div className="text-sm text-orange-600 font-medium">
                        Belum ditugaskan
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {interviewers.map((interviewer) => (
                        <button
                          key={interviewer.username}
                          onClick={() =>
                            assignInterviewer(
                              candidate.id,
                              interviewer.username
                            )
                          }
                          disabled={assigningInterviewer === candidate.id}
                          className={`px-3 py-1 text-sm rounded border transition-colors ${
                            candidate.assignedInterviewer ===
                            interviewer.username
                              ? "bg-green-500 text-white border-green-500"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                          } ${
                            assigningInterviewer === candidate.id
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                          title={interviewer.fullName}
                        >
                          {interviewer.label}
                        </button>
                      ))}
                    </div>

                    {assigningInterviewer === candidate.id && (
                      <div className="text-xs text-gray-500">
                        Sedang menugaskan...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <span>📊</span>
          Ringkasan Status
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {candidates.length}
            </div>
            <div className="text-gray-600">Total kandidat interview</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {candidates.filter((c) => c.assignedInterviewer).length}
            </div>
            <div className="text-gray-600">Sudah ditugaskan</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-orange-600">
              {candidates.filter((c) => !c.assignedInterviewer).length}
            </div>
            <div className="text-gray-600">Belum ditugaskan</div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
          <span>💡</span>
          Petunjuk Penggunaan
        </h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>
            • <strong>Konfirmasi Kehadiran:</strong> Input NIM untuk mengubah
            status pendaftar menjadi &quot;INTERVIEW&quot;
          </li>
          <li>
            • <strong>Assignment Pewawancara:</strong> Klik tombol P1-P7 untuk
            menugaskan pewawancara ke kandidat
          </li>
          <li>
            • <strong>Status:</strong> Kandidat yang sudah ditugaskan akan
            muncul hijau di dashboard pewawancara
          </li>
        </ul>
      </div>
    </div>
  );
}
