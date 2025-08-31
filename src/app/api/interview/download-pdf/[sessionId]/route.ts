import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";

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
        totalScore,
        recommendation,
        createdAt,
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
      return NextResponse.json(
        { success: false, message: "Gagal mengambil data jawaban" },
        { status: 500 }
      );
    }

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
      "UNIT KEGIATAN ROBOTIKA OTOMASI (UKRO)",
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
    const applicant = Array.isArray(session.applicants)
      ? session.applicants[0]
      : session.applicants;
    if (applicant) {
      yPosition = addText(
        `Nama Lengkap: ${applicant.fullName}`,
        margin,
        yPosition
      );
      yPosition = addText(`Email: ${applicant.email}`, margin, yPosition);
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
    const interviewer = Array.isArray(session.interviewers)
      ? session.interviewers[0]
      : session.interviewers;
    yPosition = addText(
      `Pewawancara: ${interviewer?.fullName || "N/A"}`,
      margin,
      yPosition
    );
    yPosition = addText(
      `Tanggal: ${
        session.interviewDate
          ? new Date(session.interviewDate).toLocaleDateString("id-ID")
          : "-"
      }`,
      margin,
      yPosition
    );
    yPosition = addText(
      `Lokasi: ${session.location || "-"}`,
      margin,
      yPosition
    );
    yPosition = addText(`Status: ${session.status}`, margin, yPosition);
    yPosition += 10;

    // Questions and Responses
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    yPosition = addText("HASIL WAWANCARA", margin, yPosition, undefined, 12);
    yPosition += 5;

    responses?.forEach((response) => {
      // Check if need new page
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = margin;
      }

      const question = Array.isArray(response.interview_questions)
        ? response.interview_questions[0]
        : response.interview_questions;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      if (question) {
        yPosition = addText(
          `${question.questionNumber}. ${question.questionText}`,
          margin,
          yPosition,
          pageWidth - 2 * margin
        );
      }
      yPosition += 5;

      pdf.setFont("helvetica", "normal");
      yPosition = addText(
        `Jawaban: ${response.response || "Tidak ada jawaban"}`,
        margin,
        yPosition,
        pageWidth - 2 * margin
      );
      yPosition = addText(`Skor: ${response.score}/5`, margin, yPosition);
      if (response.notes) {
        yPosition = addText(
          `Catatan: ${response.notes}`,
          margin,
          yPosition,
          pageWidth - 2 * margin
        );
      }
      yPosition += 8;
    });

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
    const maxScore = responses?.length ? responses.length * 5 : 0;
    const avgScore =
      session.totalScore && responses?.length
        ? (session.totalScore / responses.length).toFixed(2)
        : 0;

    yPosition = addText(
      `Total Skor: ${session.totalScore || 0}/${maxScore}`,
      margin,
      yPosition
    );
    yPosition = addText(`Rata-rata Skor: ${avgScore}/5`, margin, yPosition);
    yPosition = addText(
      `Rekomendasi: ${session.recommendation || "Belum ada rekomendasi"}`,
      margin,
      yPosition
    );

    if (session.notes) {
      yPosition += 5;
      yPosition = addText(`Catatan Tambahan:`, margin, yPosition);
      yPosition = addText(
        session.notes,
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

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="wawancara-${
          applicant?.fullName?.replace(/\s+/g, "-") || "kandidat"
        }-${sessionId.substring(0, 8)}.pdf"`,
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
