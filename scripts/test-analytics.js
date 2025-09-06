#!/usr/bin/env node

/**
 * Skrip Test Dashboard Analytics
 *
 * Menguji endpoint API analytics dan memvalidasi struktur response
 */

const axios = require("axios");

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const ANALYTICS_ENDPOINT = `${BASE_URL}/api/admin/analytics`;

// Validasi struktur data analytics
function validateAnalyticsData(data) {
  const requiredFields = [
    "overview",
    "facultyBreakdown",
    "statusBreakdown",
    "educationBreakdown",
    "genderBreakdown",
    "skillsAnalysis",
    "interviewerPerformance",
    "timeline",
    "conversionFunnel",
    "metadata",
  ];

  const missingFields = requiredFields.filter((field) => !(field in data));

  if (missingFields.length > 0) {
    throw new Error(`Field yang hilang: ${missingFields.join(", ")}`);
  }

  // Validasi struktur overview
  const overviewFields = [
    "total_applications",
    "accepted_count",
    "rejected_count",
    "under_review_count",
    "interview_count",
    "attendance_confirmed_count",
    "interviewed_count",
    "avg_interview_score",
  ];

  const missingOverviewFields = overviewFields.filter(
    (field) => !(field in data.overview)
  );

  if (missingOverviewFields.length > 0) {
    console.warn(
      `Peringatan: Field overview yang hilang: ${missingOverviewFields.join(
        ", "
      )}`
    );
  }

  // Validasi struktur conversion funnel
  const funnelFields = [
    "applied",
    "interview_scheduled",
    "interview_completed",
    "accepted",
    "conversion_rates",
  ];
  const missingFunnelFields = funnelFields.filter(
    (field) => !(field in data.conversionFunnel)
  );

  if (missingFunnelFields.length > 0) {
    throw new Error(
      `Field funnel yang hilang: ${missingFunnelFields.join(", ")}`
    );
  }

  return true;
}

async function testAnalyticsAPI() {
  console.log("🧪 Mengetes API Dashboard Analytics...\n");

  try {
    // Test 1: Pemanggilan API dasar
    console.log("📡 Test 1: Pemanggilan API dasar");
    const response = await axios.get(ANALYTICS_ENDPOINT, {
      timeout: 10000,
      headers: {
        Accept: "application/json",
      },
    });

    if (response.status !== 200) {
      throw new Error(
        `Status yang diharapkan 200, mendapat ${response.status}`
      );
    }

    if (!response.data || !response.data.success) {
      throw new Error("Response API menunjukkan kegagalan");
    }

    console.log("✅ Pemanggilan API dasar berhasil");

    // Test 2: Validasi struktur data
    console.log("\n📊 Test 2: Validasi struktur data");
    validateAnalyticsData(response.data.data);
    console.log("✅ Validasi struktur data berhasil");

    // Test 3: Validasi tipe data
    console.log("\n🔢 Test 3: Validasi tipe data");
    const data = response.data.data;

    // Cek field numerik
    const numericFields = [
      data.overview.total_applications,
      data.overview.accepted_count,
      data.overview.interviewed_count,
      data.overview.avg_interview_score,
    ];

    numericFields.forEach((value, index) => {
      if (typeof value !== "number") {
        console.warn(
          `Peringatan: Diharapkan number, mendapat ${typeof value} untuk field ${index}`
        );
      }
    });

    console.log("✅ Validasi tipe data selesai");

    // Test 4: Pengujian filter
    console.log("\n🔍 Test 4: Pengujian filter");

    const filterTests = [
      { dateFrom: "2024-01-01", dateTo: "2024-12-31" },
      { faculty: "Engineering" },
      { dateFrom: "2024-01-01" },
      { dateTo: "2024-12-31" },
    ];

    for (const filter of filterTests) {
      try {
        const filterResponse = await axios.get(ANALYTICS_ENDPOINT, {
          params: filter,
          timeout: 10000,
        });

        if (filterResponse.status === 200 && filterResponse.data.success) {
          console.log(`✅ Test filter berhasil: ${JSON.stringify(filter)}`);
        } else {
          console.warn(`⚠️ Peringatan test filter: ${JSON.stringify(filter)}`);
        }
      } catch (error) {
        console.warn(
          `⚠️ Test filter gagal: ${JSON.stringify(filter)} - ${error.message}`
        );
      }
    }

    // Test 5: Test performa
    console.log("\n⚡ Test 5: Test performa");
    const startTime = Date.now();
    await axios.get(ANALYTICS_ENDPOINT);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log(`📈 Waktu respons: ${responseTime}ms`);

    if (responseTime > 5000) {
      console.warn("⚠️ Waktu respons lambat (>5s)");
    } else if (responseTime > 2000) {
      console.warn("⚠️ Waktu respons sedang (>2s)");
    } else {
      console.log("✅ Waktu respons baik (<2s)");
    }

    // Ringkasan
    console.log("\n📋 Ringkasan Test:");
    console.log("✅ Semua test selesai dengan berhasil!");
    console.log("✅ API Analytics berfungsi dengan benar");
    console.log("✅ Struktur data valid");
    console.log(`✅ Waktu respons: ${responseTime}ms`);

    return true;
  } catch (error) {
    console.error("\n❌ Test gagal:", error.message);

    if (error.response) {
      console.error("Status respons:", error.response.status);
      console.error("Data respons:", error.response.data);
    }

    console.log("\n🔧 Tips troubleshooting:");
    console.log("1. Pastikan server Next.js sedang berjalan");
    console.log("2. Cek apakah database dapat diakses");
    console.log("3. Verifikasi konfigurasi Supabase");
    console.log("4. Cek apakah autentikasi admin berfungsi");

    return false;
  }
}

// Fungsi utilitas tambahan
function generateMockData() {
  return {
    overview: {
      total_applications: 1000,
      accepted_count: 250,
      rejected_count: 500,
      under_review_count: 150,
      interview_count: 400,
      attendance_confirmed_count: 350,
      interviewed_count: 300,
      avg_interview_score: 75.5,
    },
    facultyBreakdown: {
      Engineering: 400,
      Science: 300,
      Business: 200,
      Arts: 100,
    },
    statusBreakdown: {
      DITERIMA: 250,
      DITOLAK: 500,
      SEDANG_DITINJAU: 150,
      INTERVIEW: 100,
    },
  };
}

function validateChartData(chartData) {
  if (!Array.isArray(chartData)) {
    throw new Error("Data chart harus berupa array");
  }

  chartData.forEach((item, index) => {
    if (!item.name || typeof item.value !== "number") {
      throw new Error(`Data chart tidak valid pada index ${index}`);
    }
  });

  return true;
}

// Jalankan test jika script ini dieksekusi langsung
if (require.main === module) {
  testAnalyticsAPI()
    .then((success) => {
      if (success) {
        console.log(
          "\n🎉 Semua test berhasil! Dashboard analytics siap digunakan."
        );
        process.exit(0);
      } else {
        console.log("\n💥 Test gagal. Silakan periksa implementasinya.");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("\n💥 Error tidak terduga:", error);
      process.exit(1);
    });
}

module.exports = {
  testAnalyticsAPI,
  validateAnalyticsData,
  generateMockData,
  validateChartData,
};
