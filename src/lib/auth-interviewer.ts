import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { supabase } from "./supabase";
import { InterviewerUser } from "@/types/interview";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

// Generate JWT token untuk pewawancara
export async function generateInterviewerToken(
  interviewer: InterviewerUser
): Promise<string> {
  const payload = {
    interviewerId: interviewer.id,
    username: interviewer.username,
    email: interviewer.email,
    role: interviewer.role,
    loginTime: new Date().toISOString(),
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: "8h", // 8 jam untuk sesi wawancara
  });

  console.log("🔑 Generating interviewer token for:", interviewer.id);

  // Store token in database
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours
  const sessionId = crypto.randomUUID();

  const { data, error } = await supabase
    .from("interviewer_tokens")
    .insert({
      id: sessionId,
      interviewerId: interviewer.id,
      token,
      expiresAt: expiresAt.toISOString(),
    })
    .select();

  if (error) {
    console.error("❌ Error storing interviewer token:", error);
    throw new Error("Failed to store interviewer session token");
  }

  console.log("✅ Interviewer token stored successfully:", data);
  return token;
}

// Verify JWT token untuk pewawancara
export function verifyInterviewerToken(token: string): {
  interviewerId: string;
  username: string;
  email: string;
  role: string;
  loginTime: string;
} | null {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      interviewerId: string;
      username: string;
      email: string;
      role: string;
      loginTime: string;
    };
  } catch {
    return null;
  }
}

// Check if interviewer token is valid
export async function isInterviewerTokenValid(token: string): Promise<boolean> {
  console.log(
    "🔍 Checking interviewer token validity:",
    token.substring(0, 20) + "..."
  );

  const { data, error } = await supabase
    .from("interviewer_tokens")
    .select("*")
    .eq("token", token)
    .eq("isRevoked", false)
    .gt("expiresAt", new Date().toISOString())
    .single();

  console.log("🔍 Interviewer token query result:", { data, error });

  if (error) {
    console.log("❌ Interviewer token validation error:", error.message);
    return false;
  }

  const isValid = !error && !!data;
  console.log("🔍 Interviewer token is valid:", isValid);
  return isValid;
}

// Login untuk pewawancara
export async function loginInterviewer(
  identifier: string, // username or email
  password: string,
  ipAddress?: string
): Promise<{
  success: boolean;
  interviewer?: InterviewerUser;
  token?: string;
  message: string;
}> {
  console.log("🔐 Authenticating interviewer:", { identifier, ipAddress });

  // Get interviewer by username or email
  const { data: interviewer, error } = await supabase
    .from("interviewers")
    .select("*")
    .or(`username.eq.${identifier},email.eq.${identifier}`)
    .eq("isActive", true)
    .single();

  console.log("🔍 Database query result:", {
    found: !!interviewer,
    error: error?.message,
    hasPasswordHash: !!interviewer?.passwordHash,
  });

  if (error || !interviewer) {
    console.log("❌ Interviewer not found:", error?.message);
    return { success: false, message: "Username/email atau password salah" };
  }

  // Check if account is locked
  if (interviewer.lockedUntil) {
    const lockTime = new Date(interviewer.lockedUntil).getTime();
    if (Date.now() < lockTime) {
      const remainingTime = Math.ceil((lockTime - Date.now()) / (1000 * 60));
      return {
        success: false,
        message: `Akun dikunci. Coba lagi dalam ${remainingTime} menit`,
      };
    }
  }

  // Verify password
  console.log("🔑 Comparing passwords...");
  const isPasswordValid = await bcrypt.compare(
    password,
    interviewer.passwordHash
  );
  console.log("🔑 Password validation result:", isPasswordValid);

  if (!isPasswordValid) {
    console.log("❌ Password verification failed");
    // Increment login attempts
    const newAttempts = (interviewer.loginAttempts || 0) + 1;
    const updateData: { loginAttempts: number; lockedUntil?: string } = {
      loginAttempts: newAttempts,
    };

    // Lock account if max attempts reached
    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      updateData.lockedUntil = new Date(Date.now() + LOCK_TIME).toISOString();
    }

    await supabase
      .from("interviewers")
      .update(updateData)
      .eq("id", interviewer.id);

    return { success: false, message: "Username/email atau password salah" };
  }

  // Reset login attempts on successful login
  await supabase
    .from("interviewers")
    .update({
      loginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date().toISOString(),
    })
    .eq("id", interviewer.id);

  // Generate token
  const token = await generateInterviewerToken(interviewer);

  return {
    success: true,
    interviewer,
    token,
    message: "Login berhasil",
  };
}

// Logout untuk pewawancara
export async function logoutInterviewer(token: string): Promise<void> {
  await supabase
    .from("interviewer_tokens")
    .update({
      isRevoked: true,
      revokedAt: new Date().toISOString(),
    })
    .eq("token", token);
}

// Get auth data untuk pewawancara
export async function getInterviewerAuthData(request: NextRequest): Promise<{
  isAuthenticated: boolean;
  interviewer?: InterviewerUser;
  token?: string;
}> {
  // Try multiple ways to get token
  let token: string | null = null;

  // 1. From Authorization header
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  // 2. From X-Interviewer-Token header
  if (!token) {
    token = request.headers.get("X-Interviewer-Token");
  }

  // 3. From cookies
  if (!token) {
    token = request.cookies.get("interviewerToken")?.value || null;
  }

  console.log("🔑 Interviewer auth check:", {
    hasAuthHeader: !!authHeader,
    hasXInterviewerToken: !!request.headers.get("X-Interviewer-Token"),
    hasCookie: !!request.cookies.get("interviewerToken"),
    finalToken: !!token,
  });

  if (!token) {
    return { isAuthenticated: false };
  }

  // Verify JWT token
  const decoded = verifyInterviewerToken(token);
  if (!decoded) {
    console.log("❌ Interviewer token verification failed");
    return { isAuthenticated: false };
  }

  // Check if token exists and is valid in database
  const isValid = await isInterviewerTokenValid(token);
  if (!isValid) {
    console.log("❌ Interviewer token not valid in database");
    return { isAuthenticated: false };
  }

  // Get current interviewer data
  const { data: interviewer, error } = await supabase
    .from("interviewers")
    .select("*")
    .eq("id", decoded.interviewerId)
    .eq("isActive", true)
    .single();

  if (error || !interviewer) {
    console.log("❌ Interviewer not found or inactive:", error);
    return { isAuthenticated: false };
  }

  console.log(
    "✅ Interviewer authentication successful for:",
    interviewer.username
  );
  return { isAuthenticated: true, interviewer, token };
}
