import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { supabase, supabaseUntyped } from "./supabase";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

interface AdminUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  loginAttempts: number;
  lockedUntil?: string;
  passwordHash?: string;
}

interface SessionTokenData {
  id: string;
  adminId: string;
  token: string;
  expiresAt: Date;
  [key: string]: unknown;
}

interface UpdateData {
  isRevoked?: boolean;
  revokedAt?: string;
  loginAttempts?: number;
  lockedUntil?: string | null;
  lastLoginAt?: string;
  [key: string]: unknown;
}

interface AdminData {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  passwordHash: string;
  loginAttempts?: number;
  lockedUntil?: string;
  [key: string]: unknown;
}

// Hash password utility
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Verify password utility
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Generate JWT token with session tracking
export async function generateToken(admin: AdminUser): Promise<string> {
  const payload = {
    adminId: admin.id,
    username: admin.username,
    email: admin.email,
    role: admin.role,
    loginTime: new Date().toISOString(),
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: "24h",
  });

  console.log("🔑 Generating token for admin:", admin.id);

  // Store token in database
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  console.log("🔑 Storing token with expiresAt:", expiresAt.toISOString());

  // Generate a unique ID for the session token
  const sessionId = crypto.randomUUID();

  const sessionData: SessionTokenData = {
    id: sessionId,
    adminId: admin.id,
    token,
    expiresAt: expiresAt, // Use Date object instead of ISO string
  };
  const { data, error } = await supabaseUntyped
    .from("session_tokens")
    .insert(sessionData as Record<string, unknown>)
    .select();

  if (error) {
    console.error("❌ Error storing token:", error);
    console.error("❌ Error details:", JSON.stringify(error, null, 2));
    throw new Error(`Failed to store session token: ${error.message}`);
  }

  console.log("✅ Token stored successfully:", data);
  return token;
}

// Verify JWT token
export function verifyToken(token: string): {
  adminId: string;
  username: string;
  email: string;
  role: string;
  loginTime: string;
} | null {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      adminId: string;
      username: string;
      email: string;
      role: string;
      loginTime: string;
    };
  } catch {
    return null;
  }
}

// Check if token is valid in database
export async function isTokenValid(token: string): Promise<boolean> {
  console.log("🔍 Checking token validity:", token.substring(0, 20) + "...");

  const { data, error } = await supabase
    .from("session_tokens")
    .select("*")
    .eq("token", token)
    .eq("isRevoked", false)
    .gt("expiresAt", new Date().toISOString())
    .single();

  console.log("🔍 Token query result:", { data, error });

  if (error) {
    console.log("❌ Token validation error:", error.message);
    return false;
  }

  const isValid = !error && !!data;
  console.log("🔍 Token is valid:", isValid);
  return isValid;
}

// Revoke token
export async function revokeToken(token: string): Promise<void> {
  const revokeData: UpdateData = {
    isRevoked: true,
    revokedAt: new Date().toISOString(),
  };

  await supabaseUntyped
    .from("session_tokens")
    .update(revokeData as Record<string, unknown>)
    .eq("token", token);
}

// Revoke all tokens for an admin
export async function revokeAllTokensForAdmin(adminId: string): Promise<void> {
  const revokeData: UpdateData = {
    isRevoked: true,
    revokedAt: new Date().toISOString(),
  };

  await supabaseUntyped
    .from("session_tokens")
    .update(revokeData as Record<string, unknown>)
    .eq("adminId", adminId)
    .eq("isRevoked", false);
}

// Authenticate admin with username/email and password
export async function authenticateAdmin(
  identifier: string,
  password: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{
  success: boolean;
  admin?: AdminUser;
  message?: string;
  token?: string;
}> {
  try {
    // Find admin by username or email
    const { data: admin, error } = await supabase
      .from("admins")
      .select("*")
      .or(`username.eq.${identifier},email.eq.${identifier}`)
      .eq("isActive", true)
      .single();

    if (error || !admin) {
      return { success: false, message: "Username/email atau password salah" };
    }

    const adminTyped = admin as AdminData;

    // Check if account is locked
    if (
      adminTyped.lockedUntil &&
      new Date(adminTyped.lockedUntil) > new Date()
    ) {
      const unlockTime = new Date(adminTyped.lockedUntil).toLocaleString();
      return {
        success: false,
        message: `Akun terkunci hingga ${unlockTime}. Coba lagi nanti.`,
      };
    }

    // Verify password
    const isPasswordValid = await verifyPassword(
      password,
      adminTyped.passwordHash
    );

    if (!isPasswordValid) {
      // Increment login attempts
      const newAttempts = (adminTyped.loginAttempts || 0) + 1;
      const updateData: UpdateData = {
        loginAttempts: newAttempts,
      };

      // Lock account if max attempts reached
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + LOCK_TIME).toISOString();
      }

      await supabaseUntyped
        .from("admins")
        .update(updateData as Record<string, unknown>)
        .eq("id", adminTyped.id);

      return { success: false, message: "Username/email atau password salah" };
    }

    // Reset login attempts on successful login
    const resetData: UpdateData = {
      loginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date().toISOString(),
    };

    await supabaseUntyped
      .from("admins")
      .update(resetData as Record<string, unknown>)
      .eq("id", adminTyped.id);

    // Generate token
    const token = await generateToken(admin as AdminUser);

    // Log successful login
    await logAdminAction(
      adminTyped.id,
      "LOGIN",
      undefined,
      "Successful login",
      ipAddress,
      userAgent
    );

    return {
      success: true,
      admin,
      token,
      message: "Login berhasil",
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return { success: false, message: "Terjadi kesalahan server" };
  }
}

// Middleware to check authentication
export async function getAuthData(request: NextRequest): Promise<{
  isAuthenticated: boolean;
  admin?: AdminUser;
  token?: string;
}> {
  // Try multiple ways to get token
  let token: string | null = null;

  // 1. From Authorization header
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  // 2. From X-Admin-Token header
  if (!token) {
    token = request.headers.get("X-Admin-Token");
  }

  // 3. From cookies
  if (!token) {
    token = request.cookies.get("adminToken")?.value || null;
  }

  console.log("🔑 Auth check:", {
    hasAuthHeader: !!authHeader,
    hasXAdminToken: !!request.headers.get("X-Admin-Token"),
    hasCookie: !!request.cookies.get("adminToken"),
    finalToken: !!token,
  });

  if (!token) {
    return { isAuthenticated: false };
  }

  // Verify JWT token
  const decoded = verifyToken(token);
  if (!decoded) {
    console.log("❌ Token verification failed");
    return { isAuthenticated: false };
  }

  // Check if token exists and is valid in database
  const isValid = await isTokenValid(token);
  if (!isValid) {
    console.log("❌ Token not valid in database");
    return { isAuthenticated: false };
  }

  // Get current admin data
  const { data: admin, error } = await supabase
    .from("admins")
    .select("*")
    .eq("id", decoded.adminId)
    .eq("isActive", true)
    .single();

  if (error || !admin) {
    console.log("❌ Admin not found or inactive:", error);
    return { isAuthenticated: false };
  }

  console.log(
    "✅ Authentication successful for:",
    (admin as AdminData).username
  );
  return { isAuthenticated: true, admin, token };
}

// Log admin actions for audit trail
export async function logAdminAction(
  adminId: string,
  action: string,
  resource?: string,
  details?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await supabaseUntyped.from("audit_logs").insert({
      adminId,
      action,
      resource,
      details,
      ipAddress,
      userAgent,
    } as Record<string, unknown>);
  } catch (error) {
    console.error("Error logging admin action:", error);
  }
}

// Create first admin (for setup)
export async function createFirstAdmin(
  username: string,
  email: string,
  password: string,
  fullName: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Check if any admin exists
    const { data: existingAdmins } = await supabase
      .from("admins")
      .select("id")
      .limit(1);

    if (existingAdmins && existingAdmins.length > 0) {
      return { success: false, message: "Admin sudah ada dalam sistem" };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create admin
    const { error } = await supabaseUntyped.from("admins").insert({
      username,
      email,
      passwordHash,
      fullName,
      role: "SUPER_ADMIN",
      isActive: true,
    } as Record<string, unknown>);

    if (error) {
      console.error("Error creating admin:", error);
      return { success: false, message: "Gagal membuat admin" };
    }

    return { success: true, message: "Admin berhasil dibuat" };
  } catch (error) {
    console.error("Error in createFirstAdmin:", error);
    return { success: false, message: "Terjadi kesalahan server" };
  }
}

// Get client IP address from request
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "unknown";
}

// Clean up expired tokens (run periodically)
export async function cleanupExpiredTokens(): Promise<void> {
  try {
    await supabase
      .from("session_tokens")
      .delete()
      .lt("expiresAt", new Date().toISOString());
  } catch (error) {
    console.error("Error cleaning up expired tokens:", error);
  }
}

// Logout admin and invalidate session
export async function logoutAdmin(token: string): Promise<void> {
  try {
    // Invalidate the session token
    await supabaseUntyped.from("session_tokens").delete().eq("token", token);
  } catch (error) {
    console.error("Error during logout:", error);
  }
}
