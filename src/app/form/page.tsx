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
        <div className="text-center py-10">
          <p className="text-gray-500">Memuat...</p>
        </div>
      ) : !isRegistrationOpen ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-4">
            Pendaftaran Ditutup
          </h2>
          <p className="text-gray-700 mb-4">
            Mohon maaf, pendaftaran untuk Unit Kegiatan Robotika UNP saat ini
            sudah ditutup.
          </p>
          <p className="text-gray-700">
            Silakan cek kembali nanti atau hubungi kami untuk informasi lebih
            lanjut.
          </p>
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
