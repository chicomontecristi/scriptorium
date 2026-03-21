import { NextRequest, NextResponse } from "next/server";

// ─── AUTHOR APPLICATION ROUTE ─────────────────────────────────────────────────
// Receives author application form, emails it to chicomontecristi@gmail.com
// via Resend. Same Resend setup as Signal Ink.

export async function POST(req: NextRequest) {
  try {
    const { name, email, bookTitle, genre, wordCount, synopsis, whyTintaxis } = await req.json();

    if (!name || !email || !bookTitle) {
      return NextResponse.json({ error: "Name, email, and book title are required." }, { status: 400 });
    }

    const apiKey    = process.env.RESEND_API_KEY;
    const toEmail   = process.env.SIGNAL_TO_EMAIL ?? "chicomontecristi@gmail.com";
    const fromEmail = process.env.SIGNAL_FROM_EMAIL ?? "onboarding@resend.dev";

    if (apiKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: toEmail,
          subject: `Tintaxis Author Application — ${bookTitle} by ${name}`,
          html: `
            <div style="font-family: monospace; background: #0D0B08; color: #F5E6C8; padding: 2rem; max-width: 600px;">
              <h2 style="color: #C9A84C; letter-spacing: 0.2em; font-size: 0.9rem; text-transform: uppercase;">
                NEW AUTHOR APPLICATION
              </h2>
              <hr style="border-color: rgba(201,168,76,0.2); margin: 1rem 0;" />

              <p><strong style="color:#C9A84C;">Name:</strong> ${name}</p>
              <p><strong style="color:#C9A84C;">Email:</strong> ${email}</p>
              <p><strong style="color:#C9A84C;">Book Title:</strong> ${bookTitle}</p>
              <p><strong style="color:#C9A84C;">Genre:</strong> ${genre ?? "—"}</p>
              <p><strong style="color:#C9A84C;">Word Count:</strong> ${wordCount ?? "—"}</p>

              <hr style="border-color: rgba(201,168,76,0.1); margin: 1rem 0;" />

              <p><strong style="color:#C9A84C;">Synopsis:</strong></p>
              <p style="color:rgba(245,230,200,0.7); font-style:italic;">${synopsis ?? "—"}</p>

              <p><strong style="color:#C9A84C;">Why Tintaxis:</strong></p>
              <p style="color:rgba(245,230,200,0.7); font-style:italic;">${whyTintaxis ?? "—"}</p>

              <hr style="border-color: rgba(201,168,76,0.2); margin: 1rem 0;" />
              <p style="color:rgba(201,168,76,0.4); font-size:0.8rem;">
                Tintaxis · Author Application System · tintaxis.vercel.app/publish
              </p>
            </div>
          `,
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
