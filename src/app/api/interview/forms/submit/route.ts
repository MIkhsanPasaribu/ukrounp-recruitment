import { withInterviewerAuth } from "@/lib/auth-interviewer-middleware";
import { saveInterviewResult } from "@/lib/interview-result";

export const POST = withInterviewerAuth((request, auth) =>
  saveInterviewResult(request, auth.interviewer!, false)
);
