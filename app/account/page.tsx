"use client";

// ─── READER ACCOUNT PAGE ──────────────────────────────────────────────────────
// The reader's personal vault. Shows subscription state, tier details,
// and links to manage billing or continue reading.
//
// Checks live session via /api/reader/session on mount.
// If not subscribed → shows an "access not found" state with a path forward.

import { useEffect, useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TintaxisLogo from "@/components/ui/TintaxisLogo";

// ─── TIER METADATA ────────────────────────────────────────────────────────────

const TIER_META: Record<
  string,
  { label: string; description: string; color: string; inks: string[] }
> = {
  codex: {
    label: "Codex",
    description:
      "One chapter at a time. Full reading surface, margin world, ink tools. The entry point to the archive.",
    color: "#C9A84C",
    inks: ["Ghost", "Ember"],
  },
  scribe: {
    label: "Scribe",
    description:
      "All chapters, all six inks. The complete reading experience — annotate, question, signal.",
    color: "#B87333",
    inks: ["Ghost", "Ember", "Copper", "Archive", "Memory"],
  },
  archive: {
    label: "Archive",
    description:
      "Everything in Scribe plus early access to new chapters and author whispers before they're public.",
    color: "#2E6B72",
    inks: ["Ghost", "Ember", "Copper", "Archive", "Memory", "Signal"],
  },
  chronicler: {
    label: "Chronicler",
    description:
      "Complete, unrestricted access to everything Tintaxis publishes — present and future.",
    color: "#6B3FA0",
    inks: ["All inks", "Priority Signal routing", "Chronicler archive"],
  },
};

const PLAN_LABELS: Record<string, string> = {
  read: "Single Read",
  keep: "Permanent Access",
  codex: "Codex — Monthly",
  scribe: "Scribe — Monthly",
  archive: "Archive — Monthly",
  chronicler: "Chronicler — Monthly",
};

// ─── SESSION TYPE ─────────────────────────────────────────────────────────────

interface ReaderSession {
  subscribed: boolean;
  role?: string;
  tier?: string | null;
  plan?: string | null;
  name?: string;
  type?: string;
  reason?: string;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

// ─── SUSPENSE WRAPPER ─────────────────────────────────────────────────────────
// Next.js 14 requires useSearchParams() to be inside a Suspense boundary.

export default function AccountPageShell() {
  return (
    <Suspense fallback={null}>
      <AccountPage />
    </Suspense>
  );
}

function AccountPage() {
  const [session, setSession] = useState<ReaderSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    fetch("/api/reader/session")
      .then((r) => r.json())
      .then((data: ReaderSession) => {
        setSession(data);
        setLoading(false);
      })
      .catch(() => {
        setSession({ subscribed: false });
        setLoading(false);
      });
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  const tier = session?.tier ?? null;
  const tierMeta = tier ? TIER_META[tier] : null;
  const planLabel = session?.plan ? (PLAN_LABELS[session.plan] ?? session.plan) : null;
  const isSubscription = session?.type === "subscription";
  const isOneTime = session?.type === "one-time";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0D0B08",
        color: "#F5E6C8",
        fontFamily: '"EB Garamond", Garamond, Georgia, serif',
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── NAV ──────────────────────────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.85rem clamp(1rem, 4vw, 2rem)",
          borderBottom: "1px solid rgba(201,168,76,0.07)",
          background: "rgba(13,11,8,0.9)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
          <TintaxisLogo size={22} />
          <span
            style={{
              fontFamily: '"EB Garamond", Garamond, Georgia, serif',
              fontSize: "0.875rem",
              letterSpacing: "0.1em",
              color: "rgba(245,230,200,0.65)",
            }}
          >
            Tintaxis
          </span>
        </Link>

        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.5rem",
            letterSpacing: "0.25em",
            color: "rgba(201,168,76,0.4)",
            textTransform: "uppercase",
          }}
        >
          Reader Vault
        </span>
      </nav>

      {/* ── BODY ─────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "6rem clamp(1.25rem, 5vw, 2.5rem) 4rem",
        }}
      >
        <AnimatePresence mode="wait">

          {/* Loading state */}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: "center" }}
            >
              <motion.div
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.55rem",
                  letterSpacing: "0.3em",
                  color: "rgba(201,168,76,0.5)",
                  textTransform: "uppercase",
                }}
              >
                Reading the archive…
              </motion.div>
            </motion.div>
          )}

          {/* Not subscribed / logged out */}
          {!loading && !session?.subscribed && (
            <motion.div
              key="no-access"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ textAlign: "center", maxWidth: "480px", width: "100%" }}
            >
              {/* Sigil */}
              <div style={{ marginBottom: "1.5rem", opacity: 0.3 }}>
                <TintaxisLogo size={48} />
              </div>

              <p
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.5rem",
                  letterSpacing: "0.3em",
                  color: "rgba(201,168,76,0.4)",
                  textTransform: "uppercase",
                  marginBottom: "1rem",
                }}
              >
                {session?.reason === "inactive"
                  ? "Subscription Inactive"
                  : "No Active Session"}
              </p>

              <h1
                style={{
                  fontSize: "clamp(1.5rem, 5vw, 2.2rem)",
                  fontWeight: 400,
                  fontStyle: "italic",
                  color: "rgba(245,230,200,0.5)",
                  marginBottom: "1rem",
                  lineHeight: 1.3,
                }}
              >
                {session?.reason === "inactive"
                  ? "Your access has lapsed."
                  : "The vault is sealed."}
              </h1>

              <p
                style={{
                  fontSize: "1rem",
                  fontStyle: "italic",
                  color: "rgba(245,230,200,0.3)",
                  marginBottom: "2.5rem",
                  lineHeight: 1.6,
                }}
              >
                {session?.reason === "inactive"
                  ? "A payment may have failed, or the subscription was cancelled. Renew to regain access to all chapters and ink."
                  : "You are not yet a reader of record. Open the archive to begin."}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
                <Link href="/chapter/one" style={{ textDecoration: "none" }}>
                  <BrassButton>Open the Archive</BrassButton>
                </Link>
                {session?.reason === "inactive" && (
                  <a href="/api/stripe/portal" style={{ textDecoration: "none" }}>
                    <GhostButton>Manage Billing →</GhostButton>
                  </a>
                )}
              </div>
            </motion.div>
          )}

          {/* Active reader session */}
          {!loading && session?.subscribed && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              style={{ width: "100%", maxWidth: "560px" }}
            >
              {/* Greeting */}
              <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
                <motion.div
                  animate={{
                    filter: [
                      "drop-shadow(0 0 6px rgba(201,168,76,0.2))",
                      "drop-shadow(0 0 16px rgba(201,168,76,0.4))",
                      "drop-shadow(0 0 6px rgba(201,168,76,0.2))",
                    ],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  style={{ display: "inline-block", marginBottom: "1.25rem" }}
                >
                  <TintaxisLogo size={40} />
                </motion.div>

                <p
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.5rem",
                    letterSpacing: "0.3em",
                    color: "rgba(201,168,76,0.45)",
                    textTransform: "uppercase",
                    marginBottom: "0.5rem",
                  }}
                >
                  Reader Vault
                </p>

                <h1
                  style={{
                    fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
                    fontWeight: 400,
                    fontStyle: "italic",
                    color: "rgba(245,230,200,0.85)",
                    lineHeight: 1.2,
                  }}
                >
                  Welcome back{session.name ? `, ${session.name.split(" ")[0]}` : ""}.
                </h1>
              </div>

              {/* Brass rule */}
              <div
                style={{
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(201,168,76,0.3) 30%, rgba(201,168,76,0.5) 50%, rgba(201,168,76,0.3) 70%, transparent)",
                  marginBottom: "2rem",
                }}
              />

              {/* Subscription card */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                style={{
                  border: `1px solid ${tierMeta ? tierMeta.color + "40" : "rgba(201,168,76,0.2)"}`,
                  borderRadius: "2px",
                  padding: "1.5rem",
                  background: "rgba(13,11,8,0.6)",
                  marginBottom: "1rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Tier glow strip */}
                {tierMeta && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "2px",
                      background: `linear-gradient(90deg, transparent, ${tierMeta.color}80, transparent)`,
                    }}
                  />
                )}

                {/* Status badge */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: "0.45rem",
                        letterSpacing: "0.25em",
                        color: "rgba(201,168,76,0.4)",
                        textTransform: "uppercase",
                        marginBottom: "0.3rem",
                      }}
                    >
                      Current Plan
                    </p>
                    <p
                      style={{
                        fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                        fontSize: "1.3rem",
                        fontStyle: "italic",
                        color: tierMeta?.color ?? "rgba(245,230,200,0.8)",
                      }}
                    >
                      {tierMeta?.label ?? planLabel ?? "Active Access"}
                    </p>
                  </div>

                  {/* Active pill */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "0.25rem 0.6rem",
                      border: "1px solid rgba(201,168,76,0.2)",
                      borderRadius: "20px",
                      background: "rgba(201,168,76,0.05)",
                    }}
                  >
                    <motion.div
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        backgroundColor: "#C9A84C",
                      }}
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <span
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: "0.45rem",
                        letterSpacing: "0.18em",
                        color: "rgba(201,168,76,0.7)",
                        textTransform: "uppercase",
                      }}
                    >
                      Active
                    </span>
                  </div>
                </div>

                {/* Tier description */}
                {tierMeta && (
                  <p
                    style={{
                      fontSize: "0.95rem",
                      fontStyle: "italic",
                      color: "rgba(245,230,200,0.45)",
                      lineHeight: 1.6,
                      marginBottom: "1.1rem",
                    }}
                  >
                    {tierMeta.description}
                  </p>
                )}

                {/* Ink access list */}
                {tierMeta && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.4rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {tierMeta.inks.map((ink) => (
                      <span
                        key={ink}
                        style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: "0.4rem",
                          letterSpacing: "0.12em",
                          color: tierMeta.color,
                          border: `1px solid ${tierMeta.color}30`,
                          borderRadius: "2px",
                          padding: "0.15rem 0.45rem",
                          textTransform: "uppercase",
                          background: `${tierMeta.color}08`,
                        }}
                      >
                        {ink} Ink
                      </span>
                    ))}
                  </div>
                )}

                {/* Plan type */}
                {planLabel && (
                  <p
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.42rem",
                      letterSpacing: "0.15em",
                      color: "rgba(201,168,76,0.25)",
                      textTransform: "uppercase",
                      marginTop: "0.75rem",
                    }}
                  >
                    {isSubscription ? "↻" : "⚿"} {planLabel}
                  </p>
                )}
              </motion.div>

              {/* Error messages */}
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.45rem",
                    letterSpacing: "0.1em",
                    color: "rgba(220,60,60,0.6)",
                    textAlign: "center",
                    marginBottom: "1rem",
                  }}
                >
                  {error === "no-billing"
                    ? "No billing record found. Contact support if this is unexpected."
                    : "Could not open billing portal. Try again shortly."}
                </motion.p>
              )}

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  marginTop: "0.5rem",
                }}
              >
                {/* Continue Reading */}
                <Link href="/chapter/one" style={{ textDecoration: "none" }}>
                  <BrassButton fullWidth>
                    Continue Reading →
                  </BrassButton>
                </Link>

                {/* Manage Billing — only for subscribers */}
                {isSubscription && (
                  <a href="/api/stripe/portal" style={{ textDecoration: "none" }}>
                    <GhostButton fullWidth>
                      Manage Billing · Cancel · Upgrade
                    </GhostButton>
                  </a>
                )}

                {/* Brass rule before sign out */}
                <div
                  style={{
                    height: "1px",
                    background: "rgba(201,168,76,0.08)",
                    margin: "0.25rem 0",
                  }}
                />

                {/* Sign out */}
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: signingOut ? "default" : "pointer",
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.45rem",
                    letterSpacing: "0.2em",
                    color: signingOut
                      ? "rgba(245,230,200,0.15)"
                      : "rgba(245,230,200,0.2)",
                    textTransform: "uppercase",
                    padding: "0.5rem",
                    textAlign: "center",
                    width: "100%",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!signingOut)
                      (e.target as HTMLButtonElement).style.color =
                        "rgba(245,230,200,0.45)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.color =
                      "rgba(245,230,200,0.2)";
                  }}
                >
                  {signingOut ? "Sealing the vault…" : "Sign out"}
                </button>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── BOTTOM STATUS ─────────────────────────────────────── */}
      {!loading && session?.subscribed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{
            textAlign: "center",
            padding: "1.5rem",
            borderTop: "1px solid rgba(201,168,76,0.06)",
          }}
        >
          <p
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.42rem",
              letterSpacing: "0.2em",
              color: "rgba(201,168,76,0.2)",
              textTransform: "uppercase",
            }}
          >
            Tintaxis · Inaugural Edition · The Hunt
          </p>
        </motion.div>
      )}
    </div>
  );
}

// ─── BUTTON COMPONENTS ────────────────────────────────────────────────────────

function BrassButton({
  children,
  fullWidth,
}: {
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <motion.div
      whileHover={{
        borderColor: "rgba(201,168,76,0.8)",
        boxShadow: "0 0 20px rgba(201,168,76,0.12)",
      }}
      style={{
        display: "block",
        width: fullWidth ? "100%" : "auto",
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "0.55rem",
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        color: "#C9A84C",
        border: "1px solid rgba(201,168,76,0.4)",
        padding: "0.9rem 2rem",
        textAlign: "center",
        cursor: "pointer",
        background: "transparent",
        transition: "all 0.3s ease",
        position: "relative",
      }}
    >
      {/* Corner accents */}
      <span
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "6px",
          height: "6px",
          borderTop: "1px solid #C9A84C",
          borderLeft: "1px solid #C9A84C",
        }}
      />
      <span
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "6px",
          height: "6px",
          borderTop: "1px solid #C9A84C",
          borderRight: "1px solid #C9A84C",
        }}
      />
      <span
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "6px",
          height: "6px",
          borderBottom: "1px solid #C9A84C",
          borderLeft: "1px solid #C9A84C",
        }}
      />
      <span
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "6px",
          height: "6px",
          borderBottom: "1px solid #C9A84C",
          borderRight: "1px solid #C9A84C",
        }}
      />
      {children}
    </motion.div>
  );
}

function GhostButton({
  children,
  fullWidth,
}: {
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <motion.div
      whileHover={{
        borderColor: "rgba(201,168,76,0.25)",
        color: "rgba(245,230,200,0.5)",
      }}
      style={{
        display: "block",
        width: fullWidth ? "100%" : "auto",
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "0.5rem",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "rgba(245,230,200,0.3)",
        border: "1px solid rgba(201,168,76,0.12)",
        padding: "0.8rem 2rem",
        textAlign: "center",
        cursor: "pointer",
        background: "transparent",
        transition: "all 0.3s ease",
      }}
    >
      {children}
    </motion.div>
  );
}
