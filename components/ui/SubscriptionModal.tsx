"use client";

// ─── SUBSCRIPTION MODAL ───────────────────────────────────────────────────────
// Tintaxis's four tiers. Shown when a reader tries to access a gated
// feature. Phase 1: "Join the Waitlist" — no live payments yet.
// Phase 2: Stripe or Lemon Squeezy integration.

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

export type SubscriptionTierName = "codex" | "author" | "archive" | "chronicler";

interface SubscriptionModalProps {
  isOpen: boolean;
  triggeredBy?: SubscriptionTierName; // which tier is required for this feature
  featureName?: string;               // human-readable name of locked feature
  onClose: () => void;
}

// ─── TIER DEFINITIONS ────────────────────────────────────────────────────────

interface Tier {
  id: SubscriptionTierName;
  name: string;
  price: string;
  period: string;
  tagline: string;
  features: string[];
  inkColors: string[];
  accentColor: string;
}

const TIERS: Tier[] = [
  {
    id: "codex",
    name: "Codex",
    price: "$3",
    period: "/month",
    tagline: "Less than a coffee. The whole archive.",
    features: [
      "All published chapters",
      "Ghost, Ember, Copper & Memory Ink",
      "Personal annotation archive",
      "Chapter completion seals",
    ],
    inkColors: ["rgba(160,168,168,0.8)", "rgba(214,83,60,0.8)", "rgba(201,140,60,0.8)", "rgba(106,60,196,0.8)"],
    accentColor: "rgba(201,168,76,0.6)",
  },
  {
    id: "author",
    name: "Scribe",
    price: "$6",
    period: "/month",
    tagline: "Read what the author left behind.",
    features: [
      "Everything in Codex",
      "Signal Ink — ask the author directly",
      "Author Whispers in the margins",
      "Early access to new chapters",
    ],
    inkColors: ["rgba(0,229,204,0.8)"],
    accentColor: "rgba(0,229,204,0.6)",
  },
  {
    id: "archive",
    name: "Archive",
    price: "$9",
    period: "/month",
    tagline: "You are not reading alone.",
    features: [
      "Everything in Scribe",
      "Community Margin layer",
      "See how all readers annotate",
      "Archive Ink — permanent public marks",
    ],
    inkColors: ["rgba(201,168,76,1)"],
    accentColor: "rgba(201,168,76,0.9)",
  },
  {
    id: "chronicler",
    name: "Chronicler",
    price: "$15",
    period: "/month",
    tagline: "Your name lives in the book.",
    features: [
      "Everything in Archive",
      "Signed physical edition mailed to you",
      "Your name in the dedication",
      "Private reading session with the author",
    ],
    inkColors: ["rgba(245,230,200,0.9)"],
    accentColor: "rgba(245,230,200,0.75)",
  },
];

const TIER_ORDER: SubscriptionTierName[] = ["codex", "author", "archive", "chronicler"];

function tierIndex(id?: SubscriptionTierName) {
  if (!id) return -1;
  return TIER_ORDER.indexOf(id);
}

export default function SubscriptionModal({
  isOpen,
  triggeredBy,
  featureName,
  onClose,
}: SubscriptionModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ padding: "1rem" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          {/* ── Backdrop ── */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "rgba(13,11,8,0.94)",
              backdropFilter: "blur(6px)",
            }}
          />

          {/* ── Modal panel ── */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              maxWidth: "900px",
              maxHeight: "90vh",
              overflowY: "auto",
              border: "1px solid rgba(201,168,76,0.2)",
              background: "rgba(13,11,8,0.98)",
              padding: "clamp(1.5rem, 4vw, 2.5rem)",
            }}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.2, 0, 0.1, 1] }}
          >
            {/* ── Close button ── */}
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "rgba(201,168,76,0.4)",
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                padding: "0.25rem 0.5rem",
              }}
            >
              ✕ CLOSE
            </button>

            {/* ── Header ── */}
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              {featureName && (
                <p
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.55rem",
                    letterSpacing: "0.3em",
                    color: "rgba(0,229,204,0.7)",
                    textTransform: "uppercase",
                    marginBottom: "0.6rem",
                  }}
                >
                  {featureName} · Requires Access
                </p>
              )}
              <h2
                style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "clamp(1.4rem, 3vw, 2rem)",
                  fontWeight: 400,
                  color: "#F5E6C8",
                  letterSpacing: "0.05em",
                  marginBottom: "0.5rem",
                }}
              >
                Open the Archive
              </h2>
              <p
                style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "0.95rem",
                  fontStyle: "italic",
                  color: "rgba(245,230,200,0.35)",
                }}
              >
                Tintaxis is a living book. Choose how deeply you want to live inside it.
              </p>
            </div>

            {/* ── Brass rule ── */}
            <div
              style={{
                height: "1px",
                background:
                  "linear-gradient(90deg, transparent, rgba(201,168,76,0.4) 30%, rgba(201,168,76,0.6) 50%, rgba(201,168,76,0.4) 70%, transparent)",
                marginBottom: "2rem",
              }}
            />

            {/* ── Tier grid ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              {TIERS.map((tier, i) => {
                const isHighlighted = tier.id === triggeredBy;
                const isUnlocked = triggeredBy
                  ? i < tierIndex(triggeredBy)
                  : false;

                return (
                  <TierCard
                    key={tier.id}
                    tier={tier}
                    isHighlighted={isHighlighted}
                    isUnlocked={isUnlocked}
                    index={i}
                  />
                );
              })}
            </div>

            {/* ── Brass rule ── */}
            <div
              style={{
                height: "1px",
                background:
                  "linear-gradient(90deg, transparent, rgba(201,168,76,0.3) 50%, transparent)",
                marginBottom: "1.5rem",
              }}
            />

            {/* ── Phase note ── */}
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.5rem",
                  letterSpacing: "0.2em",
                  color: "rgba(201,168,76,0.3)",
                  textTransform: "uppercase",
                  marginBottom: "0.5rem",
                }}
              >
                Phase 1 — Subscriptions Opening Soon
              </p>
              <p
                style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "0.85rem",
                  fontStyle: "italic",
                  color: "rgba(245,230,200,0.3)",
                  maxWidth: "42ch",
                  margin: "0 auto 1.2rem",
                  lineHeight: 1.6,
                }}
              >
                The Archive is currently in private reading. Leave your address
                and you will be the first through the door.
              </p>

              {/* Waitlist CTA */}
              <a
                href="mailto:chicomontecristi@gmail.com?subject=Tintaxis Waitlist"
                style={{ textDecoration: "none" }}
              >
                <motion.div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.6rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#C9A84C",
                    border: "1px solid rgba(201,168,76,0.4)",
                    padding: "0.7rem 2rem",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  whileHover={{
                    borderColor: "rgba(201,168,76,0.8)",
                    boxShadow: "0 0 20px rgba(201,168,76,0.15)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Corner accents */}
                  {["top-0 left-0 border-t border-l","top-0 right-0 border-t border-r","bottom-0 left-0 border-b border-l","bottom-0 right-0 border-b border-r"].map((cls, j) => (
                    <span key={j} className={`absolute w-1.5 h-1.5 ${cls}`} style={{ borderColor: "#C9A84C" }} />
                  ))}
                  Join the Waitlist
                </motion.div>
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── TIER CARD ────────────────────────────────────────────────────────────────

function TierCard({
  tier,
  isHighlighted,
  isUnlocked,
  index,
}: {
  tier: Tier;
  isHighlighted: boolean;
  isUnlocked: boolean;
  index: number;
}) {
  return (
    <motion.div
      style={{
        border: isHighlighted
          ? `1px solid ${tier.accentColor}`
          : "1px solid rgba(201,168,76,0.12)",
        background: isHighlighted
          ? "rgba(201,168,76,0.04)"
          : "rgba(13,11,8,0.6)",
        padding: "1.25rem",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      {/* Required badge */}
      {isHighlighted && (
        <div
          style={{
            position: "absolute",
            top: "-1px",
            left: "50%",
            transform: "translateX(-50%)",
            background: tier.accentColor,
            padding: "0.15rem 0.6rem",
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.45rem",
              letterSpacing: "0.15em",
              color: "#0D0B08",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Required
          </span>
        </div>
      )}

      {/* Tier name */}
      <p
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.5rem",
          letterSpacing: "0.2em",
          color: isHighlighted ? tier.accentColor : "rgba(201,168,76,0.4)",
          textTransform: "uppercase",
          marginBottom: "0.4rem",
          marginTop: isHighlighted ? "0.4rem" : "0",
        }}
      >
        {tier.name}
      </p>

      {/* Price */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "2px", marginBottom: "0.4rem" }}>
        <span
          style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "1.5rem",
            fontWeight: 400,
            color: isHighlighted ? tier.accentColor : "rgba(245,230,200,0.6)",
            lineHeight: 1,
          }}
        >
          {tier.price}
        </span>
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.5rem",
            color: "rgba(245,230,200,0.25)",
            letterSpacing: "0.1em",
          }}
        >
          {tier.period}
        </span>
      </div>

      {/* Tagline */}
      <p
        style={{
          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
          fontSize: "0.8rem",
          fontStyle: "italic",
          color: "rgba(245,230,200,0.4)",
          marginBottom: "1rem",
          lineHeight: 1.4,
        }}
      >
        {tier.tagline}
      </p>

      {/* Feature list */}
      <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1 }}>
        {tier.features.map((f, i) => (
          <li
            key={i}
            style={{
              fontFamily: '"EB Garamond", Garamond, Georgia, serif',
              fontSize: "0.8rem",
              color: isUnlocked
                ? "rgba(245,230,200,0.25)"
                : "rgba(245,230,200,0.55)",
              lineHeight: 1.5,
              paddingLeft: "0.9rem",
              position: "relative",
              marginBottom: "0.2rem",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 0,
                color: tier.accentColor,
                opacity: isUnlocked ? 0.3 : 0.7,
              }}
            >
              ·
            </span>
            {f}
          </li>
        ))}
      </ul>

      {/* Ink color dots */}
      <div style={{ display: "flex", gap: "4px", marginTop: "1rem" }}>
        {tier.inkColors.map((color, i) => (
          <div
            key={i}
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: color,
              boxShadow: `0 0 4px ${color}`,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
