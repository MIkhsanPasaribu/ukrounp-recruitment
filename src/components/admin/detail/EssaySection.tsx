"use client";

import { ApplicationData } from "@/types";

interface EssaySectionProps {
  data: ApplicationData;
}

export default function EssaySection({ data }: EssaySectionProps) {
  // Debug logging untuk melihat data essay
  console.log("🔍 EssaySection Data Analysis:", {
    // Basic info
    id: data.id,
    fullName: data.fullName,

    // Essay field analysis
    motivation: {
      exists: !!data.motivation,
      type: typeof data.motivation,
      length: data.motivation?.length || 0,
      isEmptyString: data.motivation === "",
      isNull: data.motivation === null,
      isUndefined: data.motivation === undefined,
      value: data.motivation,
    },
    futurePlans: {
      exists: !!data.futurePlans,
      type: typeof data.futurePlans,
      length: data.futurePlans?.length || 0,
      isEmptyString: data.futurePlans === "",
      isNull: data.futurePlans === null,
      isUndefined: data.futurePlans === undefined,
      value: data.futurePlans,
    },
    whyYouShouldBeAccepted: {
      exists: !!data.whyYouShouldBeAccepted,
      type: typeof data.whyYouShouldBeAccepted,
      length: data.whyYouShouldBeAccepted?.length || 0,
      isEmptyString: data.whyYouShouldBeAccepted === "",
      isNull: data.whyYouShouldBeAccepted === null,
      isUndefined: data.whyYouShouldBeAccepted === undefined,
      value: data.whyYouShouldBeAccepted,
    },

    // Complete object structure
    allDataKeys: Object.keys(data),
    dataSource: "EssaySection received data",
  });

  const essays = [
    {
      title: "Motivasi Bergabung dengan Robotik",
      content: data.motivation || "", // Fallback untuk empty string
      icon: "🎯",
      color: "blue",
      description:
        "Alasan dan motivasi pendaftar untuk bergabung dengan unit kegiatan robotik",
    },
    {
      title: "Rencana Setelah Bergabung",
      content: data.futurePlans || "", // Fallback untuk empty string
      icon: "🚀",
      color: "green",
      description:
        "Rencana dan target yang ingin dicapai setelah menjadi anggota",
    },
    {
      title: "Alasan Anda Layak Diterima",
      content: data.whyYouShouldBeAccepted || "", // Fallback untuk empty string
      icon: "⭐",
      color: "purple",
      description:
        "Argumen dan kelebihan yang membuat pendaftar layak diterima",
    },
  ];

  // Additional debug untuk essay content
  console.log(
    "🔍 EssaySection Essay Array Analysis:",
    essays.map((essay, index) => ({
      index,
      title: essay.title,
      hasContent: !!essay.content,
      contentLength: essay.content?.length || 0,
      contentType: typeof essay.content,
      contentPreview: essay.content
        ? essay.content.substring(0, 100) + "..."
        : "NO CONTENT",
    }))
  );

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

          return (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            >
              {/* Essay Header */}
              <div className={`${colors.bg} ${colors.border} border-b p-4`}>
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
              </div>

              {/* Essay Content */}
              <div className="p-6">
                {essay.content && essay.content.trim().length > 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {essay.content}
                      </p>
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
    </div>
  );
}
