import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { readSheet } from "read-excel-file/node";
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { OptimizedDatabase, supabaseUntyped } from "@/lib/supabase";
import { previewInterviewImport, validateWorkbookArchive } from "@/lib/interview-import";

export const runtime = "nodejs";
export const maxDuration = 30;

export const POST = withAuth(async (request: NextRequest, auth) => {
  try {
    if (Number(request.headers.get("content-length")) > 4 * 1024 * 1024 + 65536) {
      return NextResponse.json({ message: "Ukuran Excel maksimal 4 MB." }, { status: 413 });
    }
    const form = await request.formData();
    const file = form.get("file");
    const mode = form.get("mode");
    if (!(file instanceof File) || !file.name.toLowerCase().endsWith(".xlsx") || (mode !== "preview" && mode !== "confirm")) {
      return NextResponse.json({ message: "Pilih Excel .xlsx dan tindakan impor yang valid." }, { status: 400 });
    }
    if (file.size > 4 * 1024 * 1024) return NextResponse.json({ message: "Ukuran Excel maksimal 4 MB." }, { status: 413 });
    const buffer = Buffer.from(await file.arrayBuffer());
    validateWorkbookArchive(buffer);
    const rows = await readSheet(buffer, 1);
    const preview = previewInterviewImport(rows);
    const { data: existing, error } = await supabaseUntyped.from("applicants").select("nim,email");
    if (error) return NextResponse.json({ message: "Database belum siap. Jalankan migrasi pemulihan sebelum impor." }, { status: 503 });
    const existingNims = new Set((existing || []).map(row => row.nim));
    const existingEmails = new Set((existing || []).map(row => String(row.email).toLowerCase()));
    const candidates = preview.candidates.filter(candidate => {
      if (existingNims.has(candidate.nim)) return false;
      if (existingEmails.has(candidate.email)) {
        preview.issues.push({ rows: [candidate.sourceRow], reason: "Email sudah digunakan NIM lain di database." });
        return false;
      }
      return true;
    });
    const alreadyImported = preview.candidates.filter(candidate => existingNims.has(candidate.nim)).length;
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) throw new Error("Konfigurasi autentikasi tidak valid.");
    const adminId = (auth.admin as { id: string }).id;
    const digest = createHash("sha256").update(buffer).digest("hex");
    const signature = (expires: number) => createHmac("sha256", secret).update(`${adminId}:${digest}:${expires}`).digest("hex");
    if (mode === "preview") {
      const expires = Date.now() + 15 * 60 * 1000;
      return NextResponse.json({ ...preview, candidates, alreadyImported, confirmation: `${expires}.${signature(expires)}` }, { headers: { "Cache-Control": "private, no-store" } });
    }
    const confirmation = form.get("confirmation");
    const match = typeof confirmation === "string" ? confirmation.match(/^(\d+)\.([a-f0-9]{64})$/) : null;
    if (!match || Number(match[1]) < Date.now() || Number(match[1]) > Date.now() + 15 * 60 * 1000 || !timingSafeEqual(Buffer.from(match[2], "hex"), Buffer.from(signature(Number(match[1])), "hex"))) {
      return NextResponse.json({ message: "Preview kedaluwarsa atau file berubah. Jalankan preview kembali." }, { status: 400 });
    }
    if (!candidates.length) return NextResponse.json({ message: "Tidak ada peserta baru yang valid untuk diimpor." }, { status: 400 });
    const applicants = candidates.map(({ sourceRow, ...candidate }) => ({ ...candidate, sourceData: { ...candidate.sourceData, sourceRow } }));
    const { data, error: importError } = await supabaseUntyped.rpc("import_interview_applicants", { p_applicants: applicants });
    if (importError) return NextResponse.json({ message: "Impor dibatalkan. Periksa konflik NIM/email dan kesiapan migrasi, lalu ulangi preview." }, { status: 409 });
    OptimizedDatabase.clearCache();
    return NextResponse.json({ success: true, result: data, message: "Impor selesai. Baris bermasalah tidak dimasukkan; data lama tidak ditimpa." }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const message = error instanceof Error && /Excel|Header|kolom|Arsip|Struktur|Berkas/.test(error.message)
      ? error.message
      : "Excel tidak dapat diproses. Gunakan unduhan .xlsx yang valid dari spreadsheet pendaftaran.";
    return NextResponse.json({ message }, { status: 400 });
  }
});
