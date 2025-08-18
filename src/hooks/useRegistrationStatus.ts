"use client";

import { useState, useCallback } from "react";

export const useRegistrationStatus = (token: string | null) => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [registrationStatusLoading, setRegistrationStatusLoading] =
    useState(false);

  // Function to fetch registration status
  const fetchRegistrationStatus = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch("/api/admin/registration-status", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setIsRegistrationOpen(data.isOpen);
      }
    } catch (error) {
      console.error("Error fetching registration status:", error);
    }
  }, [token]);

  // Function to toggle registration status
  const toggleRegistrationStatus = async () => {
    if (!token) return;

    if (
      !confirm(
        `Are you sure you want to ${
          isRegistrationOpen ? "close" : "open"
        } registration?`
      )
    ) {
      return;
    }

    setRegistrationStatusLoading(true);

    try {
      const response = await fetch("/api/admin/registration-status", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isOpen: !isRegistrationOpen }),
      });

      if (response.ok) {
        setIsRegistrationOpen(!isRegistrationOpen);
        alert(
          `Registration has been ${!isRegistrationOpen ? "opened" : "closed"}.`
        );
      } else {
        alert("Failed to update registration status");
      }
    } catch (error) {
      console.error("Error toggling registration status:", error);
      alert("Failed to update registration status");
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
