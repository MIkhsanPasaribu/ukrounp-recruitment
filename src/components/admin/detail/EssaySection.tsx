"use client";

import { ApplicationData } from "@/types";

interface EssaySectionProps {
  data: ApplicationData;
}

export default function EssaySection({ data }: EssaySectionProps) {
  // Debug logging untuk melihat data essay
  console.log("🔍 EssaySection Complete Data:", {
    id: data.id,
    fullName: data.fullName,
    motivation: {
      exists: !!data.motivation,
      type: typeof data.motivation,
      length: data.motivation?.length || 0,
      content: data.motivation,
    },
    futurePlans: {
      exists: !!data.futurePlans,
      type: typeof data.futurePlans,
      length: data.futurePlans?.length || 0,
      content: data.futurePlans,
    },
    whyYouShouldBeAccepted: {
      exists: !!data.whyYouShouldBeAccepted,
      type: typeof data.whyYouShouldBeAccepted,
      length: data.whyYouShouldBeAccepted?.length || 0,
      content: data.whyYouShouldBeAccepted,
    },
    allDataKeys: Object.keys(data),
  });

  const essays = [
    {
      title: "Motivasi Bergabung dengan Robotik",
      content: data.motivation,
      icon: "🎯",
      color: "blue",
      description:
        "Alasan dan motivasi pendaftar untuk bergabung dengan unit kegiatan robotik",
    },
    {
      title: "Rencana Setelah Bergabung",
      content: data.futurePlans,
      icon: "🚀",
      color: "green",
      description:
        "Rencana dan target yang ingin dicapai setelah menjadi anggota",
    },
    {
      title: "Alasan Anda Layak Diterima",
      content: data.whyYouShouldBeAccepted,
      icon: "⭐",
      color: "purple",
      description:
        "Argumen dan kelebihan yang membuat pendaftar layak diterima",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-800",
        header: "bg-blue-100",
      },
      green: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-800",
        header: "bg-green-100",
      },
      purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-800",
        header: "bg-purple-100",
      },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const analyzeText = (text?: string) => {
    if (!text) return { words: 0, characters: 0, sentences: 0 };

    const words = text.trim().split(/\s+/).length;
    const characters = text.length;
    const sentences = text
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0).length;

    return { words, characters, sentences };
  };

  const getQualityScore = (text?: string) => {
    if (!text) return 0;
    const analysis = analyzeText(text);

    // Basic scoring based on length and content
    let score = 0;
    if (analysis.words >= 50) score += 25;
    if (analysis.words >= 100) score += 25;
    if (analysis.sentences >= 3) score += 25;
    if (text.length >= 200) score += 25;

    return Math.min(score, 100);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-amber-800">
              Esai Pendaftaran
            </h3>
            <p className="text-sm text-amber-600">
              Jawaban esai dan motivasi pendaftar
            </p>
          </div>
        </div>
      </div>

      {/* Essays */}
      <div className="space-y-6">
        {essays.map((essay, index) => {
          const colors = getColorClasses(essay.color);
          const analysis = analyzeText(essay.content);
          const qualityScore = getQualityScore(essay.content);

          return (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            >
              {/* Essay Header */}
              <div className={`${colors.bg} ${colors.border} border-b p-4`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 ${colors.header} rounded-lg flex items-center justify-center flex-shrink-0`}
                    >
                      <span className="text-lg">{essay.icon}</span>
                    </div>
                    <div>
                      <h4 className={`font-semibold text-lg ${colors.text}`}>
                        {essay.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {essay.description}
                      </p>
                    </div>
                  </div>

                  {/* Quality Score */}
                  <div className="text-right">
                    <div className={`text-xl font-bold ${colors.text}`}>
                      {qualityScore}%
                    </div>
                    <div className="text-xs text-gray-500">Kualitas</div>
                  </div>
                </div>
              </div>

              {/* Essay Content */}
              <div className="p-6">
                {essay.content ? (
                  <div className="space-y-4">
                    {/* Content */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {essay.content}
                        </p>
                      </div>
                    </div>

                    {/* Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-blue-700">
                          {analysis.words}
                        </div>
                        <div className="text-xs text-blue-600">Kata</div>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-green-700">
                          {analysis.characters}
                        </div>
                        <div className="text-xs text-green-600">Karakter</div>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-purple-700">
                          {analysis.sentences}
                        </div>
                        <div className="text-xs text-purple-600">Kalimat</div>
                      </div>

                      <div
                        className={`${colors.bg} ${colors.border} rounded-lg p-3 text-center`}
                      >
                        <div className={`text-lg font-bold ${colors.text}`}>
                          {qualityScore}%
                        </div>
                        <div className="text-xs text-gray-600">Skor</div>
                      </div>
                    </div>

                    {/* Quality Assessment */}
                    <div
                      className={`${colors.bg} ${colors.border} rounded-lg p-4`}
                    >
                      <h5 className={`font-medium ${colors.text} mb-2`}>
                        Penilaian Kualitas
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Panjang jawaban</span>
                          <span
                            className={`${
                              analysis.words >= 100
                                ? "text-green-600"
                                : analysis.words >= 50
                                ? "text-yellow-600"
                                : "text-red-600"
                            } font-medium`}
                          >
                            {analysis.words >= 100
                              ? "Sangat Baik"
                              : analysis.words >= 50
                              ? "Cukup"
                              : "Kurang"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">
                            Struktur kalimat
                          </span>
                          <span
                            className={`${
                              analysis.sentences >= 5
                                ? "text-green-600"
                                : analysis.sentences >= 3
                                ? "text-yellow-600"
                                : "text-red-600"
                            } font-medium`}
                          >
                            {analysis.sentences >= 5
                              ? "Terstruktur"
                              : analysis.sentences >= 3
                              ? "Cukup"
                              : "Sederhana"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Detail konten</span>
                          <span
                            className={`${
                              essay.content.length >= 300
                                ? "text-green-600"
                                : essay.content.length >= 150
                                ? "text-yellow-600"
                                : "text-red-600"
                            } font-medium`}
                          >
                            {essay.content.length >= 300
                              ? "Sangat Detail"
                              : essay.content.length >= 150
                              ? "Cukup Detail"
                              : "Kurang Detail"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto text-gray-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-gray-500 font-medium mb-2">
                      Tidak ada jawaban
                    </p>
                    <p className="text-sm text-gray-400">
                      Pendaftar belum mengisi esai untuk pertanyaan ini
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Essay Assessment */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-orange-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Penilaian Keseluruhan Esai
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {essays.map((essay, index) => {
            const score = getQualityScore(essay.content);
            const colors = getColorClasses(essay.color);

            return (
              <div
                key={index}
                className={`${colors.bg} ${colors.border} rounded-lg p-4`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">{essay.icon}</span>
                  <span className={`font-medium ${colors.text}`}>
                    {essay.title.split(" ").slice(0, 2).join(" ")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Skor Kualitas</span>
                  <span className={`font-bold ${colors.text}`}>{score}%</span>
                </div>
                <div className="mt-2 w-full bg-white bg-opacity-50 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      essay.color === "blue"
                        ? "bg-blue-600"
                        : essay.color === "green"
                        ? "bg-green-600"
                        : "bg-purple-600"
                    }`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-orange-800">
              Rata-rata Kualitas Esai
            </span>
            <span className="text-xl font-bold text-orange-800">
              {Math.round(
                essays.reduce(
                  (acc, essay) => acc + getQualityScore(essay.content),
                  0
                ) / essays.length
              )}
              %
            </span>
          </div>
          <div className="w-full bg-orange-200 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${
                  essays.reduce(
                    (acc, essay) => acc + getQualityScore(essay.content),
                    0
                  ) / essays.length
                }%`,
              }}
            ></div>
          </div>

          <p className="text-sm text-orange-700 mt-3">
            {(() => {
              const avgScore =
                essays.reduce(
                  (acc, essay) => acc + getQualityScore(essay.content),
                  0
                ) / essays.length;
              const completedEssays = essays.filter(
                (essay) => essay.content
              ).length;

              return (
                <>
                  Pendaftar telah mengisi <strong>{completedEssays}</strong>{" "}
                  dari <strong>{essays.length}</strong> esai dengan rata-rata
                  kualitas <strong>{Math.round(avgScore)}%</strong>.
                  {avgScore >= 80
                    ? " Kualitas esai sangat baik dan menunjukkan komitmen tinggi."
                    : avgScore >= 60
                    ? " Kualitas esai cukup baik dengan beberapa poin yang dapat diperkuat."
                    : avgScore >= 40
                    ? " Kualitas esai perlu ditingkatkan untuk menunjukkan motivasi yang lebih kuat."
                    : " Esai perlu diperbaiki secara signifikan untuk memenuhi standar penerimaan."}
                </>
              );
            })()}
          </p>
        </div>
      </div>
    </div>
  );
}
