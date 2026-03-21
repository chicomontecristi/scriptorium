// ─── STRIPE CHECKOUT SESSION ──────────────────────────────────────────────────
// Creates a Stripe Checkout Session for any plan and returns the redirect URL.
// Called from both the /publish author plans and the reader SubscriptionModal.

import { NextRequest, NextResponse } from "next/server";
import { stripe, PLAN_PRICE_IDS, roleForPlan, type PlanId } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plan, returnUrl, email, writerSlug } = body as {
      plan: PlanId;
      returnUrl?: string;
      email?: string;
      writerSlug?: string; // attribution — which writer's page drove this subscription
    };

    if (!plan || !PLAN_PRICE_IDS[plan]) {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    const priceId = PLAN_PRICE_IDS[plan];
    if (!priceId) {
      return NextResponse.json(
        { error: `Price not configured for plan "${plan}". Set STRIPE_PRICE_${plan.toUpperCase()} in Vercel env vars.` },
        { status: 500 }
      );
    }

    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_URL ?? "https://tintaxis.vercel.app";
    const safeReturn = returnUrl ?? "/";

    const role = roleForPlan(plan);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],

      // Pass plan + returnUrl + writer attribution through metadata
      metadata: {
        plan,
        returnUrl: safeReturn,
        role,
        ...(writerSlug ? { writerSlug } : {}),
      },

      // Pre-fill email if we have it
      ...(email ? { customer_email: email } : {}),

      // After payment → /api/stripe/activate verifies and sets cookie
      success_url: `${origin}/api/stripe/activate?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}${safeReturn}`,

      // Subscription settings
      subscription_data: {
        metadata: { plan, role },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
