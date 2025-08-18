"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface FileViewerState {
  isLoading: boolean;
  error: string | null;
  fileUrl: string | null;
  fileType: string | null;
  fileSize: number | null;
  progress: number;
}

interface UseFileViewerProps {
  applicationId: string;
  fieldName: string;
  autoLoad?: boolean;
}

export function useFileViewer({
  applicationId,
  fieldName,
  autoLoad = false,
}: UseFileViewerProps) {
  const [state, setState] = useState<FileViewerState>({
    isLoading: false,
    error: null,
    fileUrl: null,
    fileType: null,
    fileSize: null,
    progress: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const fileUrlRef = useRef<string | null>(null);

  // Progressive file loading with streaming
  const loadFile = useCallback(
    async (options?: { forceReload?: boolean }) => {
      if (state.isLoading) return;

      // Use cached URL if available and not forcing reload
      if (fileUrlRef.current && !options?.forceReload) {
        setState((prev) => ({
          ...prev,
          fileUrl: fileUrlRef.current,
        }));
        return;
      }

      try {
        // Cancel previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        setState((prev) => ({
          ...prev,
          isLoading: true,
          error: null,
          progress: 0,
        }));

        // Check if API endpoint exists, if not create it
        const response = await fetch(
          `/api/admin/files/${applicationId}/${fieldName}`,
          {
            signal: abortControllerRef.current.signal,
            headers: {
              Accept: "application/json, image/*, application/pdf",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("File tidak ditemukan");
          }
          throw new Error(`Gagal memuat file: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        const contentLength = response.headers.get("content-length");

        setState((prev) => ({
          ...prev,
          fileType: contentType,
          fileSize: contentLength ? parseInt(contentLength) : null,
        }));

        // For JSON response (base64 data from database)
        if (contentType?.includes("application/json")) {
          const data = await response.json();
          if (data.file && data.file.startsWith("data:")) {
            const fileUrl = data.file;
            fileUrlRef.current = fileUrl;
            setState((prev) => ({
              ...prev,
              isLoading: false,
              fileUrl,
              progress: 100,
            }));
            return;
          }
        }

        // For direct file streaming
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Stream tidak tersedia");
        }

        const chunks: Uint8Array[] = [];
        let receivedLength = 0;
        const totalLength = contentLength ? parseInt(contentLength) : 0;

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          chunks.push(value);
          receivedLength += value.length;

          // Update progress
          if (totalLength > 0) {
            const progress = Math.round((receivedLength / totalLength) * 100);
            setState((prev) => ({ ...prev, progress }));
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
        fileUrlRef.current = fileUrl;

        setState((prev) => ({
          ...prev,
          isLoading: false,
          fileUrl,
          progress: 100,
        }));
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return; // Request was cancelled
        }

        const errorMessage =
          error instanceof Error ? error.message : "Gagal memuat file";

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          progress: 0,
        }));
      }
    },
    [applicationId, fieldName, state.isLoading]
  );

  // Download file
  const downloadFile = useCallback(
    async (filename?: string) => {
      if (!state.fileUrl) {
        await loadFile();
        return;
      }

      try {
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = state.fileUrl;
        a.download =
          filename || `${fieldName}.${getFileExtension(state.fileType)}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (error) {
        console.error("Error downloading file:", error);
      }
    },
    [state.fileUrl, state.fileType, fieldName, loadFile]
  );

  // Cleanup file URL
  const cleanup = useCallback(() => {
    if (fileUrlRef.current && fileUrlRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(fileUrlRef.current);
      fileUrlRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      loadFile();
    }

    return cleanup;
  }, [autoLoad, loadFile, cleanup]);

  // Retry loading
  const retry = useCallback(() => {
    loadFile({ forceReload: true });
  }, [loadFile]);

  return {
    ...state,
    loadFile,
    downloadFile,
    cleanup,
    retry,
  };
}

// Helper function to get file extension from MIME type
function getFileExtension(mimeType: string | null): string {
  if (!mimeType) return "bin";

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

export type UseFileViewerReturn = ReturnType<typeof useFileViewer>;
