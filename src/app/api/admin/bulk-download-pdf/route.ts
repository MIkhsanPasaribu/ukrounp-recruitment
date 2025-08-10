import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateRegistrationConfirmation } from "@/utils/pdfGeneratorJsPDF";
import { ApplicationData } from "@/types";
import JSZip from "jszip";

export async function GET() {
  try {
    // Ambil semua data dari Supabase
    const { data: applications, error } = await supabase
      .from("applicants")
      .select("*")
      .order("submittedAt", { ascending: false });

    if (error) {
      console.error("Error mengambil aplikasi:", error);
      return NextResponse.json(
        { error: "Gagal mengambil aplikasi" },
        { status: 500 }
      );
    }

    console.log(`Ditemukan ${applications.length} aplikasi untuk diproses`);

    if (!applications || applications.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada aplikasi ditemukan" },
        { status: 404 }
      );
    }

    // Buat file ZIP menggunakan JSZip
    const zip = new JSZip();

    // Proses setiap aplikasi
    let processedCount = 0;
    for (const applicantData of applications) {
      try {
        console.log(
          `Memproses aplikasi ${processedCount + 1}/${
            applications.length
          } - ID: ${applicantData.id}, Nama: ${applicantData.fullName}`
        );

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
          studyPlanCard: applicantData.studyPlanCard,
          igFollowProof: applicantData.igFollowProof,
          tiktokFollowProof: applicantData.tiktokFollowProof,
          status: applicantData.status,
          submittedAt: applicantData.submittedAt,
          mbtiProof: applicantData.mbtiProof || "",
          photo: applicantData.photo || "",
        };

        // Generate PDF untuk aplikasi ini
        const pdfBytes = await generateRegistrationConfirmation(formattedData);

        if (pdfBytes && pdfBytes.length > 0) {
          const sanitizedName = formattedData.fullName
            .replace(/[^a-zA-Z0-9\s]/g, "")
            .replace(/\s+/g, "-");
          const fileName = `formulir-pendaftaran-${sanitizedName}-${formattedData.id}.pdf`;

          // Tambahkan PDF ke ZIP
          zip.file(fileName, Buffer.from(pdfBytes));

          console.log(
            `Berhasil menambahkan PDF untuk ${formattedData.fullName}`
          );
        } else {
          console.warn(`PDF kosong untuk ${formattedData.fullName}`);
        }

        processedCount++;
      } catch (error) {
        console.error(
          `Error memproses aplikasi ID ${applicantData.id}:`,
          error
        );
        // Lanjutkan dengan aplikasi berikutnya
        continue;
      }
    }

    console.log(
      `Berhasil memproses ${processedCount} dari ${applications.length} aplikasi`
    );

    // Generate ZIP buffer menggunakan blob lalu konversi ke buffer
    console.log("Menghasilkan file ZIP...");
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6,
      },
    });

    // Konversi blob ke buffer
    const zipBuffer = Buffer.from(await zipBlob.arrayBuffer());

    console.log(`ZIP berhasil dibuat dengan ukuran: ${zipBuffer.length} bytes`);

    // Return ZIP sebagai respons menggunakan NextResponse
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="semua-formulir-pendaftaran-${
          new Date().toISOString().split("T")[0]
        }.zip"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error dalam bulk download PDF:", error);
    return NextResponse.json(
      {
        error: "Gagal menghasilkan file ZIP",
        details:
          error instanceof Error ? error.message : "Kesalahan tidak diketahui",
      },
      { status: 500 }
    );
  }
}
