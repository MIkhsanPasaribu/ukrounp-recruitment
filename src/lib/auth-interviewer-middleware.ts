import { NextRequest, NextResponse } from "next/server";
import { getInterviewerAuthData } from "./auth-interviewer";
import { InterviewerUser } from "@/types/interview";

// Middleware untuk melindungi interviewer routes
export function withInterviewerAuth(
  handler: (
    request: NextRequest,
    auth: {
      isAuthenticated: boolean;
      interviewer?: InterviewerUser;
      token?: string;
    }
  ) => Promise<NextResponse | Response>
) {
  return async (request: NextRequest) => {
    const authData = await getInterviewerAuthData(request);

    if (!authData.isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized - Token pewawancara tidak valid atau tidak ada",
        },
        { status: 401 }
      );
    }

    // Pass auth data to the handler
    return handler(request, authData);
  };
}

// Helper function untuk response unauthorized
export function unauthorizedInterviewerResponse(message = "Unauthorized") {
  return NextResponse.json({ success: false, message }, { status: 401 });
}
