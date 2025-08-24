/**
 * Tipe data untuk bulk download service
 */

export interface BulkDownloadOptions {
  batchSize?: number;
  compressionLevel?: number;
  timeout?: number;
  maxRetries?: number;
}

export interface ProgressInfo {
  processed: number;
  total: number;
  currentFile: string;
  status: "processing" | "completed" | "error";
  errorMessage?: string;
}

export interface BulkDownloadResult {
  success: boolean;
  zipBuffer?: Buffer;
  error?: string;
  progressInfo: ProgressInfo;
}

export interface PdfGenerationResult {
  success: boolean;
  fileName: string;
  buffer?: Buffer;
  error?: string;
}
