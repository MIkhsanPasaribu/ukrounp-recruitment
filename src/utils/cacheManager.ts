// Advanced cache management utilities
export class ClientCacheManager {
  private static readonly CACHE_PREFIX = "ukro-recruitment-";
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB

  // Memory cache for immediate access
  private static memoryCache = new Map<
    string,
    {
      data: unknown;
      timestamp: number;
      size: number;
      accessCount: number;
      lastAccess: number;
    }
  >();

  // Generate cache key
  static getCacheKey(type: string, params: Record<string, unknown>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, unknown>);

    return `${this.CACHE_PREFIX}${type}_${btoa(JSON.stringify(sortedParams))}`;
  }

  // Estimate data size in bytes
  static estimateSize(data: unknown): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return JSON.stringify(data).length * 2; // Rough estimate
    }
  }

  // Memory cache operations
  static setMemoryCache(
    key: string,
    data: unknown,
    ttl: number = this.DEFAULT_TTL
  ): boolean {
    try {
      const size = this.estimateSize(data);
      const now = Date.now();

      // Check if adding this item would exceed cache size limit
      const currentSize = Array.from(this.memoryCache.values()).reduce(
        (total, item) => total + item.size,
        0
      );

      if (currentSize + size > this.MAX_CACHE_SIZE) {
        this.cleanupMemoryCache();
      }

      this.memoryCache.set(key, {
        data,
        timestamp: now,
        size,
        accessCount: 1,
        lastAccess: now,
      });

      // Store TTL for future use if needed
      const cacheItem = this.memoryCache.get(key);
      if (cacheItem) {
        (cacheItem as { ttl?: number }).ttl = ttl;
      }

      return true;
    } catch (error) {
      console.error("Error setting memory cache:", error);
      return false;
    }
  }

  static getMemoryCache(key: string): unknown | null {
    const item = this.memoryCache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > this.DEFAULT_TTL) {
      this.memoryCache.delete(key);
      return null;
    }

    // Update access statistics
    item.accessCount++;
    item.lastAccess = now;

    return item.data;
  }

  // Cleanup old and least used items
  static cleanupMemoryCache(): void {
    const now = Date.now();
    const items = Array.from(this.memoryCache.entries());

    // Remove expired items first
    items.forEach(([key, item]) => {
      if (now - item.timestamp > this.DEFAULT_TTL) {
        this.memoryCache.delete(key);
      }
    });

    // If still over limit, remove least recently used items
    const currentSize = Array.from(this.memoryCache.values()).reduce(
      (total, item) => total + item.size,
      0
    );

    if (currentSize > this.MAX_CACHE_SIZE) {
      const sortedItems = Array.from(this.memoryCache.entries()).sort(
        ([, a], [, b]) => {
          // Sort by access frequency and recency
          const scoreA =
            a.accessCount / Math.max(1, (now - a.lastAccess) / 1000);
          const scoreB =
            b.accessCount / Math.max(1, (now - b.lastAccess) / 1000);
          return scoreA - scoreB;
        }
      );

      // Remove bottom 25% of items
      const itemsToRemove = Math.ceil(sortedItems.length * 0.25);
      for (let i = 0; i < itemsToRemove; i++) {
        this.memoryCache.delete(sortedItems[i][0]);
      }
    }
  }

  // Browser storage operations (localStorage with compression)
  static async setStorageCache(key: string, data: unknown): Promise<boolean> {
    if (typeof window === "undefined") return false;

    try {
      const serialized = JSON.stringify({
        data,
        timestamp: Date.now(),
        version: "1.0",
      });

      // Use compression if available
      if ("CompressionStream" in window) {
        const compressed = await this.compressData(serialized);
        localStorage.setItem(key, compressed);
      } else {
        localStorage.setItem(key, serialized);
      }

      return true;
    } catch (error) {
      console.error("Error setting storage cache:", error);
      // Clear some space and try again
      this.clearOldStorageCache();
      try {
        localStorage.setItem(
          key,
          JSON.stringify({ data, timestamp: Date.now() })
        );
        return true;
      } catch {
        return false;
      }
    }
  }

  static async getStorageCache(key: string): Promise<unknown | null> {
    if (typeof window === "undefined") return null;

    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      let parsed;
      try {
        // Try to decompress first
        const decompressed = await this.decompressData(cached);
        parsed = JSON.parse(decompressed);
      } catch {
        // Fallback to direct parsing
        parsed = JSON.parse(cached);
      }

      const now = Date.now();
      if (parsed.timestamp && now - parsed.timestamp > this.DEFAULT_TTL) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error("Error getting storage cache:", error);
      localStorage.removeItem(key);
      return null;
    }
  }

  // Data compression utilities
  static async compressData(data: string): Promise<string> {
    if (!("CompressionStream" in window)) {
      return data;
    }

    try {
      const stream = new CompressionStream("gzip");
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();

      writer.write(new TextEncoder().encode(data));
      writer.close();

      const chunks: Uint8Array[] = [];
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }

      const compressed = new Uint8Array(
        chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      );
      let offset = 0;
      for (const chunk of chunks) {
        compressed.set(chunk, offset);
        offset += chunk.length;
      }

      return btoa(String.fromCharCode(...compressed));
    } catch {
      return data;
    }
  }

  static async decompressData(compressedData: string): Promise<string> {
    if (!("DecompressionStream" in window)) {
      return compressedData;
    }

    try {
      const compressed = Uint8Array.from(atob(compressedData), (c) =>
        c.charCodeAt(0)
      );
      const stream = new DecompressionStream("gzip");
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();

      writer.write(compressed);
      writer.close();

      const chunks: Uint8Array[] = [];
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }

      const decompressed = new Uint8Array(
        chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      );
      let offset = 0;
      for (const chunk of chunks) {
        decompressed.set(chunk, offset);
        offset += chunk.length;
      }

      return new TextDecoder().decode(decompressed);
    } catch {
      return compressedData;
    }
  }

  // Clear old storage cache entries
  static clearOldStorageCache(): void {
    if (typeof window === "undefined") return;

    try {
      const keysToRemove: string[] = [];
      const now = Date.now();

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.CACHE_PREFIX)) {
          try {
            const cached = localStorage.getItem(key);
            if (cached) {
              const parsed = JSON.parse(cached);
              if (
                parsed.timestamp &&
                now - parsed.timestamp > this.DEFAULT_TTL
              ) {
                keysToRemove.push(key);
              }
            }
          } catch {
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error("Error clearing old storage cache:", error);
    }
  }

  // Unified cache operations
  static async get(
    type: string,
    params: Record<string, unknown>
  ): Promise<unknown | null> {
    const key = this.getCacheKey(type, params);

    // Try memory cache first
    const memoryResult = this.getMemoryCache(key);
    if (memoryResult !== null) {
      return memoryResult;
    }

    // Try storage cache
    const storageResult = await this.getStorageCache(key);
    if (storageResult !== null) {
      // Populate memory cache for faster access
      this.setMemoryCache(key, storageResult);
      return storageResult;
    }

    return null;
  }

  static async set(
    type: string,
    params: Record<string, unknown>,
    data: unknown
  ): Promise<boolean> {
    const key = this.getCacheKey(type, params);

    // Set in memory cache
    const memorySuccess = this.setMemoryCache(key, data);

    // Set in storage cache
    const storageSuccess = await this.setStorageCache(key, data);

    return memorySuccess || storageSuccess;
  }

  static invalidate(type: string, params?: Record<string, unknown>): void {
    if (params) {
      const key = this.getCacheKey(type, params);
      this.memoryCache.delete(key);
      if (typeof window !== "undefined") {
        localStorage.removeItem(key);
      }
    } else {
      // Invalidate all caches of this type
      const prefix = `${this.CACHE_PREFIX}${type}_`;

      // Clear memory cache
      Array.from(this.memoryCache.keys())
        .filter((key) => key.startsWith(prefix))
        .forEach((key) => this.memoryCache.delete(key));

      // Clear storage cache
      if (typeof window !== "undefined") {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(prefix)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));
      }
    }
  }

  static clearAll(): void {
    this.memoryCache.clear();
    if (typeof window !== "undefined") {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.CACHE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    }
  }

  static getStats(): {
    memoryCache: {
      size: number;
      itemCount: number;
      totalSize: number;
    };
    storageCache: {
      itemCount: number;
      estimatedSize: number;
    };
  } {
    const memoryItems = Array.from(this.memoryCache.values());
    const memoryStats = {
      size: memoryItems.length,
      itemCount: memoryItems.length,
      totalSize: memoryItems.reduce((total, item) => total + item.size, 0),
    };

    let storageStats = { itemCount: 0, estimatedSize: 0 };
    if (typeof window !== "undefined") {
      let itemCount = 0;
      let estimatedSize = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.CACHE_PREFIX)) {
          itemCount++;
          const value = localStorage.getItem(key);
          if (value) {
            estimatedSize += value.length * 2; // Rough estimate
          }
        }
      }

      storageStats = { itemCount, estimatedSize };
    }

    return { memoryCache: memoryStats, storageCache: storageStats };
  }
}
