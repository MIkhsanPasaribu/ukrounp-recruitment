/* eslint-disable @typescript-eslint/no-unused-vars */
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

    console.log("💾 Saving interview responses:", {
      sessionId,
      interviewerId: interviewer.id,
      interviewerUsername: interviewer.username,
      responsesCount: responses?.length || 0,
    });

    // More thorough validation
    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Session ID diperlukan" },
        { status: 400 }
      );
    }

    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { success: false, message: "Data form tidak valid" },
        { status: 400 }
      );
    }

    // Allow empty recommendation for drafts
    const finalRecommendation = recommendation || "BELUM_DIEVALUASI";

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

    // Calculate total score and validate responses
    let totalScore = 0;
    const validResponses = [];

    for (const response of responses) {
      // More flexible validation - allow score to be 0 or missing for incomplete forms
      if (!response.questionId) {
        console.log("⚠️ Skipping response without questionId:", response);
        continue;
      }

      const score = parseInt(response.score) || 0;
      if (score < 0 || score > 5) {
        console.log("⚠️ Invalid score, setting to 0:", score);
      }

      const validResponse = {
        sessionId,
        questionId: response.questionId,
        response: response.response || "",
        score: Math.max(0, Math.min(5, score)), // Ensure score is between 0-5
        notes: response.notes || "",
      };

      validResponses.push(validResponse);
      totalScore += validResponse.score;
    }

    console.log(
      `📊 Processed ${validResponses.length} responses, total score: ${totalScore}`
    );

    if (validResponses.length === 0) {
      return NextResponse.json(
        { success: false, message: "Tidak ada jawaban yang valid" },
        { status: 400 }
      );
    }

    // Delete existing responses for this session
    const { error: deleteError } = await supabase
      .from("interview_responses")
      .delete()
      .eq("sessionId", sessionId);

    if (deleteError) {
      console.error("❌ Error deleting existing responses:", deleteError);
      // Continue anyway - might be first time submitting
    }

    // Insert new responses
    const { error: responsesError } = await supabase
      .from("interview_responses")
      .insert(validResponses);

    if (responsesError) {
      console.error("❌ Error saving responses:", responsesError);
      return NextResponse.json(
        {
          success: false,
          message: `Gagal menyimpan jawaban wawancara: ${responsesError.message}`,
          debug: responsesError.details || responsesError.hint,
        },
        { status: 500 }
      );
    }

    console.log(`✅ Saved ${validResponses.length} responses to database`);

    // Update session with notes and status
    const sessionUpdateData: Record<string, string | number> = {
      status: "COMPLETED",
      updated_at: new Date().toISOString(),
    };

    // Try to update additional fields if columns exist
    try {
      sessionUpdateData.totalScore = totalScore;
      if (sessionNotes && sessionNotes.trim()) {
        sessionUpdateData.notes = sessionNotes.trim();
      }

      if (finalRecommendation && finalRecommendation !== "BELUM_DIEVALUASI") {
        sessionUpdateData.recommendation = finalRecommendation;
      }

      // Simpan nama pewawancara dari form
      if (interviewerName && interviewerName.trim()) {
        sessionUpdateData.interviewerName = interviewerName.trim();
      }
    } catch (error) {
      console.log(
        "ℹ️ Some columns might not exist, updating basic fields only"
      );
    }

    console.log("📝 Updating session:", sessionUpdateData);

    const { error: sessionUpdateError } = await supabase
      .from("interview_sessions")
      .update(sessionUpdateData)
      .eq("id", sessionId);

    if (sessionUpdateError) {
      console.error("❌ Error updating session:", sessionUpdateError);

      // If error is about missing columns, try updating with basic fields only
      if (
        sessionUpdateError.message?.includes("column") &&
        (sessionUpdateError.message?.includes("totalScore") ||
          sessionUpdateError.message?.includes("recommendation"))
      ) {
        console.log("🔧 Retrying with basic fields only...");
        const basicUpdateData: Record<string, string> = {
          status: "COMPLETED",
          updated_at: new Date().toISOString(),
        };

        if (sessionNotes && sessionNotes.trim()) {
          basicUpdateData.notes = sessionNotes.trim();
        }

        // Coba simpan nama pewawancara juga di retry
        if (interviewerName && interviewerName.trim()) {
          basicUpdateData.interviewerName = interviewerName.trim();
        }

        const { error: retryError } = await supabase
          .from("interview_sessions")
          .update(basicUpdateData)
          .eq("id", sessionId);

        if (retryError) {
          return NextResponse.json(
            {
              success: false,
              message: `Gagal memperbarui sesi wawancara: ${retryError.message}`,
              debug: retryError.details || retryError.hint,
            },
            { status: 500 }
          );
        }

        console.log("✅ Session updated with basic fields only");
      } else {
        return NextResponse.json(
          {
            success: false,
            message: `Gagal memperbarui sesi wawancara: ${sessionUpdateError.message}`,
            debug: sessionUpdateError.details || sessionUpdateError.hint,
          },
          { status: 500 }
        );
      }
    }

    console.log(`✅ Interview completed successfully:`, {
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
      message: "Hasil wawancara berhasil disimpan",
      data: {
        sessionId,
        totalScore,
        maxScore: validResponses.length * 5,
        averageScore: averageScore.toFixed(2),
        responseCount: validResponses.length,
        recommendation: recommendation || autoRecommendation,
        autoRecommendation,
        status: "COMPLETED",
        submittedAt: new Date().toISOString(),
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
