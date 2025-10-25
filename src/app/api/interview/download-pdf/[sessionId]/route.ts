import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";

interface ApplicantData {
  id?: string;
  fullName?: string;
  email?: string;
  nim?: string;
  nia?: string;
  faculty?: string;
  department?: string;
  studyProgram?: string;
  educationLevel?: string;
}

interface InterviewerData {
  id?: string;
  fullName?: string;
  email?: string;
  username?: string;
}

interface QuestionData {
  id?: string;
  question?: string;
  category?: string;
  questionNumber?: number;
  questionText?: string;
}

interface ResponseData {
  id?: string;
  sessionId?: string;
  questionId?: string;
  response?: string;
  score?: number;
  notes?: string;
  interview_questions?: QuestionData | QuestionData[];
}

interface SessionData {
  id?: string;
  applicantId?: string;
  interviewerId?: string;
  status?: string;
  totalScore?: number;
  notes?: string;
  recommendation?: string;
  interviewDate?: string;
  interviewerName?: string;
  location?: string;
  applicants?: ApplicantData | ApplicantData[];
  interviewers?: InterviewerData | InterviewerData[];
}

async function handler(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;

    console.log("📄 Generating PDF for interview session:", sessionId);

    // Get session data with applicant, interviewer, and responses
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
        interviewerName,
        totalScore,
        recommendation,
        assignment_id,
        applicants!inner(
          id,
          fullName,
          email,
          nim,
          nia,
          faculty,
          department,
          studyProgram,
          educationLevel,
          phoneNumber,
          gender,
          birthDate
        ),
        interviewers!inner(
          id,
          fullName,
          username,
          email
        )
      `
      )
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, message: "Sesi wawancara tidak ditemukan" },
        { status: 404 }
      );
    }

    // Type assertion to include new fields

    // Get responses with questions
    const { data: responses, error: responsesError } = await supabase
      .from("interview_responses")
      .select(
        `
        id,
        response,
        score,
        notes,
        interview_questions!inner(
          questionNumber,
          questionText,
          category
        )
      `
      )
      .eq("sessionId", sessionId)
      .order("interview_questions(questionNumber)");

    if (responsesError) {
      console.error("❌ Error fetching responses:", responsesError);
      // Continue without responses if error
      console.log("⚠️ Continuing PDF generation without responses");
    }

    console.log(
      `📋 Found ${responses?.length || 0} responses for session ${sessionId}`
    );

    // Create PDF
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const lineHeight = 7;
    let yPosition = margin;

    // Helper function to add text with word wrap
    const addText = (
      text: string,
      x: number,
      y: number,
      maxWidth?: number,
      fontSize = 10
    ) => {
      pdf.setFontSize(fontSize);
      if (maxWidth) {
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return y + lines.length * lineHeight;
      } else {
        pdf.text(text, x, y);
        return y + lineHeight;
      }
    };

    // Header
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    yPosition = addText(
      "FORMULIR HASIL WAWANCARA",
      margin,
      yPosition,
      undefined,
      16
    );
    yPosition = addText(
      "UNIT KEGIATAN ROBOTIKA UNIVERSITAS NEGERI PADANG (UKRO UNP)",
      margin,
      yPosition,
      undefined,
      14
    );
    yPosition += 10;

    // Applicant Information
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    yPosition = addText("DATA PESERTA", margin, yPosition, undefined, 12);
    yPosition += 5;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const typedSessionData = session as SessionData;
    const applicant = Array.isArray(typedSessionData.applicants)
      ? typedSessionData.applicants[0]
      : typedSessionData.applicants;

    if (applicant) {
      yPosition = addText(
        `Nama Lengkap: ${applicant.fullName || "N/A"}`,
        margin,
        yPosition
      );
      yPosition = addText(
        `Email: ${applicant.email || "N/A"}`,
        margin,
        yPosition
      );
      yPosition = addText(`NIM: ${applicant.nim || "-"}`, margin, yPosition);
      yPosition = addText(`NIA: ${applicant.nia || "-"}`, margin, yPosition);
      yPosition = addText(
        `Fakultas: ${applicant.faculty || "-"}`,
        margin,
        yPosition
      );
      yPosition = addText(
        `Jurusan: ${applicant.department || "-"}`,
        margin,
        yPosition
      );
      yPosition = addText(
        `Program Studi: ${applicant.studyProgram || "-"}`,
        margin,
        yPosition
      );
      yPosition = addText(
        `Jenjang Pendidikan: ${applicant.educationLevel || "-"}`,
        margin,
        yPosition
      );
    } else {
      yPosition = addText("Data peserta tidak tersedia", margin, yPosition);
    }
    yPosition += 10;

    // Interview Information
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    yPosition = addText(
      "INFORMASI WAWANCARA",
      margin,
      yPosition,
      undefined,
      12
    );
    yPosition += 5;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const interviewer = Array.isArray(typedSessionData.interviewers)
      ? typedSessionData.interviewers[0]
      : typedSessionData.interviewers;
    yPosition = addText(
      `Pewawancara: ${
        typedSessionData.interviewerName || interviewer?.fullName || "N/A"
      }`,
      margin,
      yPosition
    );
    yPosition = addText(
      `Tanggal: ${
        typedSessionData.interviewDate
          ? new Date(typedSessionData.interviewDate).toLocaleDateString("id-ID")
          : "-"
      }`,
      margin,
      yPosition
    );
    yPosition = addText(
      `Lokasi: ${typedSessionData.location || "-"}`,
      margin,
      yPosition
    );
    yPosition = addText(
      `Status: ${typedSessionData.status}`,
      margin,
      yPosition
    );
    yPosition += 10;

    // Questions and Responses
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    yPosition = addText("HASIL WAWANCARA", margin, yPosition, undefined, 12);
    yPosition += 5;

    if (responses && responses.length > 0) {
      responses.forEach((response, index) => {
        // Check if need new page
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = margin;
        }

        const typedResponse = response as ResponseData;
        const question = Array.isArray(typedResponse.interview_questions)
          ? typedResponse.interview_questions[0]
          : typedResponse.interview_questions;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        if (question) {
          yPosition = addText(
            `${question.questionNumber || index + 1}. ${
              question.questionText || "Pertanyaan tidak tersedia"
            }`,
            margin,
            yPosition,
            pageWidth - 2 * margin
          );

          if (question.category) {
            pdf.setFontSize(8);
            pdf.setFont("helvetica", "italic");
            yPosition = addText(`(${question.category})`, margin, yPosition);
          }
        }
        yPosition += 5;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        yPosition = addText(
          `Jawaban: ${typedResponse.response || "Tidak ada jawaban"}`,
          margin,
          yPosition,
          pageWidth - 2 * margin
        );
        yPosition = addText(
          `Skor: ${typedResponse.score || 0}/5`,
          margin,
          yPosition
        );
        if (typedResponse.notes) {
          yPosition = addText(
            `Catatan: ${typedResponse.notes}`,
            margin,
            yPosition,
            pageWidth - 2 * margin
          );
        }
        yPosition += 8;
      });
    } else {
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "italic");
      yPosition = addText(
        "Belum ada jawaban yang tersimpan untuk sesi wawancara ini.",
        margin,
        yPosition
      );
      yPosition += 10;
    }

    // Summary
    if (yPosition > 220) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    yPosition = addText(
      "RINGKASAN PENILAIAN",
      margin,
      yPosition,
      undefined,
      12
    );
    yPosition += 5;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    // Calculate total score from responses
    const totalScore =
      responses?.reduce(
        (sum, r) => sum + ((r as ResponseData).score || 0),
        0
      ) || 0;
    const maxScore = responses?.length ? responses.length * 5 : 0;
    const avgScoreNum = responses?.length ? totalScore / responses.length : 0;
    const avgScore = avgScoreNum.toFixed(2);

    yPosition = addText(
      `Total Skor: ${totalScore}/${maxScore}`,
      margin,
      yPosition
    );
    yPosition = addText(`Rata-rata Skor: ${avgScore}/5`, margin, yPosition);

    // Generate recommendation based on average score
    let recommendation = "Belum ada rekomendasi";
    if (avgScoreNum >= 4.5) {
      recommendation = "Sangat Direkomendasikan";
    } else if (avgScoreNum >= 4.0) {
      recommendation = "Direkomendasikan";
    } else if (avgScoreNum >= 3.0) {
      recommendation = "Dipertimbangkan";
    } else {
      recommendation = "Tidak Direkomendasikan";
    }

    yPosition = addText(`Rekomendasi: ${recommendation}`, margin, yPosition);

    if (typedSessionData.notes) {
      yPosition += 5;
      yPosition = addText(`Catatan Tambahan:`, margin, yPosition);
      yPosition = addText(
        typedSessionData.notes,
        margin,
        yPosition,
        pageWidth - 2 * margin
      );
    }

    // Footer
    yPosition += 20;
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "italic");
    yPosition = addText(
      `Dibuat pada: ${new Date().toLocaleDateString(
        "id-ID"
      )} ${new Date().toLocaleTimeString("id-ID")}`,
      margin,
      yPosition,
      undefined,
      8
    );

    // Generate PDF
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    console.log("✅ PDF generated successfully");

    // Safe filename generation
    const applicantName = applicant?.fullName
      ? applicant.fullName.replace(/[^a-zA-Z0-9\-_]/g, "-").replace(/--+/g, "-")
      : "kandidat";
    const sessionShort = sessionId.substring(0, 8);
    const filename = `wawancara-${applicantName}-${sessionShort}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat PDF" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  const params = await context.params;
  return handler(request, { params });
}
