// ─── STRIPE CONNECT EXPRESS — WRITER ONBOARDING ───────────────────────────────
//
// Two actions:
//
//   GET ?action=link&slug=jose-la-luz&key=WRITER_INVITE_SECRET
//     → Creates a Stripe Connect Express account (or retrieves existing one
//       stored as STRIPE_CONNECT_JOSE_LA_LUZ env var) and returns a one-time
//       account link URL. José sends this to the writer.
//
//   GET ?action=callback&account=acct_...&slug=jose-la-luz
//     → Called by Stripe after the writer finishes onboarding.
//       Logs the account ID to Vercel logs so José can add it as an env var.
//       Redirects the writer to their profile page.
//
// ─── ENV VARS NEEDED ──────────────────────────────────────────────────────────
//   WRITER_INVITE_SECRET   — admin key (already set)
//   STRIPE_SECRET_KEY      — already set
//   STRIPE_CONNECT_<SLUG>  — set manually after a writer onboards
//                            e.g. STRIPE_CONNECT_JOSE_LA_LUZ=acct_...

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getWriterBySlug, getWriterConnectId } from "@/lib/featured-writers";

const ADMIN_SECRET = process.env.WRITER_INVITE_SECRET ?? "";
const BASE_URL     = process.env.NEXT_PUBLIC_URL ?? "https://tintaxis.vercel.app";

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  // ── 1. Generate a Connect Express onboarding link ─────────────────────────
  if (action === "link") {
    const key  = searchParams.get("key");
    const slug = searchParams.get("slug");

    if (!key || key !== ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (!slug) {
      return NextResponse.json({ error: "Missing slug." }, { status: 400 });
    }

    const writer = getWriterBySlug(slug);
    if (!writer) {
      return NextResponse.json({ error: `Writer not found: ${slug}` }, { status: 404 });
    }

    try {
      // Check if a Connect account already exists for this writer
      let accountId = getWriterConnectId(slug);

      if (!accountId) {
        // Create a new Express account
        const account = await stripe.accounts.create({
          type:         "express",
          country:      "US",
          capabilities: { transfers: { requested: true } },
          metadata:     { writerSlug: slug, writerName: writer.name },
        });
        accountId = account.id;

        console.log(
          `[writer/connect] New Express account created for "${slug}": ${accountId}\n` +
          `Add this to Vercel env vars:\n` +
          `  STRIPE_CONNECT_${slug.toUpperCase().replace(/-/g, "_")}=${accountId}`
        );
      }

      // Create a one-time account onboarding link (valid ~10 minutes)
      const accountLink = await stripe.accountLinks.create({
        account:     accountId,
        refresh_url: `${BASE_URL}/api/writer/connect?action=link&slug=${slug}&key=${key}`,
        return_url:  `${BASE_URL}/api/writer/connect?action=callback&account=${accountId}&slug=${slug}`,
        type:        "account_onboarding",
      });

      return NextResponse.json({
        slug,
        accountId,
        onboardUrl: accountLink.url,
        expiresAt:  new Date(accountLink.expires_at * 1000).toISOString(),
        note:       `Send onboardUrl to ${writer.name}. After they complete it, add STRIPE_CONNECT_${slug.toUpperCase().replace(/-/g, "_")}=${accountId} to Vercel env vars.`,
      });
    } catch (err) {
      console.error("[writer/connect] Error creating account link:", err);
      return NextResponse.json({ error: "Failed to create Connect account link." }, { status: 500 });
    }
  }

  // ── 2. Post-onboarding callback ───────────────────────────────────────────
  if (action === "callback") {
    const account = searchParams.get("account");
    const slug    = searchParams.get("slug");

    if (account && slug) {
      // Verify the account exists and is fully onboarded
      try {
        const acct = await stripe.accounts.retrieve(account);
        const ready = acct.details_submitted;

        console.log(
          `[writer/connect] Callback for "${slug}" — account: ${account} — details_submitted: ${ready}\n` +
          (ready
            ? `✅ Onboarding complete. Add to Vercel:\n  STRIPE_CONNECT_${slug.toUpperCase().replace(/-/g, "_")}=${account}`
            : `⚠️  Onboarding incomplete. Writer may need to finish the form.`)
        );

        // Redirect writer to their profile page with a status param
        const status = ready ? "connected" : "incomplete";
        return NextResponse.redirect(`${BASE_URL}/writers/${slug}?connect=${status}`);
      } catch (err) {
        console.error("[writer/connect] Callback error:", err);
        return NextResponse.redirect(`${BASE_URL}/writers/${slug}?connect=error`);
      }
    }

    return NextResponse.redirect(`${BASE_URL}/writers`);
  }

  return NextResponse.json(
    { error: "Missing or invalid action. Use action=link or action=callback." },
    { status: 400 }
  );
}
