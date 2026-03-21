// ─── STRIPE WEBHOOK ───────────────────────────────────────────────────────────
// Handles subscription lifecycle events from Stripe.
// Phase 1: logs events and handles cancellations.
// Phase 2: write subscription state to Supabase.
//
// Register this URL in your Stripe dashboard:
//   https://tintaxis.vercel.app/api/stripe/webhook
// Events to enable: customer.subscription.deleted, customer.subscription.updated

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getWriterConnectId, WRITER_SHARE } from "@/lib/featured-writers";
import type Stripe from "stripe";

// Next.js App Router: read raw body to verify Stripe signature
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig     = req.headers.get("stripe-signature") ?? "";
  const secret  = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  if (!secret) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error("[stripe/webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  // ── Handle events ────────────────────────────────────────────────────────────
  switch (event.type) {

    case "customer.subscription.deleted": {
      // Subscription cancelled — Phase 2: revoke access in DB
      const sub = event.data.object as Stripe.Subscription;
      console.log(`[stripe/webhook] Subscription cancelled: ${sub.id} (customer: ${sub.customer})`);
      // TODO Phase 2: mark user as inactive in Supabase
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      console.log(`[stripe/webhook] Subscription updated: ${sub.id} status=${sub.status}`);
      // TODO Phase 2: update user tier/plan in Supabase
      break;
    }

    case "invoice.payment_failed": {
      const inv = event.data.object as Stripe.Invoice;
      console.log(`[stripe/webhook] Payment failed for customer: ${inv.customer}`);
      // TODO Phase 2: send dunning email, flag account
      break;
    }

    case "checkout.session.completed": {
      // Primary activation happens via /api/stripe/activate redirect.
      // This is the fallback for tab-close cases AND the writer payout trigger.
      const session = event.data.object as Stripe.CheckoutSession;
      const { plan, writerSlug } = session.metadata ?? {};
      console.log(`[stripe/webhook] Checkout complete: ${session.id} plan=${plan} writer=${writerSlug ?? "none"}`);

      // ── Writer payout: transfer 75% to their Stripe Connect account ──────────
      if (writerSlug && session.amount_total && session.amount_total > 0) {
        const connectId = getWriterConnectId(writerSlug);
        if (connectId) {
          const writerAmount = Math.floor(session.amount_total * WRITER_SHARE);
          try {
            const transfer = await stripe.transfers.create({
              amount:   writerAmount,               // cents
              currency: session.currency ?? "usd",
              destination: connectId,
              transfer_group: session.id,
              description: `Tintaxis 75% share — ${writerSlug} — session ${session.id}`,
              metadata: {
                writerSlug,
                plan: plan ?? "",
                checkoutSession: session.id,
                writerAmount: String(writerAmount),
                totalAmount:  String(session.amount_total),
              },
            });
            console.log(`[stripe/webhook] Transfer created: ${transfer.id} → ${connectId} amount=${writerAmount}¢`);
          } catch (err) {
            // Log but don't fail — Tintaxis still received payment
            console.error(`[stripe/webhook] Transfer failed for ${writerSlug}:`, err);
          }
        } else {
          // Writer hasn't connected Stripe yet — log for manual reconciliation
          console.warn(`[stripe/webhook] No Connect account for writer "${writerSlug}" — payout queued for manual transfer.`);
        }
      }
      break;
    }

    default:
      // Unhandled event types — ignore
      break;
  }

  return NextResponse.json({ received: true });
}
