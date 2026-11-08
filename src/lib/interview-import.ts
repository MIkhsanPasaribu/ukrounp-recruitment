export interface ImportApplicant {
  email: string;
  fullName: string;
  nim: string;
  phoneNumber: string;
  birthDate: string | null;
  padangAddress: string | null;
  department: string | null;
  studyProgram: string | null;
  motivation: string | null;
  whyYouShouldBeAccepted: string | null;
  otherSoftware: string | null;
  sourceData: Record<string, string | number>;
}

export interface ImportIssue {
  rows: number[];
  reason: string;
}

export interface ImportPreview {
  totalRows: number;
  duplicatesRemoved: number;
  candidates: Array<ImportApplicant & { sourceRow: number }>;
  issues: ImportIssue[];
}

const text = (value: unknown) => value instanceof Date
  ? value.toISOString()
  : String(value ?? "").trim();
const identity = (value: string) => value.normalize("NFKC").toLowerCase().replace(/\s+/g, " ");
const emailPattern = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;

function timestamp(value: unknown): number | null {
  if (value instanceof Date) return value.getTime();
  const match = text(value).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, month, day, year, hour, minute, second] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day || hour > 23 || minute > 59 || second > 59) return null;
  return date.getTime();
}

export function previewInterviewImport(rows: unknown[][]): ImportPreview {
  if (rows.length < 2 || rows.length > 1001) throw new Error("Excel harus berisi 1 sampai 1000 baris peserta.");
  const headers = rows[0].map(text);
  const column = (name: string) => headers.indexOf(name);
  const required = ["Timestamp", "Email Address", "Email Aktif", "Nama Lengkap", "NIM", "No. HP/WA", "Departemen", "Program Studi", "Motivasi", "Alasan Masuk Robotic"];
  if (required.some(name => column(name) < 0) || new Set(headers).size !== headers.length) throw new Error("Header tidak cocok dengan Excel pendaftaran UKRO atau mengandung kolom duplikat.");
  const groups = new Map<string, Array<{ applicant: ImportApplicant; sourceRow: number; time: number }>>();
  const blocked = new Set<string>();
  const issues: ImportIssue[] = [];
  let totalRows = 0;
  for (const [index, row] of rows.entries()) {
    if (index === 0 || !row.some(value => text(value))) continue;
    totalRows++;
    const sourceRow = index + 1;
    const get = (name: string) => text(row[column(name)]);
    const nim = get("NIM").normalize("NFKC").replace(/^['’]/, "");
    const fullName = get("Nama Lengkap");
    const activeEmail = get("Email Aktif").toLowerCase();
    const collectedEmail = get("Email Address").toLowerCase();
    const email = emailPattern.test(activeEmail) ? activeEmail : collectedEmail;
    const phoneNumber = get("No. HP/WA").replace(/[\s().-]/g, "");
    const time = timestamp(row[column("Timestamp")]);
    const reasons = [];
    if (!/^\d{5,20}$/.test(nim)) reasons.push("NIM tidak valid");
    if (fullName.length < 2 || fullName.length > 150 || !/\p{L}/u.test(fullName) || /@|https?:/i.test(fullName)) reasons.push("nama tidak valid atau kolom bergeser");
    if (!emailPattern.test(activeEmail) || !emailPattern.test(email) || email.length > 254) reasons.push("email aktif tidak valid atau kolom bergeser");
    if (!/^\+?\d{9,15}$/.test(phoneNumber)) reasons.push("nomor telepon tidak valid");
    if (time === null || !Number.isFinite(time)) reasons.push("timestamp tidak valid");
    if (row.length > headers.length || row.some(value => text(value).length > 10000)) reasons.push("ukuran kolom tidak valid");
    if (reasons.length) {
      issues.push({ rows: [sourceRow], reason: reasons.join(", ") });
      if (nim) blocked.add(nim);
      continue;
    }
    const sourceData = Object.fromEntries(headers.map((header, i) => [header, text(row[i])]));
    sourceData.sourceRow = String(sourceRow);
    const applicant: ImportApplicant = {
      nim, fullName, email, phoneNumber,
      birthDate: null,
      padangAddress: get("Alamat Domisili Sekarang (Bukan Asal Daerah)") || null,
      department: get("Departemen") || null,
      studyProgram: get("Program Studi") || null,
      motivation: get("Motivasi") || null,
      whyYouShouldBeAccepted: get("Alasan Masuk Robotic") || null,
      otherSoftware: get("Aplikasi yang pernah dipakai?") || null,
      sourceData,
    };
    groups.set(nim, [...(groups.get(nim) || []), { applicant, sourceRow, time: time! }]);
  }
  let duplicatesRemoved = 0;
  let candidates: ImportPreview["candidates"] = [];
  for (const [nim, entries] of groups) {
    const names = new Set(entries.map(e => identity(e.applicant.fullName)));
    const emails = new Set(entries.map(e => e.applicant.email));
    if (blocked.has(nim) || names.size > 1 || emails.size > 1) {
      issues.push({ rows: entries.map(e => e.sourceRow), reason: "NIM sama dengan identitas berbeda atau baris tidak valid. Periksa sebelum impor." });
      continue;
    }
    entries.sort((a, b) => b.time - a.time || b.sourceRow - a.sourceRow);
    candidates.push({ ...entries[0].applicant, sourceRow: entries[0].sourceRow });
    duplicatesRemoved += entries.length - 1;
  }
  const emails = new Map<string, number[]>();
  for (const candidate of candidates) emails.set(candidate.email, [...(emails.get(candidate.email) || []), candidate.sourceRow]);
  candidates = candidates.filter(candidate => {
    const collisions = emails.get(candidate.email)!;
    if (collisions.length === 1) return true;
    if (collisions[0] === candidate.sourceRow) issues.push({ rows: collisions, reason: "Email sama digunakan untuk NIM berbeda." });
    return false;
  });
  return { totalRows, duplicatesRemoved, candidates, issues };
}

export function validateWorkbookArchive(buffer: Buffer): void {
  if (buffer.length < 22 || buffer.length > 4 * 1024 * 1024) throw new Error("Ukuran Excel maksimal 4 MB.");
  let end = -1;
  for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 65557); i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50 && i + 22 + buffer.readUInt16LE(i + 20) === buffer.length) { end = i; break; }
  }
  if (end < 0) throw new Error("Berkas bukan Excel XLSX yang valid.");
  const count = buffer.readUInt16LE(end + 10);
  let offset = buffer.readUInt32LE(end + 16);
  let total = 0;
  if (count > 500 || count === 0 || buffer.readUInt16LE(end + 4) !== 0 || buffer.readUInt16LE(end + 6) !== 0) throw new Error("Arsip Excel tidak didukung.");
  for (let i = 0; i < count; i++) {
    if (offset + 46 > end || buffer.readUInt32LE(offset) !== 0x02014b50) throw new Error("Struktur Excel rusak.");
    const size = buffer.readUInt32LE(offset + 24);
    total += size;
    if (total > 25 * 1024 * 1024 || (buffer.readUInt16LE(offset + 8) & 1)) throw new Error("Excel terenkripsi atau ukuran ekstraksi terlalu besar.");
    offset += 46 + buffer.readUInt16LE(offset + 28) + buffer.readUInt16LE(offset + 30) + buffer.readUInt16LE(offset + 32);
  }
  if (offset > end) throw new Error("Struktur Excel rusak.");
}
