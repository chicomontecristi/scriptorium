// ─── AUTHOR SIGNAL REPLY ─────────────────────────────────────────────────────
// PATCH /api/author/signals/[id]
// Submit or update the author's reply to a reader's Signal Ink question.
// Protected: author session required.

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { replyToSignal } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getSessionFromCookie(req.headers.get("cookie"));
  if (!session || session.role !== "author") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Missing signal ID" }, { status: 400 });
  }

  const body = await req.json();
  const reply = typeof body.reply === "string" ? body.reply.trim() : "";

  if (!reply) {
    return NextResponse.json({ error: "Reply text required" }, { status: 400 });
  }

  const ok = await replyToSignal(id, reply);
  if (!ok) {
    return NextResponse.json({ error: "Failed to save reply" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
