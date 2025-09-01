// Utility untuk menangani timeout dan error handling yang optimized untuk Vercel
export const VERCEL_TIMEOUT = 10000; // 10 seconds (Vercel Hobby has 10s limit)

export class VercelTimeoutError extends Error {
  constructor(message: string = "Request timeout (Vercel limit)") {
    super(message);
    this.name = "VercelTimeoutError";
  }
}

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = VERCEL_TIMEOUT
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new VercelTimeoutError()), timeoutMs)
    ),
  ]);
}

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = VERCEL_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new VercelTimeoutError();
    }
    throw error;
  }
}

// Rate limiting utility
export class RateLimiter {
  private calls: number[] = [];
  private readonly maxCalls: number;
  private readonly timeWindow: number;

  constructor(maxCalls: number, timeWindowMs: number) {
    this.maxCalls = maxCalls;
    this.timeWindow = timeWindowMs;
  }

  canMakeCall(): boolean {
    const now = Date.now();
    // Remove calls outside the time window
    this.calls = this.calls.filter(
      (callTime) => now - callTime < this.timeWindow
    );
    return this.calls.length < this.maxCalls;
  }

  makeCall(): boolean {
    if (this.canMakeCall()) {
      this.calls.push(Date.now());
      return true;
    }
    return false;
  }

  getNextCallTime(): number {
    if (this.calls.length < this.maxCalls) return 0;

    const oldestCall = Math.min(...this.calls);
    return oldestCall + this.timeWindow - Date.now();
  }
}

// Retry utility dengan exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Memory monitoring untuk Vercel
export function checkMemoryUsage(): {
  used: number;
  limit: number;
  percentage: number;
} {
  // Vercel Hobby limit is 1024MB
  const VERCEL_MEMORY_LIMIT = 1024 * 1024 * 1024; // 1GB in bytes

  if (typeof process !== "undefined" && process.memoryUsage) {
    const usage = process.memoryUsage();
    return {
      used: usage.heapUsed,
      limit: VERCEL_MEMORY_LIMIT,
      percentage: (usage.heapUsed / VERCEL_MEMORY_LIMIT) * 100,
    };
  }

  return { used: 0, limit: VERCEL_MEMORY_LIMIT, percentage: 0 };
}

// Cache utility untuk menghindari repeated queries
export class MemoryCache<T> {
  private cache = new Map<
    string,
    { data: T; timestamp: number; ttl: number }
  >();

  set(key: string, data: T, ttlMs: number = 300000): void {
    // Default 5 minutes
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}
