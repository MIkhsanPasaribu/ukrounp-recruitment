/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { withInterviewerAuth } from "@/lib/auth-interviewer-middleware";
import { supabase } from "@/lib/supabase";
import { InterviewerUser } from "@/types/interview";

interface AdditionalData {
  totalScore: number;
  recommendation: string;
  interviewerName: string;
  [key: string]: unknown;
}

interface QuestionData {
  id: string;
  questionNumber: number;
  questionText: string;
  category: string;
  [key: string]: unknown;
}

interface ResponseData {
  questionId: string;
  response: string;
  score: number;
  notes: string;
  [key: string]: unknown;
}

interface SessionData {
  id: string;
  status: string;
  [key: string]: unknown;
}

async function handler(
  request: NextRequest,
  auth: {
    isAuthenticated: boolean;
    interviewer?: InterviewerUser;
    token?: string;
  }
) {
  try {
    const sessionId = request.nextUrl.pathname.split("/").pop();
    const interviewer = auth.interviewer!;

    console.log("🔍 Fetching session details:", {
      sessionId,
      interviewerId: interviewer.id,
    });

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Session ID tidak ditemukan" },
        { status: 400 }
      );
    }

    // Get session details (without optional columns that might not exist)
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
        created_at,
        updated_at,
        applicants!inner(
          id,
          fullName,
          email,
          nim,
          nia,
          faculty,
          department,
          studyProgram
        )
      `
      )
      .eq("id", sessionId)
      .eq("interviewerId", interviewer.id)
      .single();

    if (sessionError || !session) {
      console.error("❌ Session not found:", sessionError);
      return NextResponse.json(
        {
          success: false,
          message: "Sesi wawancara tidak ditemukan atau tidak berwenang",
        },
        { status: 404 }
      );
    }

    // Try to get additional session data (totalScore, recommendation, interviewerName) if columns exist
    let totalScore = null;
    let recommendation = null;
    let interviewerName = null;

    try {
      const { data: additionalData } = await supabase
        .from("interview_sessions")
        .select("totalScore, recommendation, interviewerName")
        .eq("id", sessionId)
        .single();

      if (additionalData) {
        const typedData = additionalData as AdditionalData;
        totalScore = typedData.totalScore;
        recommendation = typedData.recommendation;
        interviewerName = typedData.interviewerName;
      }
    } catch (error) {
      // Columns might not exist yet, that's okay
      console.log("ℹ️ Additional columns not found, using defaults");
    } // Get questions and responses
    const { data: questions, error: questionsError } = await supabase
      .from("interview_questions")
      .select("id, questionNumber, questionText, category")
      .eq("isActive", true)
      .order("questionNumber");

    if (questionsError) {
      console.error("❌ Error fetching questions:", questionsError);
      return NextResponse.json(
        { success: false, message: "Gagal mengambil pertanyaan wawancara" },
        { status: 500 }
      );
    }

    // Get existing responses for this session
    const { data: responses, error: responsesError } = await supabase
      .from("interview_responses")
      .select("questionId, response, score, notes")
      .eq("sessionId", sessionId);

    if (responsesError) {
      console.error("❌ Error fetching responses:", responsesError);
      return NextResponse.json(
        { success: false, message: "Gagal mengambil jawaban wawancara" },
        { status: 500 }
      );
    }

    // Map responses to questions
    const formQuestions = questions.map((question) => {
      const existingResponse = responses?.find(
        (r) => (r as ResponseData).questionId === (question as QuestionData).id
      );

      return {
        question,
        response: (existingResponse as ResponseData)?.response || "",
        score: (existingResponse as ResponseData)?.score || 0,
        notes: (existingResponse as ResponseData)?.notes || "",
      };
    });

    console.log("✅ Session details fetched successfully:", {
      sessionId,
      questionsCount: formQuestions.length,
      responsesCount: responses?.length || 0,
      sessionStatus: (session as SessionData).status,
    });

    // Combine session data with additional fields
    const enhancedSession = {
      ...(session as Record<string, unknown>),
      totalScore,
      recommendation,
      interviewerName,
    };

    return NextResponse.json({
      success: true,
      data: {
        session: enhancedSession,
        questions: formQuestions,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching session details:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export const GET = withInterviewerAuth(handler);
