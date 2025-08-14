import { useState } from "react";

interface LoginProps {
  onLoginSuccess: (
    token: string,
    admin: {
      id: string;
      username: string;
      email: string;
      fullName: string;
      role: string;
    }
  ) => void;
}

export default function AdminLogin({ onLoginSuccess }: LoginProps) {
  const [identifier, setIdentifier] = useState(""); // username or email
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (data.success && data.token && data.admin) {
        // Store token and admin info in localStorage
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminInfo", JSON.stringify(data.admin));
        onLoginSuccess(data.token, data.admin);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-4 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
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
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Login Administrator
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Masukkan username/email dan kata sandi untuk mengakses dashboard
            admin
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
              placeholder="Masukkan kata sandi admin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 sm:py-2 px-4 border border-transparent text-base sm:text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? "Memproses..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
