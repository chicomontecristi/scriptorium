// ─── TINTAXIS — DATABASE HELPERS ─────────────────────────────────────────────
// All Supabase operations go through here. Server-side only.

import { supabase } from "./supabase";
import type { ReaderRow, ReaderTier, AuthorPlan, SignalRow } from "./db-types";

// ── Readers ───────────────────────────────────────────────────────────────────

/**
 * Upsert a reader after a successful checkout.
 * Creates a new row if the email doesn't exist; updates if it does.
 */
export async function upsertReader(params: {
  email:                  string;
  name?:                  string;
  stripeCustomerId?:      string;
  stripeSubscriptionId?:  string;
  tier?:                  ReaderTier | null;
  plan?:                  AuthorPlan | null;
  role?:                  "reader" | "author";
  active?:                boolean;
}): Promise<ReaderRow | null> {
  const { data, error } = await supabase
    .from("readers")
    .upsert(
      {
        email:                   params.email.toLowerCase().trim(),
        name:                    params.name             ?? null,
        stripe_customer_id:      params.stripeCustomerId ?? null,
        stripe_subscription_id:  params.stripeSubscriptionId ?? null,
        tier:                    params.tier ?? null,
        plan:                    params.plan ?? null,
        role:                    params.role ?? "reader",
        active:                  params.active ?? true,
        updated_at:              new Date().toISOString(),
      },
      { onConflict: "email", ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) {
    console.error("[db] upsertReader error:", error.message);
    return null;
  }
  return data;
}

/**
 * Look up a reader by their Stripe customer ID.
 * Used in webhook handlers.
 */
export async function getReaderByCustomerId(customerId: string): Promise<ReaderRow | null> {
  const { data, error } = await supabase
    .from("readers")
    .select("*")
    .eq("stripe_customer_id", customerId)
    .single();

  if (error) {
    if (error.code !== "PGRST116") { // not-found is expected
      console.error("[db] getReaderByCustomerId error:", error.message);
    }
    return null;
  }
  return data;
}

/**
 * Look up a reader by their Stripe subscription ID.
 */
export async function getReaderBySubscriptionId(subscriptionId: string): Promise<ReaderRow | null> {
  const { data, error } = await supabase
    .from("readers")
    .select("*")
    .eq("stripe_subscription_id", subscriptionId)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("[db] getReaderBySubscriptionId error:", error.message);
    }
    return null;
  }
  return data;
}

/**
 * Look up a reader by email.
 * Used in session refresh.
 */
export async function getReaderByEmail(email: string): Promise<ReaderRow | null> {
  const { data, error } = await supabase
    .from("readers")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("[db] getReaderByEmail error:", error.message);
    }
    return null;
  }
  return data;
}

/**
 * Update subscription state (tier, active, subscriptionId) by customer ID.
 * Called from webhook on subscription.updated / subscription.deleted.
 */
export async function updateReaderSubscription(
  customerId: string,
  params: {
    stripeSubscriptionId?: string | null;
    tier?:                 ReaderTier | null;
    active?:               boolean;
  }
): Promise<void> {
  const { error } = await supabase
    .from("readers")
    .update({
      ...(params.stripeSubscriptionId !== undefined
        ? { stripe_subscription_id: params.stripeSubscriptionId }
        : {}),
      ...(params.tier !== undefined ? { tier: params.tier }     : {}),
      ...(params.active !== undefined ? { active: params.active } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("[db] updateReaderSubscription error:", error.message);
  }
}

/**
 * Deactivate a reader when their subscription is cancelled.
 */
export async function deactivateReader(customerId: string): Promise<void> {
  await updateReaderSubscription(customerId, {
    active: false,
    tier:   null,
    stripeSubscriptionId: null,
  });
}

// ── Purchases (one-time) ─────────────────────────────────────────────────────

/**
 * Record a one-time chapter purchase.
 */
export async function recordPurchase(params: {
  readerId:         string;
  chapterSlug:      string;
  plan:             string;
  stripeSessionId:  string;
  amount:           number | null;
  writerSlug?:      string | null;
}): Promise<void> {
  const { error } = await supabase
    .from("purchases")
    .insert({
      reader_id:         params.readerId,
      chapter_slug:      params.chapterSlug,
      plan:              params.plan,
      stripe_session_id: params.stripeSessionId,
      amount:            params.amount,
      writer_slug:       params.writerSlug ?? null,
    });

  if (error) {
    console.error("[db] recordPurchase error:", error.message);
  }
}

/**
 * Check if a reader has purchased (and kept) a chapter.
 */
export async function hasPurchasedChapter(
  readerId:    string,
  chapterSlug: string
): Promise<boolean> {
  const { count, error } = await supabase
    .from("purchases")
    .select("id", { count: "exact", head: true })
    .eq("reader_id", readerId)
    .eq("chapter_slug", chapterSlug)
    .eq("plan", "keep");

  if (error) {
    console.error("[db] hasPurchasedChapter error:", error.message);
    return false;
  }
  return (count ?? 0) > 0;
}

// ── Signals ───────────────────────────────────────────────────────────────────

/**
 * Persist a reader's Signal Ink question to the database.
 */
export async function insertSignal(params: {
  chapterSlug:   string;
  chapterTitle?: string | null;
  selectedText?: string | null;
  question:      string;
  readerEmail?:  string | null;
}): Promise<SignalRow | null> {
  const { data, error } = await supabase
    .from("signals")
    .insert({
      chapter_slug:  params.chapterSlug,
      chapter_title: params.chapterTitle ?? null,
      selected_text: params.selectedText ?? null,
      question:      params.question,
      reader_email:  params.readerEmail ?? null,
      answered:      false,
    })
    .select()
    .single();

  if (error) {
    console.error("[db] insertSignal error:", error.message);
    return null;
  }
  return data;
}

/**
 * Fetch all signals, newest first.
 */
export async function listSignals(): Promise<SignalRow[]> {
  const { data, error } = await supabase
    .from("signals")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[db] listSignals error:", error.message);
    return [];
  }
  return data ?? [];
}

/**
 * Record the author's reply to a signal.
 */
export async function replyToSignal(
  id:    string,
  reply: string
): Promise<boolean> {
  const { error } = await supabase
    .from("signals")
    .update({ answered: true, reply, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[db] replyToSignal error:", error.message);
    return false;
  }
  return true;
}

// ── Author stats ──────────────────────────────────────────────────────────────

/**
 * Returns reader counts broken down by tier and active state.
 */
export async function getReaderStats(): Promise<{
  total: number;
  active: number;
  byTier: Record<string, number>;
}> {
  const { data, error } = await supabase
    .from("readers")
    .select("tier, active");

  if (error) {
    console.error("[db] getReaderStats error:", error.message);
    return { total: 0, active: 0, byTier: {} };
  }

  const rows = data ?? [];
  const active = rows.filter((r) => r.active).length;
  const byTier: Record<string, number> = {};

  for (const row of rows) {
    if (row.active && row.tier) {
      byTier[row.tier] = (byTier[row.tier] ?? 0) + 1;
    }
  }

  return { total: rows.length, active, byTier };
}
