"use client";

import { ApplicationData } from "@/types";

interface AcademicInfoSectionProps {
  data: ApplicationData;
}

export default function AcademicInfoSection({
  data,
}: AcademicInfoSectionProps) {
  const academicFields = [
    {
      label: "Fakultas",
      value: data.faculty,
      icon: "🏛️",
      description: "Fakultas tempat program studi berada",
    },
    {
      label: "Jurusan",
      value: data.department,
      icon: "📘",
      description: "Jurusan atau departemen akademik",
    },
    {
      label: "Program Studi",
      value: data.studyProgram,
      icon: "🎯",
      description: "Program studi yang sedang diambil",
    },
    {
      label: "Jenjang Pendidikan",
      value: data.educationLevel,
      icon: "🎓",
      description: "Tingkat pendidikan saat ini",
    },
    {
      label: "Sekolah Asal",
      value: data.previousSchool,
      icon: "🏫",
      description: "Institusi pendidikan sebelumnya",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-green-800">
              Informasi Akademik
            </h3>
            <p className="text-sm text-green-600">
              Data pendidikan dan akademik pendaftar
            </p>
          </div>
        </div>
      </div>

      {/* Academic Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {academicFields.map((field, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">{field.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-lg mb-1">
                  {field.label}
                </h4>
                <p className="text-sm text-gray-500 mb-3">
                  {field.description}
                </p>
                <div>
                  {field.value ? (
                    <p className="text-gray-800 font-medium text-base break-words">
                      {field.value}
                    </p>
                  ) : (
                    <p className="text-gray-400 italic">Tidak tersedia</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Academic Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Ringkasan Akademik
        </h4>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 leading-relaxed">
            <span className="font-semibold">{data.fullName}</span> adalah
            mahasiswa {data.educationLevel || "jenjang tidak diketahui"} di{" "}
            <span className="font-medium">
              {data.studyProgram || "Program Studi tidak diketahui"}
            </span>
            ,{" "}
            {data.department && (
              <>
                Jurusan <span className="font-medium">{data.department}</span>,{" "}
              </>
            )}
            <span className="font-medium">
              {data.faculty || "Fakultas tidak diketahui"}
            </span>
            .
            {data.previousSchool && (
              <>
                {" "}
                Sebelumnya bersekolah di{" "}
                <span className="font-medium">{data.previousSchool}</span>.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Academic Data Completeness */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 text-lg mb-4">
          Kelengkapan Data Akademik
        </h4>

        <div className="space-y-3">
          {academicFields.map((field, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{field.icon}</span>
                <span className="text-gray-700 font-medium">{field.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    field.value ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span
                  className={`text-sm font-medium ${
                    field.value ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {field.value ? "Lengkap" : "Tidak ada"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              Tingkat Kelengkapan Data
            </span>
            <span className="text-blue-800 font-bold text-lg">
              {Math.round(
                (academicFields.filter((field) => field.value).length /
                  academicFields.length) *
                  100
              )}
              %
            </span>
          </div>
          <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${
                  (academicFields.filter((field) => field.value).length /
                    academicFields.length) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
