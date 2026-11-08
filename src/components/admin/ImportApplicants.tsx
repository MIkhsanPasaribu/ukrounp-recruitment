"use client";

import { useState } from "react";
import type { ImportPreview } from "@/lib/interview-import";

type Preview = ImportPreview & { confirmation: string; alreadyImported: number };

export default function ImportApplicants({ token, onImported }: { token: string; onImported: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  async function process(mode: "preview" | "confirm") {
    if (!file || (mode === "confirm" && (!preview || !confirmed))) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("mode", mode);
      if (preview) form.set("confirmation", preview.confirmation);
      const response = await fetch("/api/admin/import-applicants", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Impor gagal. Ulangi preview.");
      if (mode === "preview") {
        setPreview(data);
        setConfirmed(false);
      } else {
        setMessage(data.message);
        setPreview(null);
        setConfirmed(false);
        onImported();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Koneksi gagal. Coba lagi.");
      if (mode === "confirm") { setPreview(null); setConfirmed(false); }
    } finally {
      setBusy(false);
    }
  }

  const button = "min-h-11 rounded-md bg-indigo-700 px-4 py-2 font-medium text-white hover:bg-indigo-800 active:bg-indigo-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-500";
  return (
    <section aria-labelledby="import-title" className="min-w-0 rounded-lg bg-white p-4 sm:p-6">
      <h2 id="import-title" className="text-lg font-semibold text-gray-900">Impor peserta wawancara</h2>
      <p className="mt-2 text-sm text-gray-700">Unduh spreadsheet sebagai Microsoft Excel (.xlsx), lalu pilih berkasnya. Maksimal 4 MB, 1000 baris, sheet pertama.</p>
      <p className="mt-1 text-sm text-gray-700">NIM duplikat memakai entri terbaru jika nama dan email konsisten. Konflik ditahan. Data peserta lama dan hasil wawancara tidak ditimpa.</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="import-file" className="mb-1 block font-medium text-gray-900">Berkas Excel pendaftaran</label>
          <input id="import-file" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" disabled={busy} className="block min-h-11 w-full min-w-0 rounded-md border border-gray-400 p-2 text-sm text-gray-900 focus-visible:outline-2 focus-visible:outline-indigo-700 disabled:cursor-not-allowed" onChange={event => { setFile(event.target.files?.[0] || null); setPreview(null); setConfirmed(false); setError(""); setMessage(""); }} />
        </div>
        <button type="button" className={button} disabled={!file || busy} onClick={() => process("preview")}>Periksa Excel</button>
      </div>
      {busy && <p className="mt-3 text-gray-700" role="status">Memproses Excel. Jangan tutup halaman.</p>}
      {error && <p className="mt-3 break-words text-red-800" role="alert">{error}</p>}
      {message && <p className="mt-3 text-green-800" role="status">{message}</p>}
      {!preview && !busy && !message && <p className="mt-3 text-sm text-gray-700">Belum ada preview. Pilih Excel untuk memeriksa peserta sebelum menyimpan.</p>}
      {preview && (
        <div className="mt-5 space-y-4">
          <p role="status" className="text-gray-900">{preview.totalRows} baris diperiksa. {preview.candidates.length} peserta baru siap impor. {preview.duplicatesRemoved} entri duplikat diringkas. {preview.alreadyImported} peserta sudah ada.</p>
          {preview.issues.length > 0 && <div className="rounded-md bg-amber-50 p-3 text-amber-950"><h3 className="font-semibold">Baris ditahan, tidak akan diimpor</h3><ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-sm">{preview.issues.map((issue, index) => <li key={index}>Baris {issue.rows.join(", ")}: {issue.reason}</li>)}</ul></div>}
          {preview.candidates.length > 0 ? <>
            <div className="max-h-80 overflow-auto rounded-md border border-gray-300" tabIndex={0} role="region" aria-label="Preview peserta siap impor">
              <table className="w-full text-left text-sm text-gray-900"><caption className="sr-only">Peserta baru yang akan dimasukkan ke database</caption><thead className="sticky top-0 bg-gray-100"><tr><th scope="col" className="p-3">Baris</th><th scope="col" className="p-3">NIM</th><th scope="col" className="p-3">Nama</th><th scope="col" className="p-3">Email</th></tr></thead><tbody>{preview.candidates.map(candidate => <tr key={candidate.nim} className="border-t border-gray-200"><td className="p-3">{candidate.sourceRow}</td><td className="p-3">{candidate.nim}</td><td className="p-3">{candidate.fullName}</td><td className="break-all p-3">{candidate.email}</td></tr>)}</tbody></table>
            </div>
            <label className="flex min-h-11 items-start gap-3 text-sm text-gray-900"><input type="checkbox" checked={confirmed} disabled={busy} onChange={event => setConfirmed(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-indigo-700" /><span>Saya sudah memeriksa preview. Impor hanya peserta valid di atas; baris bermasalah tetap ditahan.</span></label>
            <button type="button" className={button} disabled={busy || !confirmed} onClick={() => process("confirm")}>Impor {preview.candidates.length} peserta valid</button>
          </> : <p className="text-gray-700">Tidak ada peserta baru siap impor. Perbaiki baris ditahan atau pilih berkas lain.</p>}
        </div>
      )}
    </section>
  );
}
