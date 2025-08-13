"use client";

import { useState } from "react";

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "🎯 Selamat Datang di UKRO UNP!",
      content:
        "Mari kenali fitur-fitur yang tersedia di website pendaftaran Unit Kegiatan Robotika UNP. Klik 'Lanjut' untuk memulai tour.",
      icon: "🤖",
    },
    {
      title: "📝 Tombol DAFTAR",
      content:
        "Klik tombol DAFTAR untuk memulai proses pendaftaran sebagai anggota baru UKRO UNP. Anda akan mengisi form pendaftaran lengkap dengan data pribadi dan akademik.",
      icon: "📋",
      buttonColor: "bg-blue-600",
    },
    {
      title: "🔍 Tombol CEK STATUS",
      content:
        "Gunakan tombol CEK STATUS untuk melihat status pendaftaran Anda. Masukkan email yang digunakan saat mendaftar untuk melihat apakah Anda diterima, ditolak, atau masih dalam tahap review.",
      icon: "📊",
      buttonColor: "bg-green-600",
    },
    {
      title: "👨‍💼 Tombol ADMIN",
      content:
        "Tombol ADMIN khusus untuk admin UKRO UNP mengelola pendaftaran. Admin dapat melihat semua aplikasi, mengubah status pendaftaran, dan mendownload data pendaftar.",
      icon: "🛡️",
      buttonColor: "bg-purple-600",
    },
    {
      title: "💬 Tombol GABUNG GRUP WHATSAPP",
      content:
        "Setelah mendaftar sebagai calon anggota, gunakan tombol ini untuk bergabung ke grup WhatsApp UKRO. Anda perlu verifikasi email dan tanggal lahir terlebih dahulu.",
      icon: "📱",
      buttonColor: "bg-green-500",
    },
    {
      title: "📞 Tombol CONTACT PERSON",
      content:
        "Ada pertanyaan? Klik tombol CONTACT PERSON untuk chat langsung dengan admin UKRO melalui WhatsApp. Kami siap membantu Anda!",
      icon: "💬",
      buttonColor: "bg-blue-500",
    },
    {
      title: "✏️ Tombol MODIFIKASI DATA",
      content:
        "Sudah terlanjur mendaftar tapi ada data yang salah? Tenang! Gunakan tombol MODIFIKASI DATA untuk mengubah semua informasi pendaftaran Anda, termasuk file yang diupload.",
      icon: "📝",
      buttonColor: "bg-orange-500",
    },
    {
      title: "📱 Media Sosial UKRO",
      content:
        "Jangan lupa follow Instagram dan TikTok UKRO UNP untuk update kegiatan, tips robotika, dan konten menarik lainnya!",
      icon: "📲",
    },
    {
      title: "🎉 Selamat Menjelajahi!",
      content:
        "Anda sekarang sudah mengenal semua fitur website UKRO UNP. Mulai dengan klik DAFTAR untuk bergabung dengan kami. Selamat datang di dunia robotika!",
      icon: "🚀",
    },
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  if (!isOpen) return null;

  const currentTutorial = tutorialSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-xl sm:rounded-t-2xl">
          <div className="flex items-center">
            <span className="text-xl sm:text-3xl mr-2 sm:mr-3">
              {currentTutorial.icon}
            </span>
            <h3 className="text-base sm:text-xl font-semibold">
              Panduan Website
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 p-1"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-6">
          {/* Progress Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="flex justify-between text-xs sm:text-sm text-gray-500 mb-2">
              <span>
                Langkah {currentStep + 1} dari {tutorialSteps.length}
              </span>
              <span>
                {Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 sm:h-2 rounded-full transition-all duration-300 ease-in-out"
                style={{
                  width: `${((currentStep + 1) / tutorialSteps.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Tutorial Content */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="text-3xl sm:text-6xl mb-3 sm:mb-4 animate-bounce">
              {currentTutorial.icon}
            </div>
            <h4 className="text-base sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
              {currentTutorial.title}
            </h4>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
              {currentTutorial.content}
            </p>

            {/* Visual Button Preview */}
            {currentTutorial.buttonColor && (
              <div className="mt-4 sm:mt-6 flex justify-center">
                <div
                  className={`${currentTutorial.buttonColor} text-white font-bold py-2 sm:py-3 px-3 sm:px-6 rounded-lg text-xs sm:text-base`}
                >
                  Preview Tombol
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              ← Sebelumnya
            </button>

            {currentStep === tutorialSteps.length - 1 ? (
              <button
                onClick={handleClose}
                className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-colors font-medium text-sm sm:text-base"
              >
                🎯 Mulai Jelajahi!
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium text-sm sm:text-base"
              >
                Lanjut →
              </button>
            )}
          </div>

          {/* Skip Button */}
          <div className="text-center mt-4">
            <button
              onClick={handleClose}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Lewati tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
