import { generateRegistrationConfirmation } from "@/utils/pdfGeneratorJsPDF";
import { ApplicationData } from "@/types";
import { PdfGenerationResult } from "./types";

/**
 * Service untuk menghasilkan PDF secara efisien
 */
export class PdfGenerationService {
  /**
   * Menghasilkan PDF untuk satu aplikasi dengan error handling yang baik
   * @param applicationData - Data aplikasi
   * @returns Promise yang berisi hasil generasi PDF
   */
  static async buatPdfAplikasi(
    applicationData: ApplicationData
  ): Promise<PdfGenerationResult> {
    try {
      // Sanitasi nama untuk nama file
      const sanitizedName = applicationData.fullName
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "-");

      const fileName = `formulir-pendaftaran-${sanitizedName}-${applicationData.id}.pdf`;

      console.log(
        `Memulai generasi PDF untuk: ${applicationData.fullName} (ID: ${applicationData.id})`
      );

      // Generate PDF
      const pdfBytes = await generateRegistrationConfirmation(applicationData);

      if (!pdfBytes || pdfBytes.length === 0) {
        return {
          success: false,
          fileName,
          error: `PDF kosong untuk ${applicationData.fullName}`,
        };
      }

      console.log(
        `Berhasil membuat PDF untuk: ${applicationData.fullName} (${pdfBytes.length} bytes)`
      );

      return {
        success: true,
        fileName,
        buffer: Buffer.from(pdfBytes),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error tidak diketahui";
      console.error(
        `Error generasi PDF untuk ${applicationData.fullName}:`,
        error
      );

      return {
        success: false,
        fileName: `formulir-pendaftaran-${applicationData.id}.pdf`,
        error: `Gagal membuat PDF: ${errorMessage}`,
      };
    }
  }

  /**
   * Menghasilkan banyak PDF secara batch dengan retry mechanism
   * @param applications - Array data aplikasi
   * @param batchSize - Ukuran batch untuk pemrosesan
   * @param maxRetries - Maksimal retry untuk setiap PDF
   * @returns Promise yang berisi hasil generasi PDF
   */
  static async buatBanyakPdf(
    applications: ApplicationData[],
    batchSize: number = 5,
    maxRetries: number = 2
  ): Promise<PdfGenerationResult[]> {
    const results: PdfGenerationResult[] = [];

    console.log(
      `Memulai generasi ${applications.length} PDF dengan batch size ${batchSize}`
    );

    // Proses dalam batch untuk menghindari memory overflow
    for (let i = 0; i < applications.length; i += batchSize) {
      const batch = applications.slice(i, i + batchSize);
      console.log(
        `Memproses batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          applications.length / batchSize
        )}`
      );

      // Proses batch secara paralel
      const batchPromises = batch.map(async (app) => {
        return this.buatPdfDenganRetry(app, maxRetries);
      });

      try {
        const batchResults = await Promise.allSettled(batchPromises);

        batchResults.forEach((result, index) => {
          if (result.status === "fulfilled") {
            results.push(result.value);
          } else {
            // Jika Promise.allSettled gagal, buat result error
            results.push({
              success: false,
              fileName: `formulir-pendaftaran-${batch[index].id}.pdf`,
              error: `Batch processing gagal: ${result.reason}`,
            });
          }
        });

        // Beri jeda antara batch untuk mengurangi beban
        if (i + batchSize < applications.length) {
          await this.tunggu(100); // Tunggu 100ms
        }
      } catch (error) {
        console.error(
          `Error memproses batch ${Math.floor(i / batchSize) + 1}:`,
          error
        );

        // Tambahkan error result untuk semua aplikasi dalam batch ini
        batch.forEach((app) => {
          results.push({
            success: false,
            fileName: `formulir-pendaftaran-${app.id}.pdf`,
            error: `Batch processing error: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          });
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    console.log(
      `Selesai generasi PDF: ${successCount}/${applications.length} berhasil`
    );

    return results;
  }

  /**
   * Membuat PDF dengan retry mechanism
   * @param applicationData - Data aplikasi
   * @param maxRetries - Maksimal retry
   * @returns Promise hasil generasi PDF
   */
  private static async buatPdfDenganRetry(
    applicationData: ApplicationData,
    maxRetries: number
  ): Promise<PdfGenerationResult> {
    let lastError: string = "";

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        const result = await this.buatPdfAplikasi(applicationData);

        if (result.success) {
          return result;
        }

        lastError = result.error || "Unknown error";

        if (attempt <= maxRetries) {
          console.log(
            `Retry ${attempt}/${maxRetries} untuk ${applicationData.fullName}`
          );
          await this.tunggu(attempt * 500); // Exponential backoff
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : "Unknown error";

        if (attempt <= maxRetries) {
          console.log(
            `Retry ${attempt}/${maxRetries} untuk ${applicationData.fullName} (error: ${lastError})`
          );
          await this.tunggu(attempt * 500);
        }
      }
    }

    return {
      success: false,
      fileName: `formulir-pendaftaran-${applicationData.id}.pdf`,
      error: `Gagal setelah ${maxRetries + 1} percobaan: ${lastError}`,
    };
  }

  /**
   * Utility function untuk menunggu
   * @param ms - Milliseconds untuk ditunggu
   */
  private static tunggu(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Memvalidasi ukuran PDF yang dihasilkan
   * @param buffer - Buffer PDF
   * @returns Boolean apakah PDF valid
   */
  static validasiPdf(buffer: Buffer): boolean {
    if (!buffer || buffer.length === 0) {
      return false;
    }

    // Cek header PDF
    const header = buffer.toString("ascii", 0, 4);
    if (header !== "%PDF") {
      return false;
    }

    // Cek minimal size (1KB)
    if (buffer.length < 1024) {
      return false;
    }

    return true;
  }
}
