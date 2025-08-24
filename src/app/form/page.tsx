"use client";

import { useState, useEffect } from "react";
//import { useRouter } from 'next/navigation';
import Section1Form from "@/components/Section1Form";
import Section2Form from "@/components/Section2Form";
import SuccessMessage from "@/components/SuccessMessage";
import { Section1Data, Section2Data, FormData } from "@/types";
import Link from "next/link";

export default function FormPage() {
  //const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Add this useEffect to check registration status when component mounts
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const response = await fetch("/api/admin/registration-status");
        if (response.ok) {
          const data = await response.json();
          setIsRegistrationOpen(data.isOpen);
        }
      } catch (error) {
        console.error("Error checking registration status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkRegistrationStatus();
  }, []);

  const handleSection1Submit = (data: Section1Data) => {
    setFormData({ ...formData, ...data });
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleSection2Submit = async (data: Section2Data) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const completeFormData = { ...formData, ...data };

      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(completeFormData),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
        window.scrollTo(0, 0);
      } else {
        setSubmitError(
          result.message || "Gagal mengirimkan aplikasi. Silakan coba lagi."
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError(
        "Terjadi kesalahan yang tidak terduga. Silakan coba lagi."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    window.scrollTo(0, 0);
  };

  // Update the return statement to show a message when registration is closed
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Back button to landing page */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Kembali ke Beranda
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500 text-lg">
            Memeriksa status pendaftaran...
          </p>
          <p className="text-gray-400 text-sm mt-2">Mohon tunggu sebentar</p>
        </div>
      ) : !isRegistrationOpen ? (
        <div className="max-w-2xl mx-auto">
          {/* Header dengan ilustrasi */}
          <div className="text-center mb-8">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-red-200 to-red-300 rounded-full flex items-center justify-center shadow-lg border-4 border-red-400">
              <div className="text-6xl">🔒</div>
            </div>
            <h1 className="text-3xl font-bold text-red-700 mb-4">
              Pendaftaran Ditutup
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-red-500 mx-auto rounded-full"></div>
          </div>

          {/* Konten utama */}
          <div className="bg-white border-2 border-red-300 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-100 to-red-200 px-8 py-6 border-b-2 border-red-300">
              <h2 className="text-xl font-semibold text-red-800 mb-2">
                � Informasi Penting
              </h2>
              <p className="text-red-700 font-medium">
                Periode pendaftaran Unit Kegiatan Robotika UNP saat ini sedang
                tidak aktif.
              </p>
            </div>

            <div className="px-8 py-6 space-y-6">
              {/* Pesan utama */}
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">❌</div>
                  <div>
                    <h3 className="font-semibold text-red-800 mb-2">
                      Mengapa pendaftaran ditutup?
                    </h3>
                    <ul className="text-red-700 space-y-1 text-sm">
                      <li>• Periode pendaftaran telah berakhir</li>
                      <li>• Sedang dalam proses peninjauan data calon anggota</li>
                      <li>• Sedang dalam proses seleksi calon anggota</li>
                      <li>• Sedang dalam proses evaluasi</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Informasi selanjutnya */}
              <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🗓️</div>
                  <div>
                    <h3 className="font-semibold text-orange-800 mb-2">
                      Kapan pendaftaran dibuka kembali?
                    </h3>
                    <p className="text-orange-700 text-sm mb-3">
                      Pantau terus pengumuman resmi kami melalui:
                    </p>
                    <div className="space-y-2 text-sm">
                      <a
                        href="https://instagram.com/ukro_unp"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-orange-700 hover:text-orange-800 transition-colors"
                      >
                        <span className="text-lg mr-2">📱</span>
                        Instagram: @robotic_unp
                      </a>
                      <a
                        href="https://tiktok.com/@ukro_unp"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-orange-700 hover:text-orange-800 transition-colors"
                      >
                        <span className="text-lg mr-2">🎵</span>
                        TikTok: @robotic_unp
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to action */}
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">⏳</div>
                  <div>
                    <h3 className="font-semibold text-red-800 mb-2">
                      Sementara ini, Anda bisa:
                    </h3>
                    <ul className="text-red-700 space-y-2 text-sm">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                        Follow media sosial kami untuk update kegiatan
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                        Pelajari lebih lanjut tentang robotika dan teknologi
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer dengan tombol aksi */}
            <div className="bg-red-50 px-8 py-6 border-t-2 border-red-300">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-lg"
                >
                  <span className="text-lg mr-2">🏠</span>
                  Kembali ke Beranda
                </Link>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center mt-8 text-red-600 text-sm">
            <p className="font-medium">
              Halaman ini akan otomatis menampilkan formulir pendaftaran ketika
              dibuka kembali.
            </p>
            <p className="mt-1 text-red-500">
              Terima kasih atas minat Anda bergabung dengan UKRO UNP! 🤖
            </p>
          </div>
        </div>
      ) : isSubmitted ? (
        <SuccessMessage />
      ) : (
        <>
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">
                Pendaftaran Unit Kegiatan Robotika UNP
              </h1>
              <div className="text-sm text-gray-500">Langkah {step} dari 2</div>
            </div>
            <div className="mt-4 h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${(step / 2) * 100}%` }}
              ></div>
            </div>
          </div>

          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{submitError}</p>
            </div>
          )}

          {step === 1 && <Section1Form onSubmit={handleSection1Submit} />}

          {step === 2 && (
            <Section2Form
              onSubmit={handleSection2Submit}
              isSubmitting={isSubmitting}
              onBack={handleBack}
            />
          )}
        </>
      )}
    </div>
  );
}
