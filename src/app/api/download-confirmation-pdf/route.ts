import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateRegistrationConfirmation } from "@/utils/pdfGeneratorJsPDF";
import { ApplicationData } from "@/types";

// Interface untuk data applicant dari database
interface ApplicantConfirmationData {
  id: string;
  email?: string;
  fullName?: string;
  nickname?: string;
  gender?: "LAKI_LAKI" | "PEREMPUAN";
  birthDate?: string;
  faculty?: string;
  department?: string;
  studyProgram?: string;
  nim?: string;
  nia?: string;
  previousSchool?: string;
  padangAddress?: string;
  phoneNumber?: string;
  motivation?: string;
  futurePlans?: string;
  whyYouShouldBeAccepted?: string;
  corelDraw?: boolean;
  photoshop?: boolean;
  adobePremierePro?: boolean;
  adobeAfterEffect?: boolean;
  autodeskEagle?: boolean;
  arduinoIde?: boolean;
  androidStudio?: boolean;
  visualStudio?: boolean;
  missionPlaner?: boolean;
  autodeskInventor?: boolean;
  autodeskAutocad?: boolean;
  solidworks?: boolean;
  otherSoftware?: string;
  studyPlanCard?: string;
  igFollowProof?: string;
  tiktokFollowProof?: string;
  status?:
    | "SEDANG_DITINJAU"
    | "DAFTAR_PENDEK"
    | "INTERVIEW"
    | "DITERIMA"
    | "DITOLAK";
  submittedAt?: string | Date;
  mbtiProof?: string;
  photo?: string;
}

export async function POST(request: Request) {
  try {
    // Validasi request body
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Request body tidak valid" },
        { status: 400 }
      );
    }

    const { email, birthDate } = body;

    // Validasi input
    if (!email || !birthDate) {
      return NextResponse.json(
        { error: "Email dan tanggal lahir diperlukan" },
        { status: 400 }
      );
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    // Validasi format tanggal lahir (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate)) {
      return NextResponse.json(
        { error: "Format tanggal lahir tidak valid (gunakan YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    console.log(
      `Mencari aplikasi dengan email: ${email} dan tanggal lahir: ${birthDate}`
    );

    // Ambil data dari Supabase
    const { data, error } = await supabase
      .from("applicants")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .eq("birthDate", birthDate)
      .limit(1);

    const applicants = data as ApplicantConfirmationData[] | null;

    if (error) {
      console.error("Error mengambil data pelamar:", error);
      return NextResponse.json(
        { error: "Gagal mengambil data pelamar dari database" },
        { status: 500 }
      );
    }

    if (!applicants || applicants.length === 0) {
      console.log(`Aplikasi tidak ditemukan untuk email: ${email}`);
      return NextResponse.json(
        { error: "Aplikasi tidak ditemukan atau tanggal lahir tidak cocok" },
        { status: 404 }
      );
    }

    // Format data untuk PDF generator
    const applicantData = applicants[0];

    console.log(
      `Memproses PDF untuk: ${applicantData.fullName} (${applicantData.email})`
    );

    const formattedData: ApplicationData = {
      id: applicantData.id,
      email: applicantData.email || "",
      fullName: applicantData.fullName || "",
      nickname: applicantData.nickname || "",
      gender: applicantData.gender,
      birthDate: applicantData.birthDate,
      faculty: applicantData.faculty || "",
      department: applicantData.department || "",
      studyProgram: applicantData.studyProgram || "",
      nim: applicantData.nim || "",
      nia: applicantData.nia || "",
      previousSchool: applicantData.previousSchool || "",
      padangAddress: applicantData.padangAddress || "",
      phoneNumber: applicantData.phoneNumber || "",
      motivation: applicantData.motivation || "",
      futurePlans: applicantData.futurePlans || "",
      whyYouShouldBeAccepted: applicantData.whyYouShouldBeAccepted || "",
      software: {
        corelDraw: Boolean(applicantData.corelDraw),
        photoshop: Boolean(applicantData.photoshop),
        adobePremierePro: Boolean(applicantData.adobePremierePro),
        adobeAfterEffect: Boolean(applicantData.adobeAfterEffect),
        autodeskEagle: Boolean(applicantData.autodeskEagle),
        arduinoIde: Boolean(applicantData.arduinoIde),
        androidStudio: Boolean(applicantData.androidStudio),
        visualStudio: Boolean(applicantData.visualStudio),
        missionPlaner: Boolean(applicantData.missionPlaner),
        autodeskInventor: Boolean(applicantData.autodeskInventor),
        autodeskAutocad: Boolean(applicantData.autodeskAutocad),
        solidworks: Boolean(applicantData.solidworks),
        others: applicantData.otherSoftware || "",
      },
      studyPlanCard: applicantData.studyPlanCard || "",
      igFollowProof: applicantData.igFollowProof || "",
      tiktokFollowProof: applicantData.tiktokFollowProof || "",
      status: applicantData.status || "SEDANG_DITINJAU",
      submittedAt: applicantData.submittedAt,
      mbtiProof: applicantData.mbtiProof || "",
      photo: applicantData.photo || "",
    };

    // Generate PDF
    const pdfBytes = await generateRegistrationConfirmation(formattedData);

    if (!pdfBytes || pdfBytes.length === 0) {
      console.error("PDF generation menghasilkan data kosong");
      return NextResponse.json(
        { error: "Gagal menghasilkan PDF - data kosong" },
        { status: 500 }
      );
    }

    console.log(`PDF berhasil dibuat dengan ukuran: ${pdfBytes.length} bytes`);

    // Sanitize filename untuk keamanan
    const sanitizedName = formattedData.fullName
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();

    // Convert Buffer ke Uint8Array untuk NextResponse
    const pdfArray = new Uint8Array(pdfBytes);

    // Return PDF sebagai respons
    return new NextResponse(pdfArray, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="formulir-pendaftaran-${sanitizedName}.pdf"`,
        "Content-Length": pdfBytes.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error dalam download confirmation PDF:", error);

    // Handle different types of errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Format request tidak valid" },
        { status: 400 }
      );
    }

    if (error instanceof TypeError) {
      return NextResponse.json(
        { error: "Tipe data tidak valid" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Gagal menghasilkan PDF konfirmasi pendaftaran",
        details:
          error instanceof Error ? error.message : "Kesalahan tidak diketahui",
      },
      { status: 500 }
    );
  }
}
