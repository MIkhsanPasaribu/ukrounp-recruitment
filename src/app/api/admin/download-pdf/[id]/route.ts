import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateRegistrationConfirmation } from "@/utils/pdfGeneratorJsPDF";
import { ApplicationData } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Ambil data dari Supabase
    const { data: applicants, error } = await supabase
      .from("applicants")
      .select("*")
      .eq("id", id)
      .limit(1);

    if (error) {
      console.error("Error mengambil data pelamar:", error);
      return NextResponse.json(
        { error: "Gagal mengambil data pelamar" },
        { status: 500 }
      );
    }

    if (!applicants || applicants.length === 0) {
      return NextResponse.json(
        { error: "Pelamar tidak ditemukan" },
        { status: 404 }
      );
    }

    // Format data untuk PDF generator
    const applicantData = applicants[0];

    // Debug: Periksa apakah foto ada di database
    console.log("=== DEBUG DATABASE ===");
    console.log("Field foto ada:", !!applicantData.photo);
    console.log("Panjang foto:", applicantData.photo?.length || 0);
    console.log(
      "Foto dimulai dengan data:",
      applicantData.photo?.startsWith("data:") || false
    );
    console.log("====================");

    const formattedData: ApplicationData = {
      id: applicantData.id,
      email: applicantData.email || "",
      fullName: applicantData.fullName || "",
      nickname: applicantData.nickname,
      gender: applicantData.gender,
      birthDate: applicantData.birthDate,
      faculty: applicantData.faculty,
      department: applicantData.department,
      studyProgram: applicantData.studyProgram,
      nim: applicantData.nim,
      nia: applicantData.nia,
      previousSchool: applicantData.previousSchool,
      padangAddress: applicantData.padangAddress,
      phoneNumber: applicantData.phoneNumber,
      motivation: applicantData.motivation,
      futurePlans: applicantData.futurePlans,
      whyYouShouldBeAccepted: applicantData.whyYouShouldBeAccepted,
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
      mbtiProof: applicantData.mbtiProof,
      photo: applicantData.photo,
      studentCard: applicantData.studentCard,
      studyPlanCard: applicantData.studyPlanCard,
      igFollowProof: applicantData.igFollowProof,
      tiktokFollowProof: applicantData.tiktokFollowProof,
      status: applicantData.status,
      submittedAt: applicantData.submittedAt,
    };

    // Generate PDF
    const pdfBuffer = await generateRegistrationConfirmation(formattedData);

    // Return PDF sebagai respons
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="formulir-pendaftaran-${formattedData.fullName.replace(
          /\s+/g,
          "-"
        )}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error menghasilkan PDF:", error);
    return NextResponse.json(
      { error: "Gagal menghasilkan PDF" },
      { status: 500 }
    );
  }
}
