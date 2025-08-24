import { NextResponse } from "next/server";
import { BulkDownloadService } from "@/services/bulkDownload";
import { ZipGenerationService } from "@/services/bulkDownload/zipGenerationService";

/**
 * API Route untuk bulk download PDF yang telah dioptimasi
 * Mengatasi masalah timeout Vercel dengan batch processing dan timeout management
 */
export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    console.log("=== API Bulk Download PDF Dimulai ===");

    // Parse query parameters
    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const batchSizeParam = url.searchParams.get("batchSize");

    // Konfigurasi dengan nilai default yang optimal untuk Vercel
    const limit = limitParam ? parseInt(limitParam) : undefined;
    const batchSize = batchSizeParam ? parseInt(batchSizeParam) : 8; // Reduced batch size

    // Inisialisasi service dengan konfigurasi optimal
    const bulkDownloadService = new BulkDownloadService({
      batchSize: batchSize,
      compressionLevel: 6, // Balanced compression
      timeout: 8500, // 8.5 detik untuk memberikan buffer
      maxRetries: 1, // Reduced retries to save time
    });

    // Ambil estimasi terlebih dahulu
    const estimasi = await bulkDownloadService.dapatkanEstimasi();
    console.log(
      `Estimasi: ${estimasi.totalAplikasi} aplikasi, ~${estimasi.estimasiWaktu}ms`
    );

    // Tentukan strategi berdasarkan estimasi
    let result;

    if (limit) {
      console.log(`Menggunakan mode batasan: ${limit} aplikasi`);
      result = await bulkDownloadService.prosesFormulirDenganBatasan(limit);
    } else if (estimasi.estimasiWaktu > 7000 || estimasi.totalAplikasi > 25) {
      // Jika estimasi lebih dari 7 detik atau lebih dari 25 aplikasi, gunakan batasan
      const batasanOtomatis = Math.min(25, Math.floor(7000 / 200)); // Max 25 atau waktu optimal
      console.log(
        `Estimasi terlalu lama, menggunakan batasan otomatis: ${batasanOtomatis} aplikasi`
      );
      result = await bulkDownloadService.prosesFormulirDenganBatasan(
        batasanOtomatis
      );
    } else {
      console.log("Memproses semua aplikasi");
      result = await bulkDownloadService.prosesSemuaFormulir();
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Cek hasil
    if (!result.success) {
      console.error("Bulk download gagal:", result.error);

      return NextResponse.json(
        {
          error: result.error,
          progressInfo: result.progressInfo,
          estimasi: estimasi,
          waktuProses: totalTime,
          saran: result.error?.includes("timeout")
            ? "Coba gunakan parameter ?limit=20 untuk membatasi jumlah file"
            : "Periksa log server untuk detail error",
        },
        { status: 500 }
      );
    }

    if (!result.zipBuffer) {
      return NextResponse.json(
        {
          error: "ZIP buffer tidak ditemukan",
          progressInfo: result.progressInfo,
        },
        { status: 500 }
      );
    }

    // Generate nama file ZIP
    const namaFileZip = ZipGenerationService.buatNamaFileZip(
      "semua-formulir-pendaftaran"
    );

    console.log("=== API Bulk Download PDF Selesai ===");
    console.log(`Total waktu API: ${totalTime}ms`);
    console.log(
      `File diproses: ${result.progressInfo.processed}/${result.progressInfo.total}`
    );
    console.log(`Nama file: ${namaFileZip}`);

    // Return ZIP dengan headers yang benar
    return new NextResponse(new Uint8Array(result.zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${namaFileZip}"`,
        "Content-Length": result.zipBuffer.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        // Headers khusus untuk debugging
        "X-Total-Applications": result.progressInfo.total.toString(),
        "X-Processed-Applications": result.progressInfo.processed.toString(),
        "X-Processing-Time": totalTime.toString(),
      },
    });
  } catch (error) {
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.error("Error dalam API bulk download PDF:", error);

    // Log error detail untuk debugging
    if (error instanceof Error) {
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
        saran: [
          "Coba gunakan parameter ?limit=10 untuk mengurangi beban",
          "Periksa koneksi database",
          "Periksa log server untuk detail lebih lanjut",
        ],
      },
      { status: 500 }
    );
  }
}

/**
 * Endpoint untuk mendapatkan informasi dan estimasi tanpa memproses
 */
export async function POST() {
  try {
    const bulkDownloadService = new BulkDownloadService();
    const estimasi = await bulkDownloadService.dapatkanEstimasi();

    return NextResponse.json({
      success: true,
      estimasi: {
        totalAplikasi: estimasi.totalAplikasi,
        estimasiWaktuMs: estimasi.estimasiWaktu,
        estimasiWaktuDetik: Math.round(estimasi.estimasiWaktu / 1000),
        jumlahBatch: estimasi.batchCount,
        rekomendasiBatchSize: estimasi.rekomendasiBatch,
      },
      rekomendasi: {
        gunakanLimit: estimasi.estimasiWaktu > 7000,
        limitYangDisarankan:
          estimasi.estimasiWaktu > 7000
            ? Math.min(25, Math.floor(7000 / 200))
            : estimasi.totalAplikasi,
        alasan:
          estimasi.estimasiWaktu > 7000
            ? "Estimasi waktu melebihi batas timeout Vercel"
            : "Semua data dapat diproses dalam waktu yang tersedia",
      },
    });
  } catch (error) {
    console.error("Error mengambil estimasi:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal mengambil estimasi",
      },
      { status: 500 }
    );
  }
}
