import { useState } from "react";
import { useRouter } from "next/navigation";
import { InterviewerUser } from "@/types/interview";

interface LoginProps {
  onAdminLoginSuccess: (
    token: string,
    admin: {
      id: string;
      username: string;
      email: string;
      fullName: string;
      role: string;
    }
  ) => void;
  onInterviewerLoginSuccess: (
    token: string,
    interviewer: InterviewerUser
  ) => void;
}

type LoginType = "admin" | "interviewer";

export default function UnifiedLogin({
  onAdminLoginSuccess,
  onInterviewerLoginSuccess,
}: LoginProps) {
  const router = useRouter();
  const [loginType, setLoginType] = useState<LoginType>("admin");
  const [identifier, setIdentifier] = useState(""); // username or email
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint =
        loginType === "admin"
          ? "/api/admin/login"
          : "/api/interview/auth/login";

      console.log("🔐 Login attempt:", {
        loginType,
        endpoint,
        identifier,
        hasPassword: !!password,
      });

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        if (loginType === "admin" && data.admin) {
          // Store admin token and info in localStorage
          localStorage.setItem("adminToken", data.token);
          localStorage.setItem("adminInfo", JSON.stringify(data.admin));
          onAdminLoginSuccess(data.token, data.admin);
        } else if (loginType === "interviewer" && data.interviewer) {
          // Store interviewer token and info in localStorage
          localStorage.setItem("interviewerToken", data.token);
          localStorage.setItem(
            "interviewerInfo",
            JSON.stringify(data.interviewer)
          );
          onInterviewerLoginSuccess(data.token, data.interviewer);
        } else {
          setError("Data login tidak valid");
        }
      } else {
        setError(data.message || "Login gagal");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIdentifier("");
    setPassword("");
    setError("");
  };

  const handleLoginTypeChange = (type: LoginType) => {
    setLoginType(type);
    resetForm();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-4 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Login Type Selector */}
        <div className="text-center">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => handleLoginTypeChange("admin")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginType === "admin"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Administrator
            </button>
            <button
              type="button"
              onClick={() => handleLoginTypeChange("interviewer")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginType === "interviewer"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Pewawancara
            </button>
          </div>

          <div
            className={`mx-auto h-12 w-12 sm:h-16 sm:w-16 rounded-full flex items-center justify-center mb-4 ${
              loginType === "admin" ? "bg-indigo-600" : "bg-blue-600"
            }`}
          >
            {loginType === "admin" ? (
              <svg
                className="h-6 w-6 sm:h-8 sm:w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 sm:h-8 sm:w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {loginType === "admin"
              ? "Login Administrator"
              : "Login Pewawancara"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {loginType === "admin"
              ? "Masukkan username/email dan kata sandi untuk mengakses dashboard admin"
              : "Masukkan username/email dan kata sandi untuk mengakses sistem wawancara"}
          </p>
        </div>

        <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-3 sm:p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <label
              htmlFor="identifier"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Username atau Email
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              required
              className="appearance-none relative block w-full px-3 py-3 sm:py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base sm:text-sm"
              placeholder="Masukkan username atau email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Kata Sandi
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="appearance-none relative block w-full px-3 py-3 sm:py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base sm:text-sm"
              placeholder={`Masukkan kata sandi ${
                loginType === "admin" ? "admin" : "pewawancara"
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 sm:py-2 px-4 border border-transparent text-base sm:text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${
                loginType === "admin"
                  ? "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              }`}
            >
              {loading ? "Memproses..." : "Login"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="group relative w-full flex justify-center py-3 sm:py-2 px-4 border border-gray-300 text-base sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Kembali ke Halaman Utama
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
