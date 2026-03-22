// ─── SIGNAL INK API ROUTE ─────────────────────────────────────────────────────
// Phase 1: Receives a reader's question and emails it to the author.
// Phase 2: This route will also write to the author dashboard question queue.
//
// Required environment variables:
//   SIGNAL_TO_EMAIL   — The author's email (where questions are sent)
//   SIGNAL_FROM_EMAIL — The sending address (e.g. signal@tintaxis.io)
//   RESEND_API_KEY    — Resend.com API key (free tier works for Phase 1)

import { NextRequest, NextResponse } from "next/server";
import { insertSignal } from "@/lib/db";
import { CHAPTERS } from "@/lib/content/chapters";

interface SignalPayload {
  chapterSlug: string;
  selectedText: string;
  question: string;
  readerEmail: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const body: SignalPayload = await req.json();

    const { chapterSlug, selectedText, question, readerEmail } = body;

    if (!question?.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    // ── Phase 1: Email via Resend ──────────────────────────
    const toEmail = process.env.SIGNAL_TO_EMAIL;
    const fromEmail = process.env.SIGNAL_FROM_EMAIL || "signal@tintaxis.io";
    const resendKey = process.env.RESEND_API_KEY;

    if (toEmail && resendKey) {
      const emailBody = {
        from: fromEmail,
        to: toEmail,
        subject: `[TINTAXIS] Signal — Chapter: ${chapterSlug}`,
        html: buildEmailHtml({ chapterSlug, selectedText, question, readerEmail }),
      };

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify(emailBody),
      });

      if (!resendRes.ok) {
        const err = await resendRes.text();
        console.error("[Signal] Resend error:", err);
        // Don't fail the response — question is saved locally on client
      }
    } else {
      // Dev mode: log to console
      console.log("[Signal] Question received (no email configured):", {
        chapterSlug,
        selectedText: selectedText?.slice(0, 80),
        question,
        readerEmail,
      });
    }

    // ── Phase 2: Persist to Supabase ──────────────────────
    const chapterTitle = CHAPTERS[chapterSlug]?.title ?? null;
    await insertSignal({
      chapterSlug,
      chapterTitle,
      selectedText: selectedText ?? null,
      question,
      readerEmail: readerEmail ?? null,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Signal] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// ─── EMAIL TEMPLATE ──────────────────────────────────────────────────────────

function buildEmailHtml({
  chapterSlug,
  selectedText,
  question,
  readerEmail,
}: SignalPayload): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { background: #0D0B08; color: #F5E6C8; font-family: Georgia, serif; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 0 auto; padding: 40px 32px; }
    .header { border-bottom: 1px solid #3D2A0A; padding-bottom: 24px; margin-bottom: 32px; }
    .label { font-family: monospace; font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #00E5CC; margin-bottom: 8px; }
    .title { font-size: 20px; font-style: italic; color: rgba(245,230,200,0.9); }
    .section { margin-bottom: 28px; }
    .excerpt { border-left: 2px solid #00E5CC; padding-left: 16px; font-style: italic; color: rgba(245,230,200,0.5); font-size: 14px; line-height: 1.7; margin-bottom: 24px; }
    .question { font-size: 16px; line-height: 1.8; color: #F5E6C8; background: #1A1208; border: 1px solid rgba(0,229,204,0.2); padding: 20px; border-radius: 2px; }
    .meta { font-family: monospace; font-size: 11px; color: rgba(245,230,200,0.3); letter-spacing: 0.08em; }
    .footer { border-top: 1px solid #3D2A0A; padding-top: 20px; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="label">Tintaxis — Signal Ink</div>
      <div class="title">A reader has sent a question into the Archive.</div>
    </div>

    <div class="section">
      <div class="label">Chapter</div>
      <div class="meta">${chapterSlug.toUpperCase()}</div>
    </div>

    ${selectedText ? `
    <div class="section">
      <div class="label">Selected Text</div>
      <div class="excerpt">"${selectedText.slice(0, 200)}${selectedText.length > 200 ? "…" : ""}"</div>
    </div>
    ` : ""}

    <div class="section">
      <div class="label">The Question</div>
      <div class="question">${question}</div>
    </div>

    ${readerEmail ? `
    <div class="section">
      <div class="label">Reader Address</div>
      <div class="meta">${readerEmail}</div>
    </div>
    ` : ""}

    <div class="footer">
      <div class="meta">Received ${new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      })}</div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
