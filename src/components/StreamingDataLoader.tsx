"use client";

import { useState, useEffect, useCallback } from "react";

interface StreamingDataLoaderProps {
  endpoint: string;
  onData: (data: unknown) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
  onMetadata?: (metadata: { total: number }) => void;
  enabled?: boolean;
  autoStart?: boolean;
}

interface StreamMessage {
  type: "metadata" | "data" | "complete" | "error";
  payload?: unknown;
  total?: number;
  message?: string;
}

export function useStreamingData({
  endpoint,
  onData,
  onComplete,
  onError,
  onMetadata,
  enabled = true,
  autoStart = true,
}: StreamingDataLoaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const startStreaming = useCallback(async () => {
    if (!enabled || isLoading) return;

    setIsLoading(true);
    setIsConnected(false);
    setError(null);
    setProgress({ current: 0, total: 0 });

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      setIsConnected(true);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6)) as StreamMessage;

              switch (data.type) {
                case "metadata":
                  if (data.total !== undefined && onMetadata) {
                    onMetadata({ total: data.total });
                    setProgress((prev) => ({ ...prev, total: data.total! }));
                  }
                  break;

                case "data":
                  if (data.payload) {
                    onData(data.payload);
                    setProgress((prev) => ({
                      ...prev,
                      current:
                        prev.current +
                        (Array.isArray(data.payload) ? data.payload.length : 1),
                    }));
                  }
                  break;

                case "complete":
                  setIsConnected(false);
                  setIsLoading(false);
                  if (onComplete) onComplete();
                  return;

                case "error":
                  throw new Error(data.message || "Streaming error");
              }
            } catch (parseError) {
              console.error("Error parsing SSE data:", parseError);
            }
          }
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown streaming error";
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsConnected(false);
    }
  }, [endpoint, enabled, isLoading, onData, onComplete, onError, onMetadata]);

  const stopStreaming = useCallback(() => {
    setIsLoading(false);
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (autoStart && enabled) {
      startStreaming();
    }
  }, [autoStart, enabled, startStreaming]);

  return {
    isLoading,
    isConnected,
    error,
    progress,
    startStreaming,
    stopStreaming,
  };
}

// React component wrapper
export function StreamingDataLoader(
  props: StreamingDataLoaderProps & {
    children?: (state: ReturnType<typeof useStreamingData>) => React.ReactNode;
  }
) {
  const { children, ...streamingProps } = props;
  const streamingState = useStreamingData(streamingProps);

  if (children) {
    return <>{children(streamingState)}</>;
  }

  return null;
}

// Progress indicator component
export function StreamingProgress({
  current,
  total,
  isLoading,
  isConnected,
}: {
  current: number;
  total: number;
  isLoading: boolean;
  isConnected: boolean;
}) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  if (!isLoading && !isConnected) return null;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
      <div
        className={`h-2 rounded-full transition-all duration-300 ${
          isConnected ? "bg-blue-600" : "bg-gray-400"
        }`}
        style={{ width: `${percentage}%` }}
      />
      <div className="text-sm text-gray-600 mt-1">
        {isConnected
          ? total > 0
            ? `Loading... ${current}/${total} (${percentage}%)`
            : `Loading... ${current} items`
          : "Connecting..."}
      </div>
    </div>
  );
}
