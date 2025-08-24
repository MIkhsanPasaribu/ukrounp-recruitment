"use client";

import { useState, useCallback } from "react";

export const useRegistrationStatus = (token: string | null) => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [registrationStatusLoading, setRegistrationStatusLoading] =
    useState(false);

  // Fungsi untuk mengambil status pendaftaran
  const fetchRegistrationStatus = useCallback(async () => {
    if (!token) return;

    try {
      console.log("🔄 Mengambil status pendaftaran...");
      const response = await fetch("/api/admin/registration-status", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Status pendaftaran berhasil diambil:", data);
        setIsRegistrationOpen(data.isOpen);
      } else {
        console.error(
          "❌ Gagal mengambil status pendaftaran:",
          response.status
        );
      }
    } catch (error) {
      console.error("❌ Error mengambil status pendaftaran:", error);
    }
  }, [token]);

  // Fungsi untuk mengubah status pendaftaran
  const toggleRegistrationStatus = async () => {
    if (!token) {
      console.error("❌ Token tidak tersedia");
      return;
    }

    const action = isRegistrationOpen ? "menutup" : "membuka";
    const confirmMessage = `Apakah Anda yakin ingin ${action} pendaftaran?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setRegistrationStatusLoading(true);
    console.log(`🔄 ${action} pendaftaran...`);

    try {
      const response = await fetch("/api/admin/registration-status", {
        method: "POST", // Menggunakan POST sesuai dengan API
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isOpen: !isRegistrationOpen }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Status pendaftaran berhasil diubah:", data);
        setIsRegistrationOpen(!isRegistrationOpen);

        const successMessage = !isRegistrationOpen
          ? "Pendaftaran berhasil dibuka!"
          : "Pendaftaran berhasil ditutup!";
        alert(successMessage);
      } else {
        const errorData = await response.json();
        console.error("❌ Gagal mengubah status pendaftaran:", errorData);
        alert(
          `Gagal mengubah status pendaftaran: ${
            errorData.message || "Error tidak diketahui"
          }`
        );
      }
    } catch (error) {
      console.error("❌ Error mengubah status pendaftaran:", error);
      alert(
        "Terjadi kesalahan saat mengubah status pendaftaran. Silakan coba lagi."
      );
    } finally {
      setRegistrationStatusLoading(false);
    }
  };

  return {
    isRegistrationOpen,
    registrationStatusLoading,
    fetchRegistrationStatus,
    toggleRegistrationStatus,
  };
};
