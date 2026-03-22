// ─── AUTHOR SIGNALS API ───────────────────────────────────────────────────────
// GET  — List all signals from Supabase (author dashboard).
// Protected: author session required.

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { listSignals } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = getSessionFromCookie(req.headers.get("cookie"));
  if (!session || session.role !== "author") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const signals = await listSignals();
  return NextResponse.json({ signals });
}
