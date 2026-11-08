import { NextRequest, NextResponse } from "next/server";
import { InterviewerUser } from "@/types/interview";
import { supabaseUntyped } from "./supabase";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const recommendations = ["SANGAT_DIREKOMENDASIKAN", "DIREKOMENDASIKAN", "CUKUP", "TIDAK_DIREKOMENDASIKAN"];
const text = (value: unknown, max: number, required = false): value is string =>
  typeof value === "string" && value.length <= max && (!required || value.trim().length > 0);

export function validInterviewResult(body: unknown): body is {
  sessionId: string;
  responses: { questionId: string; response: string; score: number; notes?: string }[];
  sessionNotes?: string;
  recommendation: string;
  interviewerName: string;
} {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;
  const b = body as Record<string, unknown>;
  return typeof b.sessionId === "string" && uuid.test(b.sessionId) &&
    Array.isArray(b.responses) && b.responses.length > 0 && b.responses.length <= 1000 &&
    b.responses.every((r: unknown) => {
      if (!r || typeof r !== "object" || Array.isArray(r)) return false;
      const answer = r as Record<string, unknown>;
      return typeof answer.questionId === "string" && uuid.test(answer.questionId) &&
        typeof answer.score === "number" && Number.isInteger(answer.score) && answer.score >= 1 && answer.score <= 5 &&
        text(answer.response, 10000, true) && (answer.notes === undefined || text(answer.notes, 10000));
    }) && new Set(b.responses.map(r => r.questionId.toLowerCase())).size === b.responses.length &&
    (b.sessionNotes === undefined || text(b.sessionNotes, 10000)) &&
    typeof b.recommendation === "string" && recommendations.includes(b.recommendation) &&
    text(b.interviewerName, 255, true);
}

// Run locally with INTERVIEW_RESULT_SELF_CHECK=1 when loading this module.
if (process.env.INTERVIEW_RESULT_SELF_CHECK === "1") {
  const body = {
    sessionId: "00000000-0000-4000-8000-000000000001",
    responses: [{ questionId: "00000000-0000-4000-8000-000000000002", response: "Answer", score: 3 }],
    recommendation: "CUKUP", interviewerName: "Interviewer",
  };
  const check = (condition: boolean) => { if (!condition) throw new Error("Interview result validation regression"); };
  check(validInterviewResult(body));
  for (const score of ["3", 0, 6, 1.5, null, NaN]) {
    check(!validInterviewResult({ ...body, responses: [{ ...body.responses[0], score }] }));
  }
  for (const invalid of [null, {}, { ...body, sessionId: "bad" }, { ...body, recommendation: "bad" },
    { ...body, interviewerName: " " }, { ...body, sessionNotes: "x".repeat(10001) },
    { ...body, responses: [] }, { ...body, responses: [body.responses[0], body.responses[0]] },
    { ...body, responses: [{ ...body.responses[0], response: " " }] }]) check(!validInterviewResult(invalid));
}

export async function saveInterviewResult(request: NextRequest, interviewer: InterviewerUser, edit: boolean) {
  try {
    const body: unknown = await request.json();
    if (!validInterviewResult(body)) {
      return NextResponse.json({ success: false, message: "Data form tidak valid" }, { status: 400 });
    }
    // The RPC validates the complete active question set and ownership inside its transaction.
    const { error } = await supabaseUntyped.rpc("save_interview_result", {
      p_session_id: body.sessionId,
      p_interviewer_id: interviewer.id,
      p_responses: body.responses.map(r => ({ ...r, notes: r.notes ?? "" })),
      p_notes: body.sessionNotes ?? "",
      p_recommendation: body.recommendation,
      p_interviewer_name: body.interviewerName.trim(),
      p_edit: edit,
    });
    if (error) {
      const status = error.code === "42501" ? 403 : error.code === "P0002" ? 404 :
        ["22023", "22P02", "23514", "P0001"].includes(error.code) ? 400 : error.code === "23505" ? 409 : 500;
      return NextResponse.json({ success: false, message: "Gagal menyimpan hasil wawancara" }, { status });
    }
    const totalScore = body.responses.reduce((sum, r) => sum + r.score, 0);
    const averageScore = totalScore / body.responses.length;
    const autoRecommendation = averageScore >= 4.5 ? "Sangat Direkomendasikan" :
      averageScore >= 4 ? "Direkomendasikan" : averageScore >= 3 ? "Dipertimbangkan" : "Tidak Direkomendasikan";
    return NextResponse.json({
      success: true,
      message: edit ? "Hasil wawancara berhasil diupdate" : "Hasil wawancara berhasil disimpan",
      data: {
        sessionId: body.sessionId, totalScore, maxScore: body.responses.length * 5,
        averageScore: averageScore.toFixed(2), responseCount: body.responses.length,
        recommendation: body.recommendation, autoRecommendation, status: "COMPLETED",
        [edit ? "updatedAt" : "submittedAt"]: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: error instanceof SyntaxError ? 400 : 500 });
  }
}
