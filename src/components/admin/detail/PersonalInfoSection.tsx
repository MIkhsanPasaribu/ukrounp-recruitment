"use client";

import { ApplicationData } from "@/types";

interface PersonalInfoSectionProps {
  data: ApplicationData;
}

export default function PersonalInfoSection({
  data,
}: PersonalInfoSectionProps) {
  const formatGender = (gender?: string) => {
    switch (gender) {
      case "LAKI_LAKI":
      case "MALE":
        return "Laki-laki";
      case "PEREMPUAN":
      case "FEMALE":
        return "Perempuan";
      default:
        return "Tidak diketahui";
    }
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  const personalFields = [
    {
      label: "Nama Lengkap",
      value: data.fullName,
      icon: "👤",
      type: "text" as const,
    },
    {
      label: "Nama Panggilan",
      value: data.nickname,
      icon: "😊",
      type: "text" as const,
    },
    {
      label: "Jenis Kelamin",
      value: formatGender(data.gender),
      icon: "⚧️",
      type: "text" as const,
    },
    {
      label: "Tanggal Lahir",
      value: data.birthDate
        ? new Date(data.birthDate).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : null,
      icon: "🎂",
      type: "date" as const,
      additional: data.birthDate
        ? `(${calculateAge(data.birthDate)} tahun)`
        : null,
    },
    {
      label: "Email",
      value: data.email,
      icon: "📧",
      type: "email" as const,
    },
    {
      label: "Nomor Telepon",
      value: data.phoneNumber,
      icon: "📱",
      type: "phone" as const,
    },
    {
      label: "Alamat di Padang",
      value: data.padangAddress,
      icon: "📍",
      type: "address" as const,
    },
  ];

  const identityFields = [
    {
      label: "NIM",
      value: data.nim,
      icon: "🎓",
      type: "text" as const,
    },
    {
      label: "NIA",
      value: data.nia,
      icon: "🆔",
      type: "text" as const,
      highlight: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-800">
              Informasi Pribadi
            </h3>
            <p className="text-sm text-blue-600">
              Data identitas dan kontak pendaftar
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Personal Info */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 text-lg border-b border-gray-200 pb-2">
            Data Pribadi
          </h4>

          <div className="space-y-4">
            {personalFields.map((field, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm">{field.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      {field.label}
                    </label>
                    <div className="space-y-1">
                      {field.value ? (
                        <>
                          {field.type === "email" ? (
                            <a
                              href={`mailto:${field.value}`}
                              className="text-blue-600 hover:text-blue-800 font-medium break-all"
                            >
                              {field.value}
                            </a>
                          ) : field.type === "phone" ? (
                            <a
                              href={`tel:${field.value}`}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {field.value}
                            </a>
                          ) : (
                            <span className="text-gray-900 font-medium break-words">
                              {field.value}
                            </span>
                          )}
                          {field.additional && (
                            <p className="text-sm text-gray-500">
                              {field.additional}
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400 italic">
                          Tidak tersedia
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Identity & System Info */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 text-lg border-b border-gray-200 pb-2">
            Identitas & Sistem
          </h4>

          <div className="space-y-4">
            {identityFields.map((field, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 hover:shadow-sm transition-shadow ${
                  field.highlight
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      field.highlight ? "bg-blue-100" : "bg-gray-50"
                    }`}
                  >
                    <span className="text-sm">{field.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      {field.label}
                    </label>
                    <div>
                      {field.value ? (
                        <span
                          className={`font-mono font-medium break-all ${
                            field.highlight ? "text-blue-800" : "text-gray-900"
                          }`}
                        >
                          {field.value}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">
                          {field.label === "NIA"
                            ? "Belum dibuat"
                            : "Tidak tersedia"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Submission Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm">⏰</span>
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Waktu Pendaftaran
                  </label>
                  <div>
                    {data.submittedAt ? (
                      <div className="space-y-1">
                        <span className="text-green-800 font-medium">
                          {new Date(data.submittedAt).toLocaleDateString(
                            "id-ID",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                        <p className="text-sm text-green-600">
                          Pukul{" "}
                          {new Date(data.submittedAt).toLocaleTimeString(
                            "id-ID",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            }
                          )}{" "}
                          WIB
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">
                        Tidak tersedia
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ID Reference */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm">🔗</span>
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    ID Referensi
                  </label>
                  <div>
                    <span className="text-gray-700 font-mono text-sm break-all">
                      {data.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 text-lg mb-4">
          Tindakan Kontak
        </h4>

        <div className="flex flex-wrap gap-3">
          {data.email && (
            <a
              href={`mailto:${data.email}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Kirim Email
            </a>
          )}

          {data.phoneNumber && (
            <a
              href={`tel:${data.phoneNumber}`}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Telepon
            </a>
          )}

          {data.phoneNumber && (
            <a
              href={`https://wa.me/${data.phoneNumber.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <span className="text-sm">💬</span>
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
