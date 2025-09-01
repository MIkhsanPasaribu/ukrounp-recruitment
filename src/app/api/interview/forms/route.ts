import { NextRequest, NextResponse } from "next/server";
import { withInterviewerAuth } from "@/lib/auth-interviewer-middleware";
import { supabase } from "@/lib/supabase";

async function handler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

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

    let responses = [];
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
        (r) => r.questionId === question.id
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
