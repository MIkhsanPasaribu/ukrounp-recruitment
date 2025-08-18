import { NextRequest, NextResponse } from "next/server";
import { getAuthData, logAdminAction, getClientIP } from "./auth";

// Middleware untuk melindungi admin routes
export function withAuth(
  handler: (
    request: NextRequest,
    auth: { isAuthenticated: boolean; admin?: unknown; token?: string }
  ) => Promise<NextResponse | Response>
) {
  return async (request: NextRequest) => {
    const authData = await getAuthData(request);

    if (!authData.isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized - Token tidak valid atau tidak ada",
        },
        { status: 401 }
      );
    }

    // Log admin access
    if (authData.admin) {
      const action = `${request.method} ${request.nextUrl.pathname}`;
      const ipAddress = getClientIP(request);
      const userAgent = request.headers.get("user-agent") || undefined;

      await logAdminAction(
        (authData.admin as { id: string }).id,
        action,
        undefined,
        `API access`,
        ipAddress,
        userAgent
      );
    }

    // Pass auth data to the handler
    return handler(request, authData);
  };
}

// Helper function untuk response unauthorized
export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ success: false, message }, { status: 401 });
}
