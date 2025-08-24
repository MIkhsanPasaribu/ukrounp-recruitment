import JSZip from "jszip";
import { PdfGenerationResult } from "./types";

/**
 * Service untuk membuat dan mengelola file ZIP secara efisien
 */
export class ZipGenerationService {
  private zip: JSZip;
  private compressionLevel: number;

  constructor(compressionLevel: number = 6) {
    this.zip = new JSZip();
    this.compressionLevel = Math.max(1, Math.min(9, compressionLevel));
  }

  /**
   * Menambahkan file PDF ke ZIP
   * @param pdfResult - Hasil generasi PDF
   * @returns Boolean success
   */
  tambahkanPdfKeZip(pdfResult: PdfGenerationResult): boolean {
    try {
      if (!pdfResult.success || !pdfResult.buffer) {
        console.warn(`Melewati file ${pdfResult.fileName}: ${pdfResult.error}`);
        return false;
      }

      // Validasi buffer PDF
      if (!this.validasiPdfBuffer(pdfResult.buffer)) {
        console.warn(`Buffer PDF tidak valid untuk ${pdfResult.fileName}`);
        return false;
      }

      // Tambahkan ke ZIP
      this.zip.file(pdfResult.fileName, pdfResult.buffer);
      console.log(`Berhasil menambahkan ${pdfResult.fileName} ke ZIP`);
      return true;
    } catch (error) {
      console.error(`Error menambahkan ${pdfResult.fileName} ke ZIP:`, error);
      return false;
    }
  }

  /**
   * Menambahkan banyak PDF ke ZIP secara batch
   * @param pdfResults - Array hasil generasi PDF
   * @returns Jumlah file yang berhasil ditambahkan
   */
  tambahkanBanyakPdfKeZip(pdfResults: PdfGenerationResult[]): number {
    let successCount = 0;

    console.log(`Menambahkan ${pdfResults.length} PDF ke ZIP...`);

    for (const pdfResult of pdfResults) {
      if (this.tambahkanPdfKeZip(pdfResult)) {
        successCount++;
      }
    }

    console.log(
      `Berhasil menambahkan ${successCount}/${pdfResults.length} PDF ke ZIP`
    );
    return successCount;
  }

  /**
   * Menghasilkan ZIP buffer secara efisien
   * @returns Promise Buffer ZIP
   */
  async buatZipBuffer(): Promise<Buffer> {
    try {
      console.log("Memulai pembuatan ZIP buffer...");

      const zipBlob = await this.zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: this.compressionLevel,
        },
        streamFiles: true, // Streaming untuk efisiensi memory
      });

      const zipBuffer = Buffer.from(await zipBlob.arrayBuffer());

      console.log(
        `ZIP berhasil dibuat dengan ukuran: ${this.formatFileSize(
          zipBuffer.length
        )}`
      );
      return zipBuffer;
    } catch (error) {
      console.error("Error membuat ZIP buffer:", error);
      throw new Error(
        `Gagal membuat ZIP: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Menghasilkan ZIP dengan streaming untuk file besar
   * @returns Promise NodeJS Stream untuk ZIP
   */
  async buatZipStream(): Promise<NodeJS.ReadableStream> {
    try {
      console.log("Memulai pembuatan ZIP stream...");

      const zipNodeStream = this.zip.generateNodeStream({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: {
          level: this.compressionLevel,
        },
        streamFiles: true,
      });

      return zipNodeStream;
    } catch (error) {
      console.error("Error membuat ZIP stream:", error);
      throw new Error(
        `Gagal membuat ZIP stream: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Mendapatkan informasi ZIP
   * @returns Object dengan informasi ZIP
   */
  dapatkanInfoZip(): { jumlahFile: number; daftarFile: string[] } {
    const files = Object.keys(this.zip.files);
    return {
      jumlahFile: files.length,
      daftarFile: files,
    };
  }

  /**
   * Membersihkan ZIP instance
   */
  bersihkan(): void {
    this.zip = new JSZip();
  }

  /**
   * Validasi buffer PDF
   * @param buffer - Buffer yang akan divalidasi
   * @returns Boolean valid
   */
  private validasiPdfBuffer(buffer: Buffer): boolean {
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

    // Cek maksimal size (50MB per file)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (buffer.length > maxSize) {
      console.warn(
        `File PDF terlalu besar: ${this.formatFileSize(buffer.length)}`
      );
      return false;
    }

    return true;
  }

  /**
   * Format ukuran file menjadi string yang mudah dibaca
   * @param bytes - Ukuran dalam bytes
   * @returns String formatted
   */
  private formatFileSize(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Byte";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }

  /**
   * Membuat nama file ZIP dengan timestamp
   * @param prefix - Prefix nama file
   * @returns String nama file
   */
  static buatNamaFileZip(prefix: string = "formulir-pendaftaran"): string {
    const tanggal = new Date().toISOString().split("T")[0];
    const waktu = new Date().toTimeString().split(" ")[0].replace(/:/g, "-");
    return `${prefix}-${tanggal}-${waktu}.zip`;
  }

  /**
   * Validasi apakah ZIP bisa dibuat
   * @returns Boolean bisa dibuat
   */
  bisaDibuatZip(): boolean {
    const info = this.dapatkanInfoZip();

    if (info.jumlahFile === 0) {
      console.warn("Tidak ada file dalam ZIP");
      return false;
    }

    console.log(`ZIP siap dibuat dengan ${info.jumlahFile} file`);
    return true;
  }
}
