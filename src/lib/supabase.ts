import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// Konfigurasi Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Enhanced client dengan connection pooling dan optimizations
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: "public",
  },
  global: {
    headers: {
      "x-connection-timeout": "30",
      "x-statement-timeout": "25",
      "x-application-name": "ukro-recruitment-admin",
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Optimized Database Class dengan caching
export class OptimizedDatabase {
  private static cache = new Map<
    string,
    { data: unknown; timestamp: number }
  >();
  private static CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static MAX_CACHE_SIZE = 100; // Maximum cache entries

  // Clear old cache entries to prevent memory leaks
  private static cleanCache() {
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const now = Date.now();
      for (const [key, value] of this.cache.entries()) {
        if (now - value.timestamp > this.CACHE_TTL) {
          this.cache.delete(key);
        }
      }
    }
  }

  // Get applications with intelligent caching
  static async getApplicationsOptimized(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    forceRefresh?: boolean;
    cursor?: string;
    useCache?: boolean;
  }) {
    const {
      page = 1,
      limit = 50,
      search = "",
      status = "",
      forceRefresh = false,
      cursor = "",
      useCache = true,
    } = params;

    // Create cache key
    const cacheKey = `apps_${page}_${limit}_${search}_${status}_${cursor}`;

    // Check cache first (only for non-cursor based requests)
    if (useCache && !forceRefresh && !cursor) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data;
      }
    }

    this.cleanCache();

    try {
      let query = supabase.from("applicants").select(
        `
          id,
          email,
          fullName,
          nim,
          faculty,
          department,
          studyProgram,
          educationLevel,
          status,
          submittedAt,
          phoneNumber,
          nickname,
          gender,
          birthDate,
          nia,
          previousSchool,
          padangAddress,
          corelDraw,
          photoshop,
          adobePremierePro,
          adobeAfterEffect,
          autodeskEagle,
          arduinoIde,
          androidStudio,
          visualStudio,
          missionPlaner,
          autodeskInventor,
          autodeskAutocad,
          solidworks,
          otherSoftware
        `,
        { count: cursor ? undefined : "exact" }
      );

      // Cursor-based pagination (more efficient than offset)
      if (cursor) {
        query = query.lt("submittedAt", cursor);
      } else if (page > 1) {
        // Fallback to offset for page-based navigation
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);
      } else {
        query = query.limit(limit);
      }

      // Optimize search with proper indexing
      if (search.trim()) {
        const searchTerm = search.trim().toLowerCase();
        query = query.or(
          `fullName.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,nim.ilike.%${searchTerm}%`
        );
      }

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      // Order by submittedAt for consistent results
      query = query.order("submittedAt", { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error("Database query error:", error);
        throw error;
      }

      const hasMore = cursor
        ? data?.length === limit
        : page * limit < (count || 0);
      const nextCursor =
        hasMore && data && data.length > 0
          ? data[data.length - 1]?.submittedAt
          : null;

      const result = {
        applications: data || [],
        pagination: cursor
          ? undefined
          : {
              page,
              limit,
              total: count || 0,
              totalPages: Math.ceil((count || 0) / limit),
              hasNext: page * limit < (count || 0),
              hasPrev: page > 1,
            },
        cursor: {
          hasMore,
          nextCursor,
        },
      };

      // Cache the result (only for non-cursor based requests to avoid cache bloat)
      if (useCache && !cursor) {
        this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      }

      return result;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }

  // Get single application by ID (with caching)
  static async getApplicationById(id: string, forceRefresh = false) {
    const cacheKey = `app_detail_${id}`;

    if (!forceRefresh) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data;
      }
    }

    try {
      const { data, error } = await supabase
        .from("applicants")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Transform data
      const transformedData = {
        ...data,
        software: {
          corelDraw: Boolean(data.corelDraw),
          photoshop: Boolean(data.photoshop),
          adobePremierePro: Boolean(data.adobePremierePro),
          adobeAfterEffect: Boolean(data.adobeAfterEffect),
          autodeskEagle: Boolean(data.autodeskEagle),
          arduinoIde: Boolean(data.arduinoIde),
          androidStudio: Boolean(data.androidStudio),
          visualStudio: Boolean(data.visualStudio),
          missionPlaner: Boolean(data.missionPlaner),
          autodeskInventor: Boolean(data.autodeskInventor),
          autodeskAutocad: Boolean(data.autodeskAutocad),
          solidworks: Boolean(data.solidworks),
          others: data.otherSoftware || "",
        },
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: transformedData,
        timestamp: Date.now(),
      });

      return transformedData;
    } catch (error) {
      console.error("Error fetching application by ID:", error);
      throw error;
    }
  }

  // Clear cache (useful for testing or when data is updated)
  static clearCache(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Get cache stats (for monitoring)
  static getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: this.cache.size * 1024, // Rough estimate
    };
  }
}

export { supabase };
