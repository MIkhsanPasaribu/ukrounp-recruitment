/**
 * Service untuk mengelola operasi file dalam aplikasi admin
 * Mendukung streaming, caching, dan progressive loading
 */

export interface FileMetadata {
  id: string;
  fieldName: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
  uploadedAt?: string;
  isBase64?: boolean;
}

export interface FileResponse {
  success: boolean;
  file?: string; // Base64 data URL atau blob URL
  metadata?: FileMetadata;
  error?: string;
}

export interface StreamingFileOptions {
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

class FileService {
  private cache = new Map<string, string>();
  private loadingPromises = new Map<string, Promise<FileResponse>>();

  /**
   * Mengambil file dari database atau cache
   */
  async getFile(
    applicationId: string,
    fieldName: string,
    options: StreamingFileOptions = {}
  ): Promise<FileResponse> {
    const cacheKey = `${applicationId}-${fieldName}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return {
        success: true,
        file: this.cache.get(cacheKey),
      };
    }

    // Check if already loading
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    // Start loading
    const loadingPromise = this.loadFileFromServer(
      applicationId,
      fieldName,
      options
    );

    this.loadingPromises.set(cacheKey, loadingPromise);

    try {
      const result = await loadingPromise;

      // Cache successful result
      if (result.success && result.file) {
        this.cache.set(cacheKey, result.file);
      }

      return result;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  /**
   * Load file dari server dengan support streaming
   */
  private async loadFileFromServer(
    applicationId: string,
    fieldName: string,
    options: StreamingFileOptions = {}
  ): Promise<FileResponse> {
    try {
      const response = await fetch(
        `/api/admin/files/${applicationId}/${fieldName}`,
        {
          signal: options.signal,
          headers: {
            Accept: "application/json, image/*, application/pdf",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            error: "File tidak ditemukan",
          };
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");

      // Handle JSON response (base64 from database)
      if (contentType?.includes("application/json")) {
        const data = await response.json();
        return {
          success: true,
          file: data.file,
          metadata: data.metadata,
        };
      }

      // Handle binary file streaming
      return this.handleBinaryStream(response, options);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal memuat file";

      options.onError?.(
        error instanceof Error ? error : new Error(errorMessage)
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Handle binary file streaming dengan progress tracking
   */
  private async handleBinaryStream(
    response: Response,
    options: StreamingFileOptions
  ): Promise<FileResponse> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Stream tidak tersedia");
    }

    const contentLength = response.headers.get("content-length");
    const totalLength = contentLength ? parseInt(contentLength) : 0;
    const contentType = response.headers.get("content-type");

    const chunks: Uint8Array[] = [];
    let receivedLength = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        // Update progress
        if (totalLength > 0 && options.onProgress) {
          const progress = Math.round((receivedLength / totalLength) * 100);
          options.onProgress(progress);
        }
      }

      // Combine chunks and create blob URL
      const allChunks = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
      }

      const blob = new Blob([allChunks], { type: contentType || undefined });
      const fileUrl = URL.createObjectURL(blob);

      options.onComplete?.();

      return {
        success: true,
        file: fileUrl,
        metadata: {
          id: "",
          fieldName: "",
          mimeType: contentType || undefined,
          size: receivedLength,
        },
      };
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Download file ke device user
   */
  async downloadFile(
    applicationId: string,
    fieldName: string,
    filename?: string
  ): Promise<boolean> {
    try {
      const result = await this.getFile(applicationId, fieldName);

      if (!result.success || !result.file) {
        throw new Error(result.error || "File tidak tersedia");
      }

      const a = document.createElement("a");
      a.style.display = "none";
      a.href = result.file;
      a.download =
        filename || `${fieldName}.${this.getFileExtensionFromUrl(result.file)}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      return true;
    } catch (error) {
      console.error("Error downloading file:", error);
      return false;
    }
  }

  /**
   * Preload multiple files untuk optimasi performa
   */
  async preloadFiles(
    applicationId: string,
    fieldNames: string[]
  ): Promise<Map<string, FileResponse>> {
    const results = new Map<string, FileResponse>();

    const promises = fieldNames.map(async (fieldName) => {
      try {
        const result = await this.getFile(applicationId, fieldName);
        results.set(fieldName, result);
      } catch (error) {
        results.set(fieldName, {
          success: false,
          error: error instanceof Error ? error.message : "Gagal memuat file",
        });
      }
    });

    await Promise.allSettled(promises);
    return results;
  }

  /**
   * Clear cache untuk aplikasi tertentu atau semua
   */
  clearCache(applicationId?: string): void {
    if (applicationId) {
      // Clear cache for specific application
      for (const [key, url] of this.cache.entries()) {
        if (key.startsWith(applicationId)) {
          if (url.startsWith("blob:")) {
            URL.revokeObjectURL(url);
          }
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      for (const [, url] of this.cache.entries()) {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      }
      this.cache.clear();
    }
  }

  /**
   * Get file extension from URL atau MIME type
   */
  private getFileExtensionFromUrl(url: string): string {
    if (url.startsWith("data:")) {
      const mimeMatch = url.match(/data:([^;]+)/);
      if (mimeMatch) {
        return this.getExtensionFromMimeType(mimeMatch[1]);
      }
    }
    return "bin";
  }

  private getExtensionFromMimeType(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/gif": "gif",
      "image/webp": "webp",
      "application/pdf": "pdf",
      "image/svg+xml": "svg",
    };

    return mimeToExt[mimeType] || "bin";
  }

  /**
   * Check if file exists and is accessible
   */
  async checkFileExists(
    applicationId: string,
    fieldName: string
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `/api/admin/files/${applicationId}/${fieldName}`,
        {
          method: "HEAD",
        }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get file size without downloading
   */
  async getFileSize(
    applicationId: string,
    fieldName: string
  ): Promise<number | null> {
    try {
      const response = await fetch(
        `/api/admin/files/${applicationId}/${fieldName}`,
        {
          method: "HEAD",
        }
      );

      if (!response.ok) return null;

      const contentLength = response.headers.get("content-length");
      return contentLength ? parseInt(contentLength) : null;
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const fileService = new FileService();

// Export field names untuk file upload
export const FILE_UPLOAD_FIELDS = [
  "photo",
  "studentCard",
  "studyPlanCard",
  "mbtiProof",
  "igFollowProof",
  "tiktokFollowProof",
] as const;

export type FileUploadField = (typeof FILE_UPLOAD_FIELDS)[number];
