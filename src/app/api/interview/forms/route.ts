import { NextRequest, NextResponse } from "next/server";
import { withInterviewerAuth } from "@/lib/auth-interviewer-middleware";
import { supabase } from "@/lib/supabase";

interface QuestionData {
  id: string;
  questionText: string;
  questionNumber: number;
  [key: string]: unknown;
}

async function handler(request: NextRequest, auth: { interviewer?: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    if (sessionId !== null && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId)) {
      return NextResponse.json({ success: false, message: "Session ID tidak valid" }, { status: 400 });
    }

    console.log("🔍 Fetching interview form data for session:", sessionId);

    // Get interview questions
    const { data: questions, error: questionsError } = await supabase
      .from("interview_questions")
      .select("*")
      .eq("isActive", true)
      .order("questionNumber", { ascending: true });

    if (questionsError) {
      console.error("❌ Error fetching questions:", questionsError);
      return NextResponse.json(
        { success: false, message: "Gagal mengambil pertanyaan wawancara" },
        { status: 500 }
      );
    }

    let responses: Array<{
      questionId: string;
      response: string;
      score: number;
      notes: string;
      id: string;
    }> = [];
    let sessionData = null;

    // If sessionId provided, get existing responses and session data
    if (sessionId) {
      // Get session data
      const { data: session, error: sessionError } = await supabase
        .from("interview_sessions")
        .select(
          `
          id,
          applicantId,
          interviewerId,
          interviewDate,
          location,
          status,
          notes,
          applicants!inner(
            id,
            fullName,
            email,
            nim,
            nia,
            faculty,
            department,
            studyProgram
          ),
          interviewers!inner(
            id,
            fullName,
            username
          )
        `
        )
        .eq("id", sessionId)
        .eq("interviewerId", auth.interviewer!.id)
        .single();

      if (sessionError) {
        console.error("❌ Error fetching session:", sessionError);
        return NextResponse.json(
          { success: false, message: "Sesi wawancara tidak ditemukan" },
          { status: 404 }
        );
      }

      sessionData = session;

      // Get existing responses
      const { data: existingResponses } = await supabase
        .from("interview_responses")
        .select("*")
        .eq("sessionId", sessionId);

      responses = existingResponses || [];
    }

    // Merge questions with existing responses
    const formData = questions.map((question) => {
      const existingResponse = responses.find(
        (r) => r.questionId === (question as QuestionData).id
      );
      return {
        question,
        response: existingResponse?.response || "",
        score: existingResponse?.score || 1,
        notes: existingResponse?.notes || "",
        responseId: existingResponse?.id || null,
      };
    });

    console.log(
      `✅ Fetched ${questions.length} questions${
        sessionId ? " with existing responses" : ""
      }`
    );

    return NextResponse.json({
      success: true,
      data: {
        questions: formData,
        session: sessionData,
        totalQuestions: questions.length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching interview form:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export const GET = withInterviewerAuth(handler);
