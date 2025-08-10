import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: applications, error } = await supabase
      .from("applicants")
      .select(
        "id, fullName, corelDraw, photoshop, adobePremierePro, otherSoftware"
      )
      .limit(1);

    if (error) {
      console.error("Debug error:", error);
      return NextResponse.json({ error: "Debug gagal" }, { status: 500 });
    }

    console.log("Data database mentah:", applications);

    return NextResponse.json({
      debug: "Nilai database mentah",
      data: applications,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: "Debug gagal" }, { status: 500 });
  }
}
