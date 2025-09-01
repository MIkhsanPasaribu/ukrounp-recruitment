"use client";

import { useState, useEffect } from "react";
import { InterviewFormData, InterviewSession } from "@/types/interview";
import { interviewerApi } from "@/services/interviewerApi";

interface Props {
  token: string;
  sessionId?: string;
  onBack: () => void;
  onComplete: () => void;
}

export default function InterviewForm({
  token,
  sessionId,
  onBack,
  onComplete,
}: Props) {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [questions, setQuestions] = useState<InterviewFormData[]>([]);
  const [sessionNotes, setSessionNotes] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [interviewerName, setInterviewerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await interviewerApi.getInterviewForm(
          token,
          sessionId
        );
        if (response.data?.session) {
          setSession(response.data.session);
        }
        if (response.data?.questions) {
          setQuestions(response.data.questions);
        }
      } catch (error) {
        console.error("Error fetching interview form:", error);
        setError("Gagal memuat form wawancara");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId, token]);

  const updateResponse = (
    questionId: string,
    field: "response" | "score" | "notes",
    value: string | number
  ) => {
    setQuestions((prev: InterviewFormData[]) =>
      prev.map((item) =>
        item.question.id === questionId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!interviewerName.trim()) {
      setError("Nama pewawancara harus diisi");
      return;
    }

    // Validate required fields
    const invalidQuestions = questions.filter(
      (item) => !item.response.trim() || item.score === 0
    );

    if (invalidQuestions.length > 0) {
      setError("Semua pertanyaan harus dijawab dan diberi skor");
      return;
    }

    if (!recommendation) {
      setError("Rekomendasi harus dipilih");
      return;
    }

    try {
      setSaving(true);
      await interviewerApi.submitInterviewForm(token, {
        sessionId: session!.id,
        responses: questions.map((q) => ({
          questionId: q.question.id,
          response: q.response,
          score: q.score,
          notes: q.notes,
        })),
        sessionNotes,
        recommendation: recommendation as
          | "SANGAT_DIREKOMENDASIKAN"
          | "DIREKOMENDASIKAN"
          | "CUKUP"
          | "TIDAK_DIREKOMENDASIKAN",
        interviewerName: interviewerName.trim(),
      });
      onComplete();
    } catch (error) {
      console.error("Error submitting interview:", error);
      setError("Gagal menyimpan hasil wawancara");
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-green-600";
    if (score >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    switch (score) {
      case 1:
        return "Buruk";
      case 2:
        return "Kurang";
      case 3:
        return "Cukup";
      case 4:
        return "Baik";
      case 5:
        return "Sangat Baik";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mx-auto h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
          <p className="mt-4 text-gray-600">Memuat form wawancara...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Form Wawancara
              </h1>
              {session && session.applicants && (
                <p className="text-sm text-gray-600 mt-1">
                  Peserta:{" "}
                  {(session.applicants as { fullName: string }).fullName}
                </p>
              )}
            </div>
            <button
              onClick={onBack}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Kembali
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Interview Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Interviewer Name Input */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Identitas Pewawancara
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Pewawancara *
                </label>
                <input
                  type="text"
                  value={interviewerName}
                  onChange={(e) => setInterviewerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Masukkan nama pewawancara..."
                  required
                />
              </div>
            </div>

            {/* Questions */}
            {questions.map((item) => (
              <div
                key={item.question.id}
                className="bg-white shadow rounded-lg p-6"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {item.question.questionNumber}. {item.question.questionText}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {item.question.category}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Response */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jawaban Peserta
                    </label>
                    <textarea
                      rows={3}
                      value={item.response}
                      onChange={(e) =>
                        updateResponse(
                          item.question.id,
                          "response",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Tuliskan jawaban peserta..."
                    />
                  </div>

                  {/* Score */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Penilaian (1-5)
                    </label>
                    <div className="flex items-center space-x-4">
                      <select
                        value={item.score}
                        onChange={(e) =>
                          updateResponse(
                            item.question.id,
                            "score",
                            Number(e.target.value)
                          )
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="">Pilih skor</option>
                        <option value={1}>1 - Buruk</option>
                        <option value={2}>2 - Kurang</option>
                        <option value={3}>3 - Cukup</option>
                        <option value={4}>4 - Baik</option>
                        <option value={5}>5 - Sangat Baik</option>
                      </select>
                      {item.score > 0 && (
                        <span
                          className={`text-sm font-medium ${getScoreColor(
                            item.score
                          )}`}
                        >
                          {getScoreLabel(item.score)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catatan Pewawancara
                    </label>
                    <textarea
                      rows={2}
                      value={item.notes}
                      onChange={(e) =>
                        updateResponse(
                          item.question.id,
                          "notes",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Catatan tambahan untuk pertanyaan ini..."
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Summary Section */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Ringkasan Wawancara
              </h3>

              <div className="space-y-4">
                {/* Session Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan Umum Wawancara
                  </label>
                  <textarea
                    rows={3}
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Catatan umum tentang wawancara ini..."
                  />
                </div>

                {/* Recommendation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rekomendasi
                  </label>
                  <select
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Pilih rekomendasi</option>
                    <option value="SANGAT_DIREKOMENDASIKAN">
                      Sangat Direkomendasikan
                    </option>
                    <option value="DIREKOMENDASIKAN">Direkomendasikan</option>
                    <option value="CUKUP">Cukup</option>
                    <option value="TIDAK_DIREKOMENDASIKAN">
                      Tidak Direkomendasikan
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Menyimpan...
                  </div>
                ) : (
                  "Simpan Hasil Wawancara"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
