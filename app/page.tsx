"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ScriptoriumLogo from "@/components/ui/ScriptoriumLogo";

// ─── INITIATION SCREEN ─────────────────────────────────────────────────────
// The entry point. The reader is not yet a reader — they are a supplicant.
// The platform reveals itself slowly. Awe before access.

const TAGLINE_LINES = [
  "A book is not a document.",
  "It is a living entity.",
  "You are about to read differently.",
];

const EDITION_TEXT = "INAUGURAL EDITION";
const SUBJECT_LINE = "THE LIFE OF ROBI DRACO ROSA";

// Mechanical boot-up sequence for the decorative UI chrome
const BOOT_LINES = [
  "ARCHIVE SYSTEM v2250.03 ... ONLINE",
  "INK CHAMBER PRESSURIZED ... READY",
  "MARGIN WORLD INITIALIZED ... STABLE",
  "QUESTION QUEUE OPEN ... LISTENING",
  "AUTHOR PRESENCE DETECTED ... STANDING BY",
];

export default function InitiationScreen() {
  const [phase, setPhase] = useState<"boot" | "title" | "ready">("boot");
  const [bootIndex, setBootIndex] = useState(0);
  const [titleVisible, setTitleVisible] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(-1);
  const [enterReady, setEnterReady] = useState(false);

  // Boot sequence
  useEffect(() => {
    if (phase !== "boot") return;

    const interval = setInterval(() => {
      setBootIndex((i) => {
        if (i >= BOOT_LINES.length - 1) {
          clearInterval(interval);
          setTimeout(() => setPhase("title"), 600);
          return i;
        }
        return i + 1;
      });
    }, 380);

    return () => clearInterval(interval);
  }, [phase]);

  // Title reveal sequence
  useEffect(() => {
    if (phase !== "title") return;

    const t1 = setTimeout(() => setTitleVisible(true), 100);
    const t2 = setTimeout(() => setTaglineIndex(0), 900);
    const t3 = setTimeout(() => setTaglineIndex(1), 1600);
    const t4 = setTimeout(() => setTaglineIndex(2), 2300);
    const t5 = setTimeout(() => {
      setPhase("ready");
      setEnterReady(true);
    }, 3400);

    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, [phase]);

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#0D0B08" }}
    >
      {/* ── BACKGROUND RADIAL GLOW ─────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(44,26,0,0.55) 0%, transparent 65%)",
        }}
      />

      {/* ── CORNER BRASS ORNAMENTS ────────────────────────────── */}
      <CornerOrnament position="top-left" />
      <CornerOrnament position="top-right" />
      <CornerOrnament position="bottom-left" />
      <CornerOrnament position="bottom-right" />

      {/* ── HORIZONTAL BRASS RULES ────────────────────────────── */}
      <div
        className="absolute top-16 left-16 right-16 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(201,168,76,0.4) 20%, rgba(201,168,76,0.6) 50%, rgba(201,168,76,0.4) 80%, transparent)",
        }}
      />
      <div
        className="absolute bottom-16 left-16 right-16 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(201,168,76,0.4) 20%, rgba(201,168,76,0.6) 50%, rgba(201,168,76,0.4) 80%, transparent)",
        }}
      />

      {/* ── BOOT SEQUENCE ─────────────────────────────────────── */}
      <AnimatePresence>
        {phase === "boot" && (
          <motion.div
            key="boot"
            className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-lg px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
            {BOOT_LINES.slice(0, bootIndex + 1).map((line, i) => (
              <motion.p
                key={line}
                className="font-mono text-xs mb-1"
                style={{
                  color: i === bootIndex ? "#C9A84C" : "rgba(201,168,76,0.35)",
                  letterSpacing: "0.12em",
                  fontFamily: '"JetBrains Mono", monospace',
                }}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
              >
                {">"} {line}
              </motion.p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ──────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-3xl w-full">

        {/* Edition label */}
        <AnimatePresence>
          {titleVisible && (
            <motion.p
              className="chapter-number mb-8 tracking-widest"
              style={{
                color: "rgba(201,168,76,0.6)",
                fontSize: "0.625rem",
                letterSpacing: "0.3em",
                fontFamily: '"JetBrains Mono", monospace',
              }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {EDITION_TEXT}
            </motion.p>
          )}
        </AnimatePresence>

        {/* THE SCRIPTORIUM sigil + wordmark */}
        <AnimatePresence>
          {titleVisible && (
            <motion.div
              className="relative mb-3 select-none flex flex-col items-center"
              initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.0, ease: [0.2, 0, 0.1, 1] }}
            >
              {/* Brass sigil — pulsing glow */}
              <motion.div
                className="mb-5"
                animate={{
                  filter: [
                    "drop-shadow(0 0 8px rgba(201,168,76,0.3))",
                    "drop-shadow(0 0 20px rgba(201,168,76,0.55))",
                    "drop-shadow(0 0 8px rgba(201,168,76,0.3))",
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <ScriptoriumLogo size={72} />
              </motion.div>

              <h1
                style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
                  fontWeight: 400,
                  letterSpacing: "0.12em",
                  lineHeight: 1,
                  color: "#F5E6C8",
                  textShadow:
                    "0 0 60px rgba(201,168,76,0.2), 0 2px 4px rgba(0,0,0,0.8)",
                }}
              >
                THE SCRIPTORIUM
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Brass rule under title */}
        <AnimatePresence>
          {titleVisible && (
            <motion.div
              className="mb-6"
              style={{ width: "100%", maxWidth: "420px" }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            >
              <div className="brass-line" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subject line */}
        <AnimatePresence>
          {titleVisible && (
            <motion.p
              className="mb-12"
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.7rem",
                letterSpacing: "0.22em",
                color: "rgba(201,168,76,0.75)",
                textTransform: "uppercase",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {SUBJECT_LINE}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Taglines */}
        <div className="mb-14 space-y-2 min-h-[5rem]">
          {TAGLINE_LINES.map((line, i) => (
            <AnimatePresence key={line}>
              {taglineIndex >= i && (
                <motion.p
                  style={{
                    fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                    fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
                    fontStyle: "italic",
                    color:
                      i === 2
                        ? "rgba(245,230,200,0.9)"
                        : "rgba(245,230,200,0.55)",
                    lineHeight: 1.5,
                  }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                >
                  {line}
                </motion.p>
              )}
            </AnimatePresence>
          ))}
        </div>

        {/* ENTER button */}
        <AnimatePresence>
          {enterReady && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Link href="/chapter/one" passHref>
                <motion.button
                  className="relative group"
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.7rem",
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: "#C9A84C",
                    background: "transparent",
                    border: "1px solid rgba(201,168,76,0.5)",
                    padding: "1rem 3rem",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  whileHover={{
                    borderColor: "rgba(201,168,76,0.9)",
                    boxShadow: "0 0 24px rgba(201,168,76,0.2)",
                    color: "#E8C97A",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Corner accents */}
                  <span
                    className="absolute top-0 left-0 w-2 h-2 border-t border-l"
                    style={{ borderColor: "#C9A84C" }}
                  />
                  <span
                    className="absolute top-0 right-0 w-2 h-2 border-t border-r"
                    style={{ borderColor: "#C9A84C" }}
                  />
                  <span
                    className="absolute bottom-0 left-0 w-2 h-2 border-b border-l"
                    style={{ borderColor: "#C9A84C" }}
                  />
                  <span
                    className="absolute bottom-0 right-0 w-2 h-2 border-b border-r"
                    style={{ borderColor: "#C9A84C" }}
                  />
                  OPEN THE ARCHIVE
                </motion.button>
              </Link>

              <motion.p
                className="mt-4 text-center"
                style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "0.8rem",
                  fontStyle: "italic",
                  color: "rgba(245,230,200,0.3)",
                  letterSpacing: "0.04em",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                First read. Unrepeatable.
              </motion.p>

              {/* ── Chapter index strip ── */}
              <motion.div
                className="mt-10"
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <ChapterIndexCard
                  number="I"
                  title="The Sound Before the Sound"
                  subtitle="San Juan, 1966–1978"
                  href="/chapter/one"
                  isLocked={false}
                />
                <ChapterIndexCard
                  number="II"
                  title="The Machine and the Ghost"
                  subtitle="New York / Los Angeles, 1984–1992"
                  href="/chapter/two"
                  isLocked={true}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── BOTTOM SYSTEM STATUS ──────────────────────────────── */}
      <AnimatePresence>
        {phase === "ready" && (
          <motion.div
            className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <StatusDot label="ARCHIVE" active />
            <StatusDot label="INK" active />
            <StatusDot label="MARGINS" active />
            <StatusDot label="AUTHOR" pulse />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function CornerOrnament({
  position,
}: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  const styles: Record<string, string> = {
    "top-left":     "top-8 left-8",
    "top-right":    "top-8 right-8",
    "bottom-left":  "bottom-8 left-8",
    "bottom-right": "bottom-8 right-8",
  };

  const rotate: Record<string, string> = {
    "top-left":     "rotate-0",
    "top-right":    "rotate-90",
    "bottom-left":  "-rotate-90",
    "bottom-right": "rotate-180",
  };

  return (
    <svg
      className={`absolute ${styles[position]} ${rotate[position]} opacity-40`}
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
    >
      <path
        d="M2 30 L2 2 L30 2"
        stroke="#C9A84C"
        strokeWidth="1"
        fill="none"
      />
      <path d="M2 10 L8 10" stroke="#C9A84C" strokeWidth="0.5" />
      <path d="M10 2 L10 8" stroke="#C9A84C" strokeWidth="0.5" />
      <circle cx="2" cy="2" r="1.5" fill="#C9A84C" />
    </svg>
  );
}

function StatusDot({ label, active, pulse }: { label: string; active?: boolean; pulse?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <motion.div
        className="w-1.5 h-1.5 rounded-full"
        style={{
          backgroundColor: pulse ? "#00E5CC" : active ? "#C9A84C" : "rgba(201,168,76,0.3)",
        }}
        animate={pulse ? { opacity: [1, 0.3, 1] } : undefined}
        transition={pulse ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : undefined}
      />
      <span
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.55rem",
          letterSpacing: "0.18em",
          color: active || pulse ? "rgba(201,168,76,0.6)" : "rgba(201,168,76,0.25)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── CHAPTER INDEX CARD ───────────────────────────────────────────────────────
// Small chapter preview cards on the initiation screen.
// Locked chapters show a seal indicator.

function ChapterIndexCard({
  number,
  title,
  subtitle,
  href,
  isLocked,
}: {
  number: string;
  title: string;
  subtitle: string;
  href: string;
  isLocked: boolean;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <motion.div
        style={{
          width: "200px",
          padding: "0.9rem 1rem",
          border: isLocked
            ? "1px solid rgba(201,168,76,0.12)"
            : "1px solid rgba(201,168,76,0.28)",
          borderRadius: "1px",
          background: isLocked
            ? "rgba(13,11,8,0.4)"
            : "rgba(201,168,76,0.04)",
          cursor: "pointer",
          textAlign: "left",
          position: "relative",
          overflow: "hidden",
        }}
        whileHover={
          isLocked
            ? { borderColor: "rgba(201,168,76,0.22)" }
            : {
                borderColor: "rgba(201,168,76,0.5)",
                background: "rgba(201,168,76,0.07)",
              }
        }
        transition={{ duration: 0.2 }}
      >
        {/* Chapter number */}
        <p
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.5rem",
            letterSpacing: "0.25em",
            color: isLocked ? "rgba(201,168,76,0.3)" : "rgba(201,168,76,0.6)",
            textTransform: "uppercase",
            marginBottom: "0.3rem",
          }}
        >
          {isLocked ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              CHAPTER {number}
              <span style={{ fontSize: "0.6rem" }}>⚿</span>
            </span>
          ) : (
            `CHAPTER ${number}`
          )}
        </p>

        {/* Title */}
        <p
          style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "0.9rem",
            fontStyle: "italic",
            color: isLocked ? "rgba(245,230,200,0.25)" : "rgba(245,230,200,0.75)",
            lineHeight: 1.3,
            marginBottom: "0.25rem",
          }}
        >
          {title}
        </p>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.5rem",
            letterSpacing: "0.1em",
            color: isLocked ? "rgba(201,168,76,0.2)" : "rgba(201,168,76,0.4)",
            textTransform: "uppercase",
          }}
        >
          {subtitle}
        </p>

        {/* Locked overlay stripe */}
        {isLocked && (
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              padding: "0.15rem 0.35rem",
              background: "rgba(201,168,76,0.06)",
              borderLeft: "1px solid rgba(201,168,76,0.1)",
              borderBottom: "1px solid rgba(201,168,76,0.1)",
            }}
          >
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.45rem",
                letterSpacing: "0.15em",
                color: "rgba(201,168,76,0.3)",
                textTransform: "uppercase",
              }}
            >
              SEALED
            </span>
          </div>
        )}
      </motion.div>
    </Link>
  );
}
