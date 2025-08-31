/**
 * Bulk Download Service Module
 *
 * Modul ini menyediakan layanan untuk bulk download PDF secara efisien
 * dengan fitur-fitur:
 * - Batch processing untuk menghindari timeout
 * - Memory management yang optimal
 * - Error handling dan retry mechanism
 * - Progress tracking
 * - Timeout management khusus untuk Vercel
 */

// Export semua service dan types
export { BulkDownloadService } from "./index";
export { ApplicationDataService } from "./applicationDataService";
export { PdfGenerationService } from "./pdfGenerationService";
export { ZipGenerationService } from "./zipGenerationService";

// Export types
export type {
  BulkDownloadOptions,
  BulkDownloadResult,
  ProgressInfo,
  PdfGenerationResult,
} from "./types";

// Export utility functions
export const BulkDownloadUtils = {
  /**
   * Menghitung estimasi waktu berdasarkan jumlah aplikasi
   */
  estimasiWaktu: (jumlahAplikasi: number, batchSize: number = 10): number => {
    const waktuPerPdf = 200; // ms
    const overheadPerBatch = 100; // ms
    const jumlahBatch = Math.ceil(jumlahAplikasi / batchSize);
    return jumlahAplikasi * waktuPerPdf + jumlahBatch * overheadPerBatch;
  },

  /**
   * Menyarankan batch size optimal berdasarkan timeout
   */
  saranBatchSize: (timeoutMs: number = 8000): number => {
    const waktuPerPdf = 200;
    const targetWaktu = timeoutMs * 0.8; // 80% dari timeout
    const maxBatchSize = Math.floor(targetWaktu / waktuPerPdf);
    return Math.min(30, Math.max(5, maxBatchSize));
  },

  /**
   * Format ukuran file untuk display
   */
  formatUkuranFile: (bytes: number): string => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Byte";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  },

  /**
   * Validasi parameter query untuk API
   */
  validasiParameterQuery: (searchParams: URLSearchParams) => {
    const limit = searchParams.get("limit");
    const batchSize = searchParams.get("batchSize");

    const validatedLimit = limit
      ? Math.min(100, Math.max(1, parseInt(limit)))
      : undefined;
    const validatedBatchSize = batchSize
      ? Math.min(50, Math.max(1, parseInt(batchSize)))
      : 10;

    return {
      limit: validatedLimit,
      batchSize: validatedBatchSize,
      isValid: true,
    };
  },
};

// Konstanta konfigurasi default
export const BULK_DOWNLOAD_CONSTANTS = {
  DEFAULT_BATCH_SIZE: 10,
  DEFAULT_COMPRESSION_LEVEL: 6,
  DEFAULT_TIMEOUT_MS: 8000,
  DEFAULT_MAX_RETRIES: 2,
  MAX_LIMIT: 100,
  MIN_BATCH_SIZE: 1,
  MAX_BATCH_SIZE: 50,
  ESTIMATED_TIME_PER_PDF_MS: 200,
  OVERHEAD_PER_BATCH_MS: 100,
} as const;
