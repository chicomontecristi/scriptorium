"use client";

import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TintaxisLogo from "@/components/ui/TintaxisLogo";

// ─── TYPES ─────────────────────────────────────────────────────────────────────
interface SignalQuestion {
  id: string;
  readerEmail: string;
  chapterSlug: string;
  chapterTitle: string;
  anchorText: string;
  question: string;
  askedAt: string;
  answered: boolean;
  reply?: string;
}

interface WhisperEntry {
  id: string;
  chapterSlug: string;
  chapterTitle: string;
  anchorText: string;
  whisper: string;
  createdAt: string;
}

interface ChapterStat {
  slug: string;
  number: number;
  title: string;
  isLocked: boolean;
  wordCount: number;
  reads: number;
  avgDepth: number; // 0–100
  signals: number;
}

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
// Phase 2: replace with live Supabase queries
const MOCK_SIGNALS: SignalQuestion[] = [
  {
    id: "s1",
    readerEmail: "m.larios@icloud.com",
    chapterSlug: "one",
    chapterTitle: "What Robbin Told Alma",
    anchorText: "her blood had dripped for hours by the time Bryant made it to the room",
    question: "Did you write this scene last? It reads like the whole chapter was building toward it.",
    askedAt: "2026-03-18T14:22:00Z",
    answered: false,
  },
  {
    id: "s2",
    readerEmail: "teodora.v@gmail.com",
    chapterSlug: "one",
    chapterTitle: "What Robbin Told Alma",
    anchorText: "Robbin was a fat slob, a careless waste",
    question: "This self-description inside Robbin's narration — is she aware she's describing herself?",
    askedAt: "2026-03-17T09:11:00Z",
    answered: true,
    reply: "Yes — deliberately. Robbin narrates herself the way the town would, because she's internalized it. She's both the gossip and the subject of it.",
  },
  {
    id: "s3",
    readerEmail: "k.santos@proton.me",
    chapterSlug: "one",
    chapterTitle: "What Robbin Told Alma",
    anchorText: "her hands, face and dress were stained with blood",
    question: "At this point I assumed Michelle did it. Was that intentional misdirection?",
    askedAt: "2026-03-16T20:47:00Z",
    answered: false,
  },
];

const MOCK_WHISPERS: WhisperEntry[] = [
  {
    id: "w1",
    chapterSlug: "one",
    chapterTitle: "What Robbin Told Alma",
    anchorText: "Robbin sat with the new nurse, Alma Mae",
    whisper: "The diner was real. I ate lunch there twice, in a town outside Rochester, in 2011. I never went back but I kept the menu in my head.",
    createdAt: "2026-03-15T10:00:00Z",
  },
];

const MOCK_CHAPTERS: ChapterStat[] = [
  { slug: "one",   number: 1, title: "What Robbin Told Alma",        isLocked: false, wordCount: 3378, reads: 142, avgDepth: 87, signals: 3 },
  { slug: "two",   number: 2, title: "Corridor B",                   isLocked: true,  wordCount: 3102, reads: 0,   avgDepth: 0,  signals: 0 },
  { slug: "three", number: 3, title: "Regular Hours",                 isLocked: true,  wordCount: 2890, reads: 0,   avgDepth: 0,  signals: 0 },
  { slug: "four",  number: 4, title: "The Smell of Coffee and Syrup", isLocked: true,  wordCount: 3540, reads: 0,   avgDepth: 0,  signals: 0 },
  { slug: "five",  number: 5, title: "What Blood Requires",           isLocked: true,  wordCount: 3200, reads: 0,   avgDepth: 0,  signals: 0 },
  { slug: "six",   number: 6, title: "The Stories People Tell",       isLocked: true,  wordCount: 3100, reads: 0,   avgDepth: 0,  signals: 0 },
  { slug: "seven", number: 7, title: "Once Again",                    isLocked: true,  wordCount: 4793, reads: 0,   avgDepth: 0,  signals: 0 },
];

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DepthBar({ value }: { value: number }) {
  return (
    <div
      style={{
        height: "3px",
        background: "rgba(201,168,76,0.1)",
        borderRadius: "2px",
        overflow: "hidden",
        width: "80px",
        display: "inline-block",
        verticalAlign: "middle",
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          height: "100%",
          background: `rgba(201,168,76,${0.3 + (value / 100) * 0.6})`,
          borderRadius: "2px",
        }}
      />
    </div>
  );
}

function BrassRule({ opacity = 0.15 }: { opacity?: number }) {
  return (
    <div
      style={{
        height: "1px",
        background: `linear-gradient(90deg, transparent, rgba(201,168,76,${opacity}), transparent)`,
        margin: "1.5rem 0",
      }}
    />
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <p
      style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "0.48rem",
        letterSpacing: "0.35em",
        color: "rgba(201,168,76,0.4)",
        textTransform: "uppercase",
        marginBottom: "1.25rem",
      }}
    >
      {label}
    </p>
  );
}

// ─── SIGNAL QUESTION CARD ──────────────────────────────────────────────────────
function SignalCard({ signal, onReply }: { signal: SignalQuestion; onReply: (id: string, reply: string) => void }) {
  const [composing, setComposing] = useState(false);
  const [replyText, setReplyText] = useState(signal.reply ?? "");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply(signal.id, replyText.trim());
    setComposing(false);
  };

  return (
    <motion.div
      layout
      style={{
        border: `1px solid ${signal.answered ? "rgba(201,168,76,0.1)" : "rgba(201,168,76,0.22)"}`,
        padding: "1.5rem",
        position: "relative",
        marginBottom: "1rem",
        background: signal.answered ? "transparent" : "rgba(201,168,76,0.015)",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
        <div>
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.48rem",
              letterSpacing: "0.15em",
              color: signal.answered ? "rgba(201,168,76,0.25)" : "rgba(201,168,76,0.6)",
              textTransform: "uppercase",
              marginRight: "0.75rem",
            }}
          >
            Ch. {signal.chapterTitle}
          </span>
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.44rem",
              letterSpacing: "0.1em",
              color: "rgba(245,230,200,0.2)",
            }}
          >
            {signal.readerEmail} · {formatDate(signal.askedAt)}
          </span>
        </div>
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.44rem",
            letterSpacing: "0.15em",
            color: signal.answered ? "rgba(201,168,76,0.3)" : "rgba(201,168,76,0.7)",
            textTransform: "uppercase",
          }}
        >
          {signal.answered ? "✓ REPLIED" : "OPEN"}
        </span>
      </div>

      {/* Anchor text */}
      <p
        style={{
          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
          fontSize: "0.85rem",
          fontStyle: "italic",
          color: "rgba(245,230,200,0.35)",
          marginBottom: "0.6rem",
          borderLeft: "2px solid rgba(201,168,76,0.2)",
          paddingLeft: "0.75rem",
        }}
      >
        "…{signal.anchorText}…"
      </p>

      {/* Question */}
      <p
        style={{
          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
          fontSize: "1rem",
          lineHeight: 1.65,
          color: "rgba(245,230,200,0.75)",
          marginBottom: signal.answered || composing ? "1rem" : "0",
        }}
      >
        {signal.question}
      </p>

      {/* Existing reply */}
      {signal.answered && signal.reply && (
        <div
          style={{
            borderLeft: "2px solid rgba(201,168,76,0.25)",
            paddingLeft: "0.75rem",
            marginBottom: composing ? "1rem" : "0",
          }}
        >
          <p
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.44rem",
              letterSpacing: "0.15em",
              color: "rgba(201,168,76,0.35)",
              textTransform: "uppercase",
              marginBottom: "0.35rem",
            }}
          >
            Your reply
          </p>
          <p
            style={{
              fontFamily: '"EB Garamond", Garamond, Georgia, serif',
              fontSize: "0.9rem",
              lineHeight: 1.65,
              color: "rgba(245,230,200,0.5)",
              fontStyle: "italic",
            }}
          >
            {signal.reply}
          </p>
        </div>
      )}

      {/* Compose / reply UI */}
      <AnimatePresence>
        {composing && (
          <motion.form
            key="compose"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            style={{ overflow: "hidden" }}
          >
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              autoFocus
              rows={3}
              placeholder="Write your reply…"
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(201,168,76,0.2)",
                padding: "0.65rem 0.75rem",
                color: "#F5E6C8",
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "0.95rem",
                lineHeight: 1.65,
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
                marginBottom: "0.75rem",
              }}
            />
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <motion.button
                type="submit"
                whileHover={{ borderColor: "rgba(201,168,76,0.6)" }}
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.5rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#C9A84C",
                  background: "transparent",
                  border: "1px solid rgba(201,168,76,0.3)",
                  padding: "0.5rem 1.25rem",
                  cursor: "pointer",
                }}
              >
                Send Reply
              </motion.button>
              <button
                type="button"
                onClick={() => setComposing(false)}
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.5rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "rgba(245,230,200,0.25)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.5rem",
                }}
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reply button */}
      {!composing && (
        <div style={{ marginTop: "0.75rem" }}>
          <button
            onClick={() => setComposing(true)}
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.46rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: signal.answered ? "rgba(201,168,76,0.25)" : "rgba(201,168,76,0.55)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {signal.answered ? "Edit reply →" : "Reply →"}
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── MAIN DASHBOARD ────────────────────────────────────────────────────────────
type DashTab = "signals" | "whispers" | "chapters" | "analytics";

interface LiveStats {
  readers: { total: number; active: number; byTier: Record<string, number> };
  stripe: {
    balance: { available: number; pending: number; currency: string };
    recentCharges: { amount: number; description: string | null; created: number }[];
  };
}

export default function AuthorDashboard() {
  const [activeTab, setActiveTab] = useState<DashTab>("signals");
  const [signals, setSignals] = useState<SignalQuestion[]>([]);
  const [whispers, setWhispers] = useState<WhisperEntry[]>(MOCK_WHISPERS);
  const [whisperForm, setWhisperForm] = useState({ chapterSlug: "one", anchorText: "", whisper: "" });
  const [whisperStatus, setWhisperStatus] = useState<"idle" | "saved">("idle");
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Fetch live data on mount ───────────────────────────────────────────────
  useEffect(() => {
    // Fetch signals
    fetch("/api/author/signals")
      .then((r) => r.json())
      .then((data) => {
        if (data.signals) {
          // Map DB shape to local shape
          setSignals(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data.signals.map((s: any) => ({
              id:           s.id,
              readerEmail:  s.reader_email ?? "anonymous",
              chapterSlug:  s.chapter_slug,
              chapterTitle: s.chapter_title ?? s.chapter_slug,
              anchorText:   s.selected_text ?? "",
              question:     s.question,
              askedAt:      s.created_at,
              answered:     s.answered,
              reply:        s.reply ?? undefined,
            }))
          );
        } else {
          // No DB yet — fall back to mock so the UI isn't empty
          setSignals(MOCK_SIGNALS);
        }
      })
      .catch(() => setSignals(MOCK_SIGNALS));

    // Fetch reader + Stripe stats
    fetch("/api/author/stats")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setStats(data);
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  const openSignals = signals.filter((s) => !s.answered);
  const answeredSignals = signals.filter((s) => s.answered);

  const handleReply = async (id: string, reply: string) => {
    // Optimistic update
    setSignals((prev) =>
      prev.map((s) => (s.id === id ? { ...s, answered: true, reply } : s))
    );
    // Persist to Supabase
    try {
      await fetch(`/api/author/signals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      });
    } catch (err) {
      console.error("[dashboard] reply persist failed:", err);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/author/login";
  };

  const handleAddWhisper = (e: FormEvent) => {
    e.preventDefault();
    if (!whisperForm.anchorText.trim() || !whisperForm.whisper.trim()) return;
    const chapter = MOCK_CHAPTERS.find((c) => c.slug === whisperForm.chapterSlug);
    const newWhisper: WhisperEntry = {
      id: `w${Date.now()}`,
      chapterSlug: whisperForm.chapterSlug,
      chapterTitle: chapter?.title ?? whisperForm.chapterSlug,
      anchorText: whisperForm.anchorText,
      whisper: whisperForm.whisper,
      createdAt: new Date().toISOString(),
    };
    setWhispers((prev) => [newWhisper, ...prev]);
    setWhisperForm((prev) => ({ ...prev, anchorText: "", whisper: "" }));
    setWhisperStatus("saved");
    setTimeout(() => setWhisperStatus("idle"), 2000);
  };

  const TABS: { id: DashTab; label: string; badge?: number }[] = [
    { id: "signals",   label: "SIGNALS",   badge: openSignals.length || undefined },
    { id: "whispers",  label: "WHISPERS" },
    { id: "chapters",  label: "CHAPTERS" },
    { id: "analytics", label: "ANALYTICS" },
  ];

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(201,168,76,0.15)",
    padding: "0.6rem 0.8rem",
    color: "#F5E6C8",
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: "0.78rem",
    outline: "none",
    borderRadius: "1px",
    boxSizing: "border-box" as const,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: "0.46rem",
    letterSpacing: "0.2em",
    color: "rgba(245,230,200,0.3)",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "0.4rem",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D0B08", color: "#F5E6C8" }}>
      {/* Background glow */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background: "radial-gradient(ellipse at 60% 0%, rgba(44,26,0,0.3) 0%, transparent 55%)",
          zIndex: 0,
        }}
      />

      {/* ── TOP BAR ──────────────────────────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid rgba(201,168,76,0.1)",
          background: "rgba(13,11,8,0.96)",
          backdropFilter: "blur(8px)",
          padding: "0.85rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <TintaxisLogo size={22} />
          <div>
            <p
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.48rem",
                letterSpacing: "0.3em",
                color: "rgba(201,168,76,0.5)",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              TINTAXIS
            </p>
            <p
              style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "0.8rem",
                fontStyle: "italic",
                color: "rgba(245,230,200,0.3)",
              }}
            >
              Author Studio
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.46rem",
              letterSpacing: "0.15em",
              color: "rgba(245,230,200,0.25)",
              textTransform: "uppercase",
            }}
          >
            Chico Montecristi
          </span>
          <button
            onClick={handleLogout}
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.46rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(201,168,76,0.25)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "960px", margin: "0 auto", padding: "2.5rem 2rem" }}>

        {/* Work title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: "2rem" }}
        >
          <p
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.46rem",
              letterSpacing: "0.3em",
              color: "rgba(201,168,76,0.35)",
              textTransform: "uppercase",
              marginBottom: "0.25rem",
            }}
          >
            ACTIVE WORK
          </p>
          <h1
            style={{
              fontFamily: '"EB Garamond", Garamond, Georgia, serif',
              fontSize: "1.8rem",
              fontWeight: 400,
              color: "rgba(245,230,200,0.85)",
              marginBottom: "0.1rem",
            }}
          >
            The Hunt
          </h1>
          <p
            style={{
              fontFamily: '"EB Garamond", Garamond, Georgia, serif',
              fontSize: "0.9rem",
              fontStyle: "italic",
              color: "rgba(245,230,200,0.3)",
            }}
          >
            Novella · 25,003 words · 7 chapters · 1 unlocked
          </p>
        </motion.div>

        {/* ── STAT STRIP ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1px",
            border: "1px solid rgba(201,168,76,0.12)",
            marginBottom: "2.5rem",
          }}
        >
          {[
            {
              label: "Active Readers",
              value: statsLoading ? "—" : String(stats?.readers.active ?? 0),
            },
            {
              label: "Revenue (USD)",
              value: statsLoading
                ? "—"
                : stats
                ? `$${(((stats.stripe.balance.available + stats.stripe.balance.pending) / 100)
                    .toFixed(0))}`
                : "$0",
            },
            { label: "Open Signals", value: String(openSignals.length) },
            { label: "Whispers", value: String(whispers.length) },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                padding: "1.25rem 1.5rem",
                borderRight: i < 3 ? "1px solid rgba(201,168,76,0.12)" : "none",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "2rem",
                  fontWeight: 400,
                  color: "rgba(201,168,76,0.8)",
                  lineHeight: 1,
                  marginBottom: "0.3rem",
                }}
              >
                {stat.value}
              </p>
              <p
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.44rem",
                  letterSpacing: "0.2em",
                  color: "rgba(245,230,200,0.25)",
                  textTransform: "uppercase",
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* ── TABS ────────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: "0",
            borderBottom: "1px solid rgba(201,168,76,0.12)",
            marginBottom: "2rem",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.48rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: activeTab === tab.id ? "#C9A84C" : "rgba(245,230,200,0.2)",
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab.id ? "1px solid #C9A84C" : "1px solid transparent",
                padding: "0.75rem 1.25rem",
                cursor: "pointer",
                marginBottom: "-1px",
                position: "relative",
                transition: "color 0.2s",
              }}
            >
              {tab.label}
              {tab.badge ? (
                <span
                  style={{
                    marginLeft: "0.5rem",
                    background: "rgba(201,168,76,0.2)",
                    color: "#C9A84C",
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.44rem",
                    padding: "0.1rem 0.4rem",
                    borderRadius: "2px",
                  }}
                >
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT ─────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">

          {/* SIGNALS TAB */}
          {activeTab === "signals" && (
            <motion.div
              key="signals"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {openSignals.length > 0 && (
                <>
                  <SectionHeader label={`Open · ${openSignals.length}`} />
                  {openSignals.map((s) => (
                    <SignalCard key={s.id} signal={s} onReply={handleReply} />
                  ))}
                  <BrassRule />
                </>
              )}

              {answeredSignals.length > 0 && (
                <>
                  <SectionHeader label={`Replied · ${answeredSignals.length}`} />
                  {answeredSignals.map((s) => (
                    <SignalCard key={s.id} signal={s} onReply={handleReply} />
                  ))}
                </>
              )}

              {signals.length === 0 && (
                <p
                  style={{
                    fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                    fontSize: "1rem",
                    fontStyle: "italic",
                    color: "rgba(245,230,200,0.25)",
                    textAlign: "center",
                    paddingTop: "3rem",
                  }}
                >
                  No signal questions yet. They arrive as readers engage.
                </p>
              )}
            </motion.div>
          )}

          {/* WHISPERS TAB */}
          {activeTab === "whispers" && (
            <motion.div
              key="whispers"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Compose form */}
              <div
                style={{
                  border: "1px solid rgba(201,168,76,0.18)",
                  padding: "1.75rem",
                  marginBottom: "2rem",
                  position: "relative",
                }}
              >
                <SectionHeader label="New Whisper" />
                <form onSubmit={handleAddWhisper}>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={labelStyle}>Chapter</label>
                    <select
                      value={whisperForm.chapterSlug}
                      onChange={(e) => setWhisperForm((p) => ({ ...p, chapterSlug: e.target.value }))}
                      style={{ ...inputStyle, appearance: "none" }}
                    >
                      {MOCK_CHAPTERS.map((ch) => (
                        <option key={ch.slug} value={ch.slug}>
                          {ch.number}. {ch.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={labelStyle}>Anchor — paste the exact phrase from the text</label>
                    <input
                      type="text"
                      value={whisperForm.anchorText}
                      onChange={(e) => setWhisperForm((p) => ({ ...p, anchorText: e.target.value }))}
                      placeholder="e.g. the sunlight pierced through the windows"
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.4)")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.15)")}
                    />
                  </div>
                  <div style={{ marginBottom: "1.25rem" }}>
                    <label style={labelStyle}>Whisper</label>
                    <textarea
                      value={whisperForm.whisper}
                      onChange={(e) => setWhisperForm((p) => ({ ...p, whisper: e.target.value }))}
                      rows={3}
                      placeholder="What do you want verified readers to know about this passage?"
                      style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65,
                        fontFamily: '"EB Garamond", Garamond, Georgia, serif', fontSize: "0.95rem" }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.4)")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.15)")}
                    />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ borderColor: "rgba(201,168,76,0.6)" }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.52rem",
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: whisperStatus === "saved" ? "rgba(201,168,76,0.4)" : "#C9A84C",
                      background: "transparent",
                      border: "1px solid rgba(201,168,76,0.3)",
                      padding: "0.65rem 1.5rem",
                      cursor: "pointer",
                    }}
                  >
                    {whisperStatus === "saved" ? "✓ SAVED" : "ADD WHISPER"}
                  </motion.button>
                </form>
              </div>

              {/* Existing whispers */}
              <SectionHeader label={`Placed · ${whispers.length}`} />
              {whispers.map((w) => (
                <motion.div
                  key={w.id}
                  layout
                  style={{
                    border: "1px solid rgba(201,168,76,0.1)",
                    padding: "1.25rem 1.5rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: "0.44rem",
                        letterSpacing: "0.15em",
                        color: "rgba(201,168,76,0.35)",
                        textTransform: "uppercase",
                      }}
                    >
                      {w.chapterTitle}
                    </span>
                    <span
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: "0.44rem",
                        color: "rgba(245,230,200,0.2)",
                      }}
                    >
                      {formatDate(w.createdAt)}
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                      fontSize: "0.85rem",
                      fontStyle: "italic",
                      color: "rgba(245,230,200,0.3)",
                      marginBottom: "0.5rem",
                      borderLeft: "2px solid rgba(201,168,76,0.15)",
                      paddingLeft: "0.65rem",
                    }}
                  >
                    "…{w.anchorText}…"
                  </p>
                  <p
                    style={{
                      fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                      fontSize: "0.95rem",
                      lineHeight: 1.65,
                      color: "rgba(245,230,200,0.6)",
                    }}
                  >
                    {w.whisper}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* CHAPTERS TAB */}
          {activeTab === "chapters" && (
            <motion.div
              key="chapters"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <SectionHeader label="Chapter Index" />
              <div
                style={{
                  border: "1px solid rgba(201,168,76,0.1)",
                  overflow: "hidden",
                }}
              >
                {MOCK_CHAPTERS.map((ch, i) => (
                  <div
                    key={ch.slug}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.5rem 1fr auto",
                      alignItems: "center",
                      gap: "1.5rem",
                      padding: "1rem 1.5rem",
                      borderBottom: i < MOCK_CHAPTERS.length - 1 ? "1px solid rgba(201,168,76,0.08)" : "none",
                      background: ch.isLocked ? "transparent" : "rgba(201,168,76,0.02)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: "0.5rem",
                        color: "rgba(201,168,76,0.3)",
                        textAlign: "center",
                      }}
                    >
                      {ch.number}
                    </span>
                    <div>
                      <p
                        style={{
                          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                          fontSize: "1rem",
                          color: ch.isLocked ? "rgba(245,230,200,0.35)" : "rgba(245,230,200,0.8)",
                          marginBottom: "0.1rem",
                        }}
                      >
                        {ch.title}
                      </p>
                      <p
                        style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: "0.43rem",
                          color: "rgba(245,230,200,0.2)",
                          letterSpacing: "0.1em",
                        }}
                      >
                        {ch.wordCount.toLocaleString()} words
                      </p>
                    </div>
                    <span
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: "0.43rem",
                        letterSpacing: "0.15em",
                        color: ch.isLocked ? "rgba(245,230,200,0.15)" : "rgba(201,168,76,0.4)",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ch.isLocked ? "⚿ LOCKED" : "◉ LIVE"}
                    </span>
                    <span
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: "0.43rem",
                        color: "rgba(245,230,200,0.2)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ch.reads > 0 ? `${ch.reads} reads` : "—"}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", whiteSpace: "nowrap" }}>
                      {ch.avgDepth > 0 && <DepthBar value={ch.avgDepth} />}
                      <span
                        style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: "0.43rem",
                          color: "rgba(245,230,200,0.2)",
                        }}
                      >
                        {ch.avgDepth > 0 ? `${ch.avgDepth}%` : "—"}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
              <p
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.44rem",
                  letterSpacing: "0.15em",
                  color: "rgba(245,230,200,0.15)",
                  textTransform: "uppercase",
                  textAlign: "center",
                  marginTop: "1rem",
                }}
              >
                To unlock a chapter — contact Tintaxis or update chapters.ts directly
              </p>
            </motion.div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <SectionHeader label="Reading Intelligence" />

              {/* Depth visualization */}
              <div
                style={{
                  border: "1px solid rgba(201,168,76,0.12)",
                  padding: "2rem",
                  marginBottom: "1.5rem",
                }}
              >
                <p
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.46rem",
                    letterSpacing: "0.2em",
                    color: "rgba(201,168,76,0.4)",
                    textTransform: "uppercase",
                    marginBottom: "1.5rem",
                  }}
                >
                  Chapter One — Paragraph Depth Map
                </p>

                {/* Simulated depth bars for Ch. 1 */}
                <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "80px", marginBottom: "0.75rem" }}>
                  {[100,100,98,97,95,96,94,92,93,90,91,92,88,90,87,86,89,85,84,82,80,83,78,76,75,77,73,70,68,65,62,58,55,52,50,48,45,42,38,35,32,28,25,22,18,15,12,10,8,6].map((v, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${v}%` }}
                      transition={{ duration: 0.4, delay: i * 0.012 }}
                      style={{
                        flex: 1,
                        background: `rgba(201,168,76,${0.15 + (v / 100) * 0.6})`,
                        borderRadius: "1px 1px 0 0",
                        minWidth: "2px",
                      }}
                    />
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.42rem",
                      color: "rgba(245,230,200,0.2)",
                    }}
                  >
                    PARAGRAPH 1
                  </span>
                  <span
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.42rem",
                      color: "rgba(245,230,200,0.2)",
                    }}
                  >
                    PARAGRAPH 50
                  </span>
                </div>

                <p
                  style={{
                    fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                    fontSize: "0.85rem",
                    fontStyle: "italic",
                    color: "rgba(245,230,200,0.3)",
                    marginTop: "1rem",
                  }}
                >
                  Readers sustain deep engagement through paragraph 28 before attrition accelerates.
                  The cliff occurs at the description of Bryant's arrival — a natural chapter climax.
                </p>
              </div>

              {/* Summary stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "1px",
                  border: "1px solid rgba(201,168,76,0.1)",
                }}
              >
                {[
                  { label: "Avg. Read Time", value: "14 min", sub: "Chapter One" },
                  { label: "Completion Rate", value: "61%", sub: "reach final paragraph" },
                  { label: "Return Rate", value: "38%", sub: "opened more than once" },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "1.5rem",
                      borderRight: i < 2 ? "1px solid rgba(201,168,76,0.1)" : "none",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                        fontSize: "1.75rem",
                        color: "rgba(201,168,76,0.7)",
                        lineHeight: 1,
                        marginBottom: "0.35rem",
                      }}
                    >
                      {s.value}
                    </p>
                    <p
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: "0.44rem",
                        letterSpacing: "0.15em",
                        color: "rgba(245,230,200,0.2)",
                        textTransform: "uppercase",
                        marginBottom: "0.2rem",
                      }}
                    >
                      {s.label}
                    </p>
                    <p
                      style={{
                        fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                        fontSize: "0.75rem",
                        fontStyle: "italic",
                        color: "rgba(245,230,200,0.15)",
                      }}
                    >
                      {s.sub}
                    </p>
                  </div>
                ))}
              </div>

              {/* ── Reader Tier Breakdown (live) ──────────────────────── */}
              <div
                style={{
                  border: "1px solid rgba(201,168,76,0.12)",
                  marginTop: "1.5rem",
                }}
              >
                <div
                  style={{
                    padding: "1.25rem 2rem 1rem",
                    borderBottom: "1px solid rgba(201,168,76,0.08)",
                  }}
                >
                  <p
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.46rem",
                      letterSpacing: "0.2em",
                      color: "rgba(201,168,76,0.4)",
                      textTransform: "uppercase",
                    }}
                  >
                    Readers by Tier
                  </p>
                </div>

                {(["codex", "scribe", "archive", "chronicler"] as const).map((tier, i, arr) => {
                  const count = stats?.readers.byTier[tier] ?? 0;
                  const total = stats?.readers.active ?? 0;
                  const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
                  const tierLabels: Record<string, string> = {
                    codex:       "Codex",
                    scribe:      "Scribe",
                    archive:     "Archive",
                    chronicler:  "Chronicler",
                  };
                  return (
                    <div
                      key={tier}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "90px 1fr 48px 48px",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "1rem 2rem",
                        borderBottom: i < arr.length - 1 ? "1px solid rgba(201,168,76,0.06)" : "none",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: "0.46rem",
                          letterSpacing: "0.15em",
                          color: "rgba(245,230,200,0.35)",
                          textTransform: "uppercase",
                        }}
                      >
                        {tierLabels[tier]}
                      </p>

                      {/* Fill bar */}
                      <div
                        style={{
                          height: "2px",
                          background: "rgba(201,168,76,0.08)",
                          borderRadius: "1px",
                          overflow: "hidden",
                        }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.08 }}
                          style={{
                            height: "100%",
                            background: statsLoading
                              ? "rgba(201,168,76,0.15)"
                              : `rgba(201,168,76,${0.25 + (pct / 100) * 0.55})`,
                            borderRadius: "1px",
                          }}
                        />
                      </div>

                      <p
                        style={{
                          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                          fontSize: "1.1rem",
                          color: "rgba(201,168,76,0.65)",
                          textAlign: "right",
                          lineHeight: 1,
                        }}
                      >
                        {statsLoading ? "—" : count}
                      </p>

                      <p
                        style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: "0.42rem",
                          color: "rgba(245,230,200,0.18)",
                          textAlign: "right",
                        }}
                      >
                        {statsLoading ? "" : `${pct}%`}
                      </p>
                    </div>
                  );
                })}

                <div
                  style={{
                    padding: "0.75rem 2rem",
                    borderTop: "1px solid rgba(201,168,76,0.08)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <p
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.43rem",
                      letterSpacing: "0.12em",
                      color: "rgba(245,230,200,0.15)",
                      textTransform: "uppercase",
                    }}
                  >
                    Total active
                  </p>
                  <p
                    style={{
                      fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                      fontSize: "1rem",
                      color: "rgba(201,168,76,0.4)",
                    }}
                  >
                    {statsLoading ? "—" : (stats?.readers.active ?? 0)}
                  </p>
                </div>
              </div>

              <p
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.43rem",
                  letterSpacing: "0.15em",
                  color: "rgba(245,230,200,0.12)",
                  textTransform: "uppercase",
                  textAlign: "center",
                  marginTop: "1rem",
                }}
              >
                Live analytics · Chapters 2–7 unlock when published
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
