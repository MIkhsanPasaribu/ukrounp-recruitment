import { NextRequest, NextResponse } from "next/server";
import { OptimizedDatabase } from "@/lib/supabase";
import { withAuth } from "@/lib/auth-middleware";

// Streaming response handler
async function createStreamingResponse(
  dataGenerator: AsyncGenerator<unknown, void, unknown>,
  total?: number
) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial metadata if total is available
        if (total !== undefined) {
          const metadata = { type: "metadata", total };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(metadata)}\n\n`)
          );
        }

        // Stream data chunks
        for await (const chunk of dataGenerator) {
          const data = { type: "data", payload: chunk };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        }

        // Send completion signal
        const completion = { type: "complete" };
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(completion)}\n\n`)
        );
        controller.close();
      } catch (error) {
        const errorMsg = {
          type: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        };
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(errorMsg)}\n\n`)
        );
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// Batch processing generator
async function* processApplicationsBatch(params: {
  page: number;
  limit: number;
  search: string;
  status: string;
  batchSize?: number;
  useStreaming?: boolean;
  lightweight?: boolean;
  applicationId?: string;
}): AsyncGenerator<unknown, void, unknown> {
  const {
    page,
    limit,
    search,
    status,
    batchSize = 25,
    useStreaming = false,
    lightweight = false,
    applicationId,
  } = params;

  // Handle single application by ID
  if (applicationId) {
    const application = await OptimizedDatabase.getApplicationById(
      applicationId
    );
    if (application) {
      yield [application];
    }
    return;
  }

  if (useStreaming) {
    // Use cursor-based pagination for streaming
    let cursor: string | null = null;
    let hasMore = true;
    let processedCount = 0;

    while (hasMore && processedCount < limit) {
      const remainingItems = limit - processedCount;
      const currentBatchSize = Math.min(batchSize, remainingItems);

      const result = await OptimizedDatabase.getApplicationsOptimized({
        limit: currentBatchSize,
        search,
        status,
        cursor: cursor || undefined,
        useCache: false, // Don't cache streaming requests
      });

      if (
        !result ||
        typeof result !== "object" ||
        !("applications" in result) ||
        !Array.isArray(result.applications) ||
        result.applications.length === 0
      ) {
        break;
      }

      // Transform applications for client
      const transformedApps = result.applications.map((app) =>
        transformApplication(app, lightweight)
      );

      yield transformedApps;

      processedCount += result.applications.length;
      hasMore =
        "cursor" in result &&
        result.cursor &&
        typeof result.cursor === "object" &&
        "hasMore" in result.cursor
          ? Boolean(result.cursor.hasMore)
          : false;
      cursor =
        "cursor" in result &&
        result.cursor &&
        typeof result.cursor === "object" &&
        "nextCursor" in result.cursor
          ? (result.cursor.nextCursor as string)
          : null;
    }
  } else {
    // Use standard pagination
    const result = await OptimizedDatabase.getApplicationsOptimized({
      page,
      limit,
      search,
      status,
    });

    if (
      result &&
      typeof result === "object" &&
      "applications" in result &&
      Array.isArray(result.applications) &&
      result.applications.length > 0
    ) {
      // Transform applications for client
      const transformedApps = result.applications.map((app) =>
        transformApplication(app, lightweight)
      );

      yield {
        applications: transformedApps,
        pagination: "pagination" in result ? result.pagination : undefined,
      };
    }
  }
}

// Transform application data based on mode
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformApplication(app: any, lightweight = false) {
  const baseData = {
    id: app.id,
    email: app.email,
    fullName: app.fullName,
    nim: app.nim,
    faculty: app.faculty,
    department: app.department,
    studyProgram: app.studyProgram,
    educationLevel: app.educationLevel,
    status: app.status,
    submittedAt: app.submittedAt,
    phoneNumber: app.phoneNumber,
  };

  // Mode lightweight: hanya return base data
  if (lightweight) {
    return baseData;
  }

  // Mode list atau detail: tambahkan field lainnya
  const extendedData = {
    ...baseData,
    nickname: app.nickname,
    gender: app.gender,
    birthDate: app.birthDate,
    nia: app.nia,
    previousSchool: app.previousSchool,
    padangAddress: app.padangAddress,
    motivation: app.motivation,
    futurePlans: app.futurePlans,
    whyYouShouldBeAccepted: app.whyYouShouldBeAccepted,
    software: app.software || {
      corelDraw: Boolean(app.corelDraw),
      photoshop: Boolean(app.photoshop),
      adobePremierePro: Boolean(app.adobePremierePro),
      adobeAfterEffect: Boolean(app.adobeAfterEffect),
      autodeskEagle: Boolean(app.autodeskEagle),
      arduinoIde: Boolean(app.arduinoIde),
      androidStudio: Boolean(app.androidStudio),
      visualStudio: Boolean(app.visualStudio),
      missionPlaner: Boolean(app.missionPlaner),
      autodeskInventor: Boolean(app.autodeskInventor),
      autodeskAutocad: Boolean(app.autodeskAutocad),
      solidworks: Boolean(app.solidworks),
      others: app.otherSoftware || "",
    },
  };

  return extendedData;
}

async function getApplications(request: NextRequest) {
  try {
    // Cek query parameters
    const url = new URL(request.url);
    const applicationId = url.searchParams.get("id");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "50"),
      100
    ); // Cap at 100
    const lightweight = url.searchParams.get("lightweight") === "true";
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const forceRefresh = url.searchParams.get("refresh") === "true";
    const useStreaming = url.searchParams.get("stream") === "true";

    // Clear cache if force refresh is requested
    if (forceRefresh) {
      OptimizedDatabase.clearCache();
    }

    // Handle streaming requests
    if (useStreaming && !applicationId) {
      const dataGenerator = processApplicationsBatch({
        page,
        limit,
        search,
        status,
        useStreaming: true,
        lightweight,
      });

      const streamingResponse = await createStreamingResponse(dataGenerator);
      return streamingResponse;
    }

    // Handle standard requests (pagination or single item)
    const dataGenerator = processApplicationsBatch({
      page,
      limit,
      search,
      status,
      useStreaming: false,
      lightweight,
      applicationId: applicationId || undefined,
    });

    // Get the single result for standard pagination
    const result = (await dataGenerator.next()).value;

    if (!result) {
      return NextResponse.json({
        applications: [],
        pagination: applicationId
          ? undefined
          : {
              page,
              limit,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
            },
      });
    }

    // Handle single application response
    if (applicationId && Array.isArray(result)) {
      return NextResponse.json({
        applications: result,
      });
    }

    // Handle paginated response
    const cacheHeaders = {
      "Cache-Control": forceRefresh
        ? "no-cache"
        : "public, max-age=60, stale-while-revalidate=300",
      "X-Cache-Status": forceRefresh ? "MISS" : "HIT",
    };

    return NextResponse.json(result, { headers: cacheHeaders });
  } catch (error) {
    console.error("Error memproses permintaan aplikasi:", error);
    return NextResponse.json(
      {
        error: "Gagal memproses permintaan aplikasi",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Export protected GET handler
export const GET = withAuth(getApplications);
