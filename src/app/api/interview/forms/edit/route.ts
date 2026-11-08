import { withInterviewerAuth } from "@/lib/auth-interviewer-middleware";
import { saveInterviewResult } from "@/lib/interview-result";

export const PUT = withInterviewerAuth((request, auth) =>
  saveInterviewResult(request, auth.interviewer!, true)
);
