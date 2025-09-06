"use client";

import { useState } from "react";
import { useInterviewerAuth } from "@/hooks/useInterviewerAuth";
import UnifiedLogin from "@/components/UnifiedLogin";
import EnhancedInterviewerDashboard from "@/components/interview/EnhancedInterviewerDashboard";
import InterviewForm from "@/components/interview/InterviewForm";

type ViewMode = "dashboard" | "interview-form";

export default function InterviewPage() {
  const {
    token,
    interviewer,
    isAuthenticated,
    loading,
    handleLoginSuccess,
    handleLogout,
  } = useInterviewerAuth();
  const [currentView, setCurrentView] = useState<ViewMode>("dashboard");
  const [selectedSessionId, setSelectedSessionId] = useState<
    string | undefined
  >(undefined);

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    setSelectedSessionId(undefined);
    setCurrentView("dashboard");
  };

  // Handle interview completion
  const handleInterviewComplete = () => {
    alert(
      "Wawancara selesai! Anda dapat mengunduh PDF dari riwayat wawancara."
    );
    handleBackToDashboard();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mx-auto h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated || !token || !interviewer) {
    return (
      <UnifiedLogin
        onAdminLoginSuccess={() => {
          // Redirect to admin page if admin tries to login here
          window.location.href = "/admin";
        }}
        onInterviewerLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Show appropriate view based on current state
  switch (currentView) {
    case "interview-form":
      return (
        <InterviewForm
          token={token}
          sessionId={selectedSessionId}
          onBack={handleBackToDashboard}
          onComplete={handleInterviewComplete}
        />
      );

    case "dashboard":
    default:
      return (
        <EnhancedInterviewerDashboard
          token={token}
          interviewer={interviewer}
          onLogout={handleLogout}
        />
      );
  }
}
