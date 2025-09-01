import { NextRequest, NextResponse } from "next/server";
import { withInterviewerAuth } from "@/lib/auth-interviewer-middleware";
import { supabase } from "@/lib/supabase";
import { InterviewerUser } from "@/types/interview";

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

    if (!sessionId || !responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { success: false, message: "Data form tidak valid" },
        { status: 400 }
      );
    }

    console.log("💾 Saving interview responses for session:", sessionId);

    // Verify session belongs to this interviewer
    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .select("id, interviewerId, applicantId")
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

    // Calculate total score
    let totalScore = 0;
    const validResponses = [];

    for (const response of responses) {
      if (
        !response.questionId ||
        !response.score ||
        response.score < 1 ||
        response.score > 5
      ) {
        continue;
      }

      validResponses.push({
        sessionId,
        questionId: response.questionId,
        response: response.response || "",
        score: parseInt(response.score),
        notes: response.notes || "",
      });

      totalScore += parseInt(response.score);
    }

    if (validResponses.length === 0) {
      return NextResponse.json(
        { success: false, message: "Tidak ada jawaban yang valid" },
        { status: 400 }
      );
    }

    // Delete existing responses for this session
    await supabase
      .from("interview_responses")
      .delete()
      .eq("sessionId", sessionId);

    // Insert new responses
    const { error: responsesError } = await supabase
      .from("interview_responses")
      .insert(validResponses);

    if (responsesError) {
      console.error("❌ Error saving responses:", responsesError);
      return NextResponse.json(
        { success: false, message: "Gagal menyimpan jawaban wawancara" },
        { status: 500 }
      );
    }

    // Update session with notes and status only
    const sessionUpdateData: Record<string, string> = {
      status: "COMPLETED",
      updated_at: new Date().toISOString(),
    };

    if (sessionNotes) {
      sessionUpdateData.notes = sessionNotes;
    }

    const { error: sessionUpdateError } = await supabase
      .from("interview_sessions")
      .update(sessionUpdateData)
      .eq("id", sessionId);

    if (sessionUpdateError) {
      console.error("❌ Error updating session:", sessionUpdateError);
      return NextResponse.json(
        { success: false, message: "Gagal memperbarui sesi wawancara" },
        { status: 500 }
      );
    }

    console.log(
      `✅ Interview completed. Total score: ${totalScore}/${
        validResponses.length * 5
      }`
    );

    return NextResponse.json({
      success: true,
      message: "Hasil wawancara berhasil disimpan",
      data: {
        sessionId,
        totalScore,
        maxScore: validResponses.length * 5,
        averageScore: (totalScore / validResponses.length).toFixed(2),
        responseCount: validResponses.length,
        recommendation,
      },
    });
  } catch (error) {
    console.error("❌ Error saving interview responses:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export const POST = withInterviewerAuth(handler);
