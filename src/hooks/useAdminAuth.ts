"use client";

import { useState, useEffect, useCallback } from "react";

export interface AdminInfo {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

export const useAdminAuth = () => {
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for stored token on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    const storedAdmin = localStorage.getItem("adminInfo");

    if (storedToken && storedAdmin) {
      try {
        const parsedAdmin = JSON.parse(storedAdmin);
        setToken(storedToken);
        setAdmin(parsedAdmin);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing stored admin info:", error);
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminInfo");
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = useCallback(
    (newToken: string, adminInfo: AdminInfo) => {
      setToken(newToken);
      setAdmin(adminInfo);
      setIsAuthenticated(true);
    },
    []
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    setToken(null);
    setAdmin(null);
    setIsAuthenticated(false);
  }, []);

  return {
    token,
    admin,
    isAuthenticated,
    loading,
    handleLoginSuccess,
    handleLogout,
  };
};
