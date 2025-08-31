import { ApplicationDataService } from "./applicationDataService";
import { PdfGenerationService } from "./pdfGenerationService";
import { ZipGenerationService } from "./zipGenerationService";
import { BulkDownloadOptions, BulkDownloadResult, ProgressInfo } from "./types";

/**
 * Service utama untuk mengelola bulk download PDF secara efisien
 * Dirancang untuk mengatasi timeout di Vercel dengan optimasi memory dan batch processing
 */
export class BulkDownloadService {
  private options: Required<BulkDownloadOptions>;

  constructor(options: BulkDownloadOptions = {}) {
    this.options = {
      batchSize: options.batchSize || 10,
      compressionLevel: options.compressionLevel || 6,
      timeout: options.timeout || 8000, // 8 detik untuk Vercel
      maxRetries: options.maxRetries || 2,
    };
  }

  /**
   * Proses utama untuk bulk download PDF
   * Menggunakan strategi batch processing untuk menghindari timeout
   * @returns Promise dengan hasil bulk download
   */
  async prosesSemuaFormulir(): Promise<BulkDownloadResult> {
    const startTime = Date.now();
    const progressInfo: ProgressInfo = {
      processed: 0,
      total: 0,
      currentFile: "",
      status: "processing",
    };

    try {
      console.log("=== Memulai Bulk Download PDF ===");

      // Step 1: Ambil data aplikasi
      console.log("Step 1: Mengambil data aplikasi...");
      const applications = await ApplicationDataService.ambilSemuaAplikasi();

      if (applications.length === 0) {
        return {
          success: false,
          error: "Tidak ada aplikasi ditemukan",
          progressInfo: {
            ...progressInfo,
            status: "error",
            errorMessage: "Tidak ada aplikasi ditemukan",
          },
        };
      }

      progressInfo.total = applications.length;
      console.log(`Ditemukan ${applications.length} aplikasi untuk diproses`);

      // Step 2: Cek timeout awal
      if (this.cekTimeout(startTime)) {
        return this.hasilTimeout(progressInfo);
      }

      // Step 3: Generate PDF secara batch
      console.log("Step 2: Menghasilkan PDF secara batch...");
      progressInfo.status = "processing";
      progressInfo.currentFile = "Memproses PDF...";

      const pdfResults = await PdfGenerationService.buatBanyakPdf(
        applications,
        this.options.batchSize,
        this.options.maxRetries
      );

      // Update progress
      progressInfo.processed = pdfResults.filter((r) => r.success).length;

      // Step 4: Cek timeout setelah PDF generation
      if (this.cekTimeout(startTime)) {
        return this.hasilTimeout(progressInfo);
      }

      // Step 5: Buat ZIP
      console.log("Step 3: Membuat file ZIP...");
      progressInfo.currentFile = "Membuat ZIP...";

      const zipService = new ZipGenerationService(
        this.options.compressionLevel
      );
      const filesAdded = zipService.tambahkanBanyakPdfKeZip(pdfResults);

      if (filesAdded === 0) {
        return {
          success: false,
          error: "Tidak ada PDF yang valid untuk dimasukkan ke ZIP",
          progressInfo: {
            ...progressInfo,
            status: "error",
            errorMessage: "Tidak ada PDF yang valid",
          },
        };
      }

      // Step 6: Cek timeout sebelum generate ZIP buffer
      if (this.cekTimeout(startTime)) {
        return this.hasilTimeout(progressInfo);
      }

      // Step 7: Generate ZIP buffer
      console.log("Step 4: Menghasilkan ZIP buffer...");
      const zipBuffer = await zipService.buatZipBuffer();

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      console.log("=== Bulk Download Selesai ===");
      console.log(`Total waktu: ${totalTime}ms`);
      console.log(`File berhasil: ${filesAdded}/${applications.length}`);
      console.log(`Ukuran ZIP: ${this.formatFileSize(zipBuffer.length)}`);

      return {
        success: true,
        zipBuffer,
        progressInfo: {
          ...progressInfo,
          processed: filesAdded,
          status: "completed",
          currentFile: "Selesai",
        },
      };
    } catch (error) {
      console.error("Error dalam prosesSemuaFormulir:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Error tidak diketahui",
        progressInfo: {
          ...progressInfo,
          status: "error",
          errorMessage:
            error instanceof Error ? error.message : "Error tidak diketahui",
        },
      };
    }
  }

  /**
   * Proses bulk download dengan pagination untuk dataset besar
   * @param limit - Batasan jumlah aplikasi yang diproses
   * @returns Promise dengan hasil bulk download
   */
  async prosesFormulirDenganBatasan(
    limit: number
  ): Promise<BulkDownloadResult> {
    const startTime = Date.now();
    const progressInfo: ProgressInfo = {
      processed: 0,
      total: 0,
      currentFile: "",
      status: "processing",
    };

    try {
      console.log(`=== Memulai Bulk Download PDF (Max: ${limit}) ===`);

      // Ambil data dengan batasan
      const { applications, totalCount } =
        await ApplicationDataService.ambilAplikasiDenganPagination(0, limit);

      if (applications.length === 0) {
        return {
          success: false,
          error: "Tidak ada aplikasi ditemukan",
          progressInfo: {
            ...progressInfo,
            status: "error",
            errorMessage: "Tidak ada aplikasi ditemukan",
          },
        };
      }

      progressInfo.total = applications.length;
      console.log(
        `Memproses ${applications.length} dari ${totalCount} total aplikasi`
      );

      // Lanjutkan dengan proses yang sama seperti prosesSemuaFormulir
      if (this.cekTimeout(startTime)) {
        return this.hasilTimeout(progressInfo);
      }

      const pdfResults = await PdfGenerationService.buatBanyakPdf(
        applications,
        this.options.batchSize,
        this.options.maxRetries
      );

      progressInfo.processed = pdfResults.filter((r) => r.success).length;

      if (this.cekTimeout(startTime)) {
        return this.hasilTimeout(progressInfo);
      }

      const zipService = new ZipGenerationService(
        this.options.compressionLevel
      );
      const filesAdded = zipService.tambahkanBanyakPdfKeZip(pdfResults);

      if (filesAdded === 0) {
        return {
          success: false,
          error: "Tidak ada PDF yang valid untuk dimasukkan ke ZIP",
          progressInfo: {
            ...progressInfo,
            status: "error",
            errorMessage: "Tidak ada PDF yang valid",
          },
        };
      }

      if (this.cekTimeout(startTime)) {
        return this.hasilTimeout(progressInfo);
      }

      const zipBuffer = await zipService.buatZipBuffer();

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      console.log("=== Bulk Download Selesai ===");
      console.log(`Total waktu: ${totalTime}ms`);
      console.log(`File berhasil: ${filesAdded}/${applications.length}`);

      return {
        success: true,
        zipBuffer,
        progressInfo: {
          ...progressInfo,
          processed: filesAdded,
          status: "completed",
          currentFile: "Selesai",
        },
      };
    } catch (error) {
      console.error("Error dalam prosesFormulirDenganBatasan:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Error tidak diketahui",
        progressInfo: {
          ...progressInfo,
          status: "error",
          errorMessage:
            error instanceof Error ? error.message : "Error tidak diketahui",
        },
      };
    }
  }

  /**
   * Mendapatkan estimasi waktu untuk processing
   * @returns Promise dengan informasi estimasi
   */
  async dapatkanEstimasi(): Promise<{
    totalAplikasi: number;
    estimasiWaktu: number;
    batchCount: number;
    rekomendasiBatch: number;
  }> {
    try {
      const totalAplikasi = await ApplicationDataService.hitungTotalAplikasi();
      const batchCount = Math.ceil(totalAplikasi / this.options.batchSize);

      // Estimasi 200ms per PDF + 100ms overhead per batch
      const estimasiWaktu = totalAplikasi * 200 + batchCount * 100;

      // Rekomendasi batch size optimal untuk timeout 8 detik
      const rekomendasiBatch = Math.min(
        30,
        Math.max(5, Math.floor(this.options.timeout / 300))
      );

      return {
        totalAplikasi,
        estimasiWaktu,
        batchCount,
        rekomendasiBatch,
      };
    } catch (error) {
      console.error("Error dalam dapatkanEstimasi:", error);
      throw error;
    }
  }

  /**
   * Cek apakah sudah mendekati timeout
   * @param startTime - Waktu mulai proses
   * @returns Boolean apakah timeout
   */
  private cekTimeout(startTime: number): boolean {
    const elapsed = Date.now() - startTime;
    return elapsed > this.options.timeout;
  }

  /**
   * Menghasilkan hasil timeout
   * @param progressInfo - Info progress saat ini
   * @returns BulkDownloadResult untuk timeout
   */
  private hasilTimeout(progressInfo: ProgressInfo): BulkDownloadResult {
    console.warn("Proses dihentikan karena timeout");
    return {
      success: false,
      error:
        "Proses timeout - terlalu banyak data untuk diproses dalam satu request",
      progressInfo: {
        ...progressInfo,
        status: "error",
        errorMessage: "Timeout - gunakan batasan jumlah data",
      },
    };
  }

  /**
   * Format ukuran file
   * @param bytes - Ukuran dalam bytes
   * @returns String yang sudah diformat
   */
  private formatFileSize(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Byte";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }
}
