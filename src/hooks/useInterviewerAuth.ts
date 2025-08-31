"use client";

import { useState, useEffect, useCallback } from "react";
import { InterviewerUser } from "@/types/interview";

export const useInterviewerAuth = () => {
  const [token, setToken] = useState<string | null>(null);
  const [interviewer, setInterviewer] = useState<InterviewerUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for stored token on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("interviewerToken");
    const storedInterviewer = localStorage.getItem("interviewerInfo");

    if (storedToken && storedInterviewer) {
      try {
        const parsedInterviewer = JSON.parse(storedInterviewer);
        setToken(storedToken);
        setInterviewer(parsedInterviewer);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing stored interviewer info:", error);
        localStorage.removeItem("interviewerToken");
        localStorage.removeItem("interviewerInfo");
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = useCallback(
    (newToken: string, interviewerInfo: InterviewerUser) => {
      // Store in localStorage
      localStorage.setItem("interviewerToken", newToken);
      localStorage.setItem("interviewerInfo", JSON.stringify(interviewerInfo));

      // Update state
      setToken(newToken);
      setInterviewer(interviewerInfo);
      setIsAuthenticated(true);
    },
    []
  );

  const handleLogout = useCallback(async () => {
    try {
      // Call logout API
      const storedToken = localStorage.getItem("interviewerToken");
      if (storedToken) {
        await fetch("/api/interview/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${storedToken}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem("interviewerToken");
      localStorage.removeItem("interviewerInfo");
      setToken(null);
      setInterviewer(null);
      setIsAuthenticated(false);
    }
  }, []);

  return {
    token,
    interviewer,
    isAuthenticated,
    loading,
    handleLoginSuccess,
    handleLogout,
  };
};
