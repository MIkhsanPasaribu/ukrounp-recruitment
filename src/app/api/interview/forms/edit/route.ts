import { NextRequest, NextResponse } from "next/server";
import { withInterviewerAuth } from "@/lib/auth-interviewer-middleware";
import { supabase } from "@/lib/supabase";
import { InterviewerUser } from "@/types/interview";

// Interface for interview response data
interface InterviewResponseData {
  questionId: string;
  score: number;
  notes?: string;
  response?: string;
}

interface SessionData {
  id: string;
  interviewerId: string;
  applicantId: string;
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
    const {
      sessionId,
      responses,
      sessionNotes,
      recommendation,
      interviewerName,
    } = await request.json();
    const interviewer = auth.interviewer!;

    console.log("✏️ Editing interview responses:", {
      sessionId,
      interviewerId: interviewer.id,
      interviewerUsername: interviewer.username,
      responsesCount: responses?.length || 0,
      hasInterviewerName: !!interviewerName,
    });

    if (!sessionId || !responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { success: false, message: "Data form tidak valid" },
        { status: 400 }
      );
    }

    // Verify session belongs to this interviewer
    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .select("id, interviewerId, applicantId, status")
      .eq("id", sessionId)
      .eq("interviewerId", interviewer.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        {
          success: false,
          message: "Sesi wawancara tidak ditemukan atau tidak berwenang",
        },
        { status: 404 }
      );
    }

    // Check if session is completed (only allow editing completed sessions)
    if ((session as SessionData).status !== "COMPLETED") {
      return NextResponse.json(
        {
          success: false,
          message: "Hanya dapat mengedit wawancara yang sudah selesai",
        },
        { status: 400 }
      );
    }

    // Validate responses structure
    const validResponses = responses.filter(
      (response: InterviewResponseData) =>
        response.questionId &&
        response.score !== undefined &&
        response.score >= 1 &&
        response.score <= 5
    );

    if (validResponses.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Tidak ada jawaban yang valid untuk disimpan",
        },
        { status: 400 }
      );
    }

    // Calculate total score
    const totalScore = validResponses.reduce(
      (sum: number, response: InterviewResponseData) => sum + response.score,
      0
    );

    console.log("📊 Edit interview scoring:", {
      sessionId,
      totalScore,
      maxScore: validResponses.length * 5,
      averageScore:
        validResponses.length > 0
          ? (totalScore / validResponses.length).toFixed(2)
          : 0,
      responseCount: validResponses.length,
    });

    // Delete existing responses for this session
    const { error: deleteError } = await supabase
      .from("interview_responses")
      .delete()
      .eq("sessionId", sessionId);

    if (deleteError) {
      console.error("❌ Error deleting old responses:", deleteError);
      return NextResponse.json(
        { success: false, message: "Gagal menghapus jawaban lama" },
        { status: 500 }
      );
    }

    // Insert new responses
    const responsesToInsert = validResponses.map(
      (response: InterviewResponseData) => ({
        sessionId,
        questionId: response.questionId,
        response: response.response || "",
        score: response.score,
        notes: response.notes || "",
        created_at: new Date().toISOString(),
      })
    );

    const { error: responseError } = await supabase
      .from("interview_responses")
      .insert(responsesToInsert);

    if (responseError) {
      console.error("❌ Error inserting updated responses:", responseError);
      return NextResponse.json(
        { success: false, message: "Gagal menyimpan jawaban baru" },
        { status: 500 }
      );
    }

    // Update session with new notes, recommendation, and total score
    const updateData: {
      totalScore: number;
      updated_at: string;
      notes?: string;
      recommendation?: string;
      interviewerName?: string;
    } = {
      totalScore,
      updated_at: new Date().toISOString(),
    };

    if (sessionNotes !== undefined) {
      updateData.notes = sessionNotes;
    }

    if (recommendation !== undefined) {
      updateData.recommendation = recommendation;
    }

    // Save interviewer name from form
    if (interviewerName && interviewerName.trim()) {
      updateData.interviewerName = interviewerName.trim();
    }

    const { error: sessionUpdateError } = await supabase
      .from("interview_sessions")
      .update(updateData)
      .eq("id", sessionId);

    if (sessionUpdateError) {
      console.error("❌ Error updating session:", sessionUpdateError);
      return NextResponse.json(
        { success: false, message: "Gagal mengupdate sesi wawancara" },
        { status: 500 }
      );
    }

    console.log("✅ Interview successfully updated:", {
      sessionId,
      totalScore,
      maxScore: validResponses.length * 5,
      averageScore:
        validResponses.length > 0
          ? (totalScore / validResponses.length).toFixed(2)
          : 0,
      responseCount: validResponses.length,
      status: "COMPLETED",
    });

    // Generate recommendation based on average score
    const averageScore =
      validResponses.length > 0 ? totalScore / validResponses.length : 0;
    let autoRecommendation = "Belum dapat dievaluasi";

    if (averageScore >= 4.5) {
      autoRecommendation = "Sangat Direkomendasikan";
    } else if (averageScore >= 4.0) {
      autoRecommendation = "Direkomendasikan";
    } else if (averageScore >= 3.0) {
      autoRecommendation = "Dipertimbangkan";
    } else if (averageScore > 0) {
      autoRecommendation = "Tidak Direkomendasikan";
    }

    return NextResponse.json({
      success: true,
      message: "Hasil wawancara berhasil diupdate",
      data: {
        sessionId,
        totalScore,
        maxScore: validResponses.length * 5,
        averageScore: averageScore.toFixed(2),
        responseCount: validResponses.length,
        recommendation: recommendation || autoRecommendation,
        autoRecommendation,
        status: "COMPLETED",
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error updating interview responses:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export const PUT = withInterviewerAuth(handler);
