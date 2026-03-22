// ─── AUTHOR STATS API ─────────────────────────────────────────────────────────
// Returns live reader counts + Stripe balance for the author dashboard.
// Protected: author session cookie required.

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { getReaderStats } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  // Auth check — author only
  const session = getSessionFromCookie(req.headers.get("cookie"));
  if (!session || session.role !== "author") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Reader counts from Supabase
  const readerStats = await getReaderStats();

  // Stripe balance
  let stripeBalance = { available: 0, pending: 0, currency: "usd" };
  try {
    const balance = await stripe.balance.retrieve();
    const avail = balance.available.find((b) => b.currency === "usd");
    const pend  = balance.pending.find((b)  => b.currency === "usd");
    stripeBalance = {
      available: avail?.amount ?? 0,  // in cents
      pending:   pend?.amount  ?? 0,
      currency:  "usd",
    };
  } catch (err) {
    console.warn("[author/stats] Stripe balance unavailable:", err);
  }

  // Recent Stripe charges (last 5)
  let recentCharges: { amount: number; description: string | null; created: number }[] = [];
  try {
    const charges = await stripe.charges.list({ limit: 5 });
    recentCharges = charges.data.map((c) => ({
      amount:      c.amount,
      description: c.description ?? c.metadata?.plan ?? null,
      created:     c.created,
    }));
  } catch (err) {
    console.warn("[author/stats] Stripe charges unavailable:", err);
  }

  return NextResponse.json({
    readers: readerStats,
    stripe: {
      balance:       stripeBalance,
      recentCharges,
    },
  });
}
