"use client";

import { useRouter } from "next/navigation";
import UnifiedLogin from "@/components/UnifiedLogin";

export default function LoginPage() {
  const router = useRouter();

  const handleAdminLoginSuccess = () => {
    // Redirect to admin dashboard
    router.push("/admin");
  };

  const handleInterviewerLoginSuccess = () => {
    // Redirect to interview dashboard
    router.push("/interview");
  };

  return (
    <UnifiedLogin
      onAdminLoginSuccess={handleAdminLoginSuccess}
      onInterviewerLoginSuccess={handleInterviewerLoginSuccess}
    />
  );
}
