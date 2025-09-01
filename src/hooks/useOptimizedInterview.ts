// Komponen untuk virtual scrolling dan lazy loading yang optimized untuk Vercel
import { useState, useEffect, useMemo, useCallback } from "react";

interface UseVirtualScrollProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
}

export function useVirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
}: UseVirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const visibleStartIndex = Math.floor(scrollTop / itemHeight);
    const visibleEndIndex = Math.min(
      visibleStartIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length - 1
    );

    return items
      .slice(visibleStartIndex, visibleEndIndex + 1)
      .map((item, index) => ({
        ...item,
        index: visibleStartIndex + index,
      }));
  }, [items, itemHeight, containerHeight, scrollTop]);

  const totalHeight = items.length * itemHeight;
  const offsetY = Math.floor(scrollTop / itemHeight) * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
  };
}

// Debounce hook untuk search
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Cache hook untuk menyimpan hasil query
export function useQueryCache<T>() {
  const [cache, setCache] = useState<Map<string, T>>(new Map());

  const getCachedData = useCallback(
    (cacheKey: string) => {
      return cache.get(cacheKey);
    },
    [cache]
  );

  const setCachedData = useCallback((cacheKey: string, data: T) => {
    setCache((prev) => new Map(prev).set(cacheKey, data));
  }, []);

  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  return {
    getCachedData,
    setCachedData,
    clearCache,
  };
}
