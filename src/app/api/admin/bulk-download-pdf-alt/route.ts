import { NextResponse } from "next/server";
import { BulkDownloadService } from "@/services/bulkDownload";
import { ZipGenerationService } from "@/services/bulkDownload/zipGenerationService";

/**
 * API Route alternatif untuk bulk download PDF yang telah dioptimasi
 * Menggunakan archiver untuk streaming ZIP dan batch processing
 * Dirancang khusus untuk mengatasi timeout di Vercel
 */
export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    console.log("=== API Bulk Download PDF Alt Dimulai ===");

    // Parse query parameters
    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const batchSizeParam = url.searchParams.get("batchSize");

    // Konfigurasi dengan nilai default yang sangat konservatif untuk Vercel
    const limit = limitParam ? parseInt(limitParam) : 20; // Default limit 20
    const batchSize = batchSizeParam ? parseInt(batchSizeParam) : 5; // Batch size kecil

    console.log(`Konfigurasi: limit=${limit}, batchSize=${batchSize}`);

    // Inisialisasi service dengan konfigurasi sangat konservatif
    const bulkDownloadService = new BulkDownloadService({
      batchSize: batchSize,
      compressionLevel: 3, // Kompresi ringan untuk kecepatan
      timeout: 8000, // 8 detik
      maxRetries: 1, // Minimal retry untuk menghemat waktu
    });

    // Proses dengan batasan untuk mencegah timeout
    const result = await bulkDownloadService.prosesFormulirDenganBatasan(limit);

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Cek hasil
    if (!result.success) {
      console.error("Bulk download alt gagal:", result.error);

      return NextResponse.json(
        {
          error: result.error,
          progressInfo: result.progressInfo,
          waktuProses: totalTime,
          konfigurasi: { limit, batchSize },
          saran: [
            "Gunakan limit yang lebih kecil (contoh: ?limit=10)",
            "Kurangi batch size (contoh: ?batchSize=3)",
            "Coba lagi dalam beberapa saat",
          ],
        },
        { status: 500 }
      );
    }

    if (!result.zipBuffer) {
      return NextResponse.json(
        {
          error: "ZIP buffer tidak ditemukan",
          progressInfo: result.progressInfo,
          waktuProses: totalTime,
        },
        { status: 500 }
      );
    }

    // Generate nama file ZIP dengan suffix alt
    const namaFileZip = ZipGenerationService.buatNamaFileZip(
      "formulir-pendaftaran-alt"
    );

    console.log("=== API Bulk Download PDF Alt Selesai ===");
    console.log(`Total waktu API: ${totalTime}ms`);
    console.log(
      `File diproses: ${result.progressInfo.processed}/${result.progressInfo.total}`
    );
    console.log(
      `Ukuran ZIP: ${(result.zipBuffer.length / 1024 / 1024).toFixed(2)} MB`
    );

    // Return ZIP dengan headers yang optimal
    return new NextResponse(new Uint8Array(result.zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${namaFileZip}"`,
        "Content-Length": result.zipBuffer.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        // Headers untuk monitoring
        "X-Total-Applications": result.progressInfo.total.toString(),
        "X-Processed-Applications": result.progressInfo.processed.toString(),
        "X-Processing-Time": totalTime.toString(),
        "X-Batch-Size": batchSize.toString(),
        "X-Limit-Used": limit.toString(),
      },
    });
  } catch (error) {
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.error("Error dalam API bulk download PDF alt:", error);

    // Log detail error untuk debugging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      {
        error: "Gagal menghasilkan file ZIP",
        details:
          error instanceof Error ? error.message : "Kesalahan tidak diketahui",
        waktuProses: totalTime,
        timestamp: new Date().toISOString(),
        namaError: error instanceof Error ? error.name : "UnknownError",
        saran: [
          "Coba kurangi limit menjadi 5-10",
          "Pastikan koneksi database stabil",
          "Hubungi administrator jika masalah berlanjut",
        ],
        debugInfo: {
          timeoutReached: totalTime > 8000,
          memoryUsage: process.memoryUsage
            ? process.memoryUsage()
            : "unavailable",
        },
      },
      { status: 500 }
    );
  }
}
