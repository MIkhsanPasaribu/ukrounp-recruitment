import { NextResponse } from "next/server";
import { supabaseUntyped } from "@/lib/supabase";
import { withAuth } from "@/lib/auth-middleware";

export async function GET() {
  const { data, error } = await supabaseUntyped.from("settings").select("value").eq("key", "registrationOpen").maybeSingle();
  if (error) return NextResponse.json({ success: false, isOpen: false, message: "Status pendaftaran belum tersedia. Pendaftaran ditutup." }, { status: 503 });
  return NextResponse.json({ success: true, isOpen: data?.value === "true" }, { headers: { "Cache-Control": "no-store" } });
}

export const POST = withAuth(async request => {
  try {
    const { isOpen } = await request.json();
    if (typeof isOpen !== "boolean") return NextResponse.json({ success: false, message: "Status pendaftaran harus boolean." }, { status: 400 });
    const { error } = await supabaseUntyped.from("settings").upsert({ key: "registrationOpen", value: String(isOpen), updatedAt: new Date().toISOString() }, { onConflict: "key" });
    if (error) return NextResponse.json({ success: false, message: "Gagal mengubah status pendaftaran." }, { status: 500 });
    return NextResponse.json({ success: true, isOpen, message: `Pendaftaran berhasil ${isOpen ? "dibuka" : "ditutup"}.` });
  } catch {
    return NextResponse.json({ success: false, message: "Data status pendaftaran tidak valid." }, { status: 400 });
  }
});
