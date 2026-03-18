"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { Chapter } from "@/lib/types";
import ReadingSurface from "@/components/reading/ReadingSurface";
import ScriptoriumLogo from "@/components/ui/ScriptoriumLogo";

// ─── CHAPTER PAGE CLIENT ─────────────────────────────────────────────────────
// Handles the mechanical iris open transition, then mounts the reading surface.
// If the chapter is locked, renders the Sealed Chamber instead.

interface Props {
  chapter: Chapter;
}

export default function ChapterPageClient({ chapter }: Props) {
  const [transitionDone, setTransitionDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTransitionDone(true), 900);
    return () => clearTimeout(timer);
  }, []);

  // ── Locked chapter — Sealed Chamber ──────────────────────────────────────
  if (chapter.isLocked) {
    return (
      <div style={{ backgroundColor: "#0D0B08", minHeight: "100vh" }}>
        <motion.div
          className="fixed inset-0 z-20 pointer-events-none"
          style={{ backgroundColor: "#0D0B08" }}
          initial={{ clipPath: "circle(100% at 50% 50%)" }}
          animate={{ clipPath: "circle(0% at 50% 50%)" }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: transitionDone ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <SealedChamber chapter={chapter} />
        </motion.div>
      </div>
    );
  }

  // ── Unlocked chapter — Reading Surface ───────────────────────────────────
  return (
    <div style={{ backgroundColor: "#0D0B08", minHeight: "100vh" }}>
      {/* ── Mechanical Iris Open transition ────────────────── */}
      <motion.div
        className="fixed inset-0 z-30 pointer-events-none"
        style={{ backgroundColor: "#0D0B08" }}
        initial={{ clipPath: "circle(0% at 50% 50%)" }}
        animate={{ clipPath: transitionDone ? "circle(0% at 50% 50%)" : "circle(150% at 50% 50%)" }}
      />

      {/* ── Reading surface ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: transitionDone ? 1 : 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <ReadingSurface chapter={chapter} />
      </motion.div>

      {/* ── Iris wipe reveal ─────────────────────────────────── */}
      <motion.div
        className="fixed inset-0 z-20 pointer-events-none"
        style={{ backgroundColor: "#0D0B08" }}
        initial={{ clipPath: "circle(100% at 50% 50%)" }}
        animate={{ clipPath: "circle(0% at 50% 50%)" }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        onAnimationComplete={() => setTransitionDone(true)}
      />
    </div>
  );
}

// ─── SEALED CHAMBER ──────────────────────────────────────────────────────────
// The locked chapter experience. Not a 404. An atmospheric waiting room.
// The chapter exists. The content is sealed. The archive is patient.

function SealedChamber({ chapter }: { chapter: Chapter }) {
  const [lockPulse, setLockPulse] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLockPulse(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: "#0D0B08", padding: "2rem" }}
    >
      {/* ── Background radial ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(20,10,0,0.7) 0%, transparent 60%)",
        }}
      />

      {/* ── Corner ornaments ── */}
      <LockedCorner pos="top-left" />
      <LockedCorner pos="top-right" />
      <LockedCorner pos="bottom-left" />
      <LockedCorner pos="bottom-right" />

      {/* ── Top brass rule ── */}
      <div
        className="absolute"
        style={{
          top: "4rem",
          left: "4rem",
          right: "4rem",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(201,168,76,0.25) 30%, rgba(201,168,76,0.4) 50%, rgba(201,168,76,0.25) 70%, transparent)",
        }}
      />

      {/* ── Nav — Scriptorium link ── */}
      <div className="absolute top-6 left-6">
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", opacity: 0.5 }}>
            <ScriptoriumLogo size={20} />
            <span
              style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "0.8rem",
                letterSpacing: "0.08em",
                color: "rgba(245,230,200,0.6)",
              }}
            >
              The Scriptorium
            </span>
          </div>
        </Link>
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">

        {/* Chapter label */}
        <motion.p
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.6rem",
            letterSpacing: "0.3em",
            color: "rgba(201,168,76,0.5)",
            textTransform: "uppercase",
            marginBottom: "1.5rem",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Chapter {chapter.romanNumeral}
        </motion.p>

        {/* Brass lock sigil */}
        <motion.div
          style={{ marginBottom: "2rem", position: "relative" }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.2, 0, 0.1, 1] }}
        >
          <AnimatePresence>
            {lockPulse && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow: "0 0 40px rgba(201,168,76,0.15)",
                }}
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(201,168,76,0.08)",
                    "0 0 50px rgba(201,168,76,0.18)",
                    "0 0 20px rgba(201,168,76,0.08)",
                  ],
                }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </AnimatePresence>
          <BrassLock />
        </motion.div>

        {/* Chapter title — revealed */}
        <motion.h1
          style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "clamp(1.6rem, 4vw, 2.6rem)",
            fontWeight: 400,
            letterSpacing: "0.06em",
            color: "rgba(245,230,200,0.85)",
            lineHeight: 1.2,
            marginBottom: "0.5rem",
            textShadow: "0 0 30px rgba(201,168,76,0.12)",
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          {chapter.title}
        </motion.h1>

        {/* Subtitle */}
        {chapter.subtitle && (
          <motion.p
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              color: "rgba(201,168,76,0.45)",
              textTransform: "uppercase",
              marginBottom: "2rem",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            {chapter.subtitle}
          </motion.p>
        )}

        {/* Brass divider */}
        <motion.div
          style={{
            width: "120px",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)",
            marginBottom: "2rem",
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        />

        {/* Seal message */}
        <motion.p
          style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "1.05rem",
            fontStyle: "italic",
            color: "rgba(245,230,200,0.5)",
            lineHeight: 1.8,
            marginBottom: "0.75rem",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
        >
          This chamber is sealed.
        </motion.p>

        <motion.p
          style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "0.9rem",
            fontStyle: "italic",
            color: "rgba(245,230,200,0.3)",
            lineHeight: 1.7,
            marginBottom: "2.5rem",
            maxWidth: "34ch",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.8 }}
        >
          The author is still writing inside it. When the ink dries,
          the Archive will open this door.
        </motion.p>

        {/* Return link */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <Link href="/chapter/one" style={{ textDecoration: "none" }}>
            <motion.div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(201,168,76,0.6)",
                border: "1px solid rgba(201,168,76,0.2)",
                padding: "0.6rem 1.4rem",
                borderRadius: "1px",
                cursor: "pointer",
              }}
              whileHover={{
                color: "rgba(201,168,76,0.9)",
                borderColor: "rgba(201,168,76,0.5)",
                boxShadow: "0 0 16px rgba(201,168,76,0.1)",
              }}
            >
              ← Return to Chapter One
            </motion.div>
          </Link>
        </motion.div>

      </div>

      {/* ── Bottom brass rule ── */}
      <div
        className="absolute"
        style={{
          bottom: "4rem",
          left: "4rem",
          right: "4rem",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(201,168,76,0.25) 30%, rgba(201,168,76,0.4) 50%, rgba(201,168,76,0.25) 70%, transparent)",
        }}
      />
    </div>
  );
}

// ─── BRASS LOCK SVG ───────────────────────────────────────────────────────────
// A stylized padlock — the chapter is sealed, not forbidden.

function BrassLock() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 80"
      fill="none"
      width={64}
      height={80}
    >
      {/* ── Shackle (the arch) ── */}
      <path
        d="M 16 38 L 16 22 Q 16 8 32 8 Q 48 8 48 22 L 48 38"
        stroke="#C9A84C"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* ── Body ── */}
      <rect
        x="8" y="36" width="48" height="36"
        rx="3" ry="3"
        stroke="#C9A84C"
        strokeWidth="2"
        fill="rgba(201,168,76,0.06)"
      />

      {/* ── Keyhole circle ── */}
      <circle
        cx="32" cy="52" r="6"
        stroke="#C9A84C"
        strokeWidth="1.5"
        fill="rgba(201,168,76,0.1)"
      />

      {/* ── Keyhole slot ── */}
      <rect
        x="30" y="56" width="4" height="8"
        rx="1"
        fill="#C9A84C"
        opacity="0.5"
      />

      {/* ── Body rivet dots ── */}
      <circle cx="13" cy="40" r="1.2" fill="#C9A84C" opacity="0.4"/>
      <circle cx="51" cy="40" r="1.2" fill="#C9A84C" opacity="0.4"/>
      <circle cx="13" cy="68" r="1.2" fill="#C9A84C" opacity="0.4"/>
      <circle cx="51" cy="68" r="1.2" fill="#C9A84C" opacity="0.4"/>

      {/* ── Engraving lines on body ── */}
      <line x1="14" y1="44" x2="50" y2="44" stroke="#C9A84C" strokeWidth="0.5" opacity="0.25"/>
      <line x1="14" y1="65" x2="50" y2="65" stroke="#C9A84C" strokeWidth="0.5" opacity="0.25"/>
    </svg>
  );
}

// ─── LOCKED CORNER ────────────────────────────────────────────────────────────

function LockedCorner({ pos }: { pos: "top-left" | "top-right" | "bottom-left" | "bottom-right" }) {
  const posStyle: Record<string, React.CSSProperties> = {
    "top-left":     { top: "1.5rem", left: "1.5rem", transform: "rotate(0deg)" },
    "top-right":    { top: "1.5rem", right: "1.5rem", transform: "rotate(90deg)" },
    "bottom-left":  { bottom: "1.5rem", left: "1.5rem", transform: "rotate(-90deg)" },
    "bottom-right": { bottom: "1.5rem", right: "1.5rem", transform: "rotate(180deg)" },
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 28 28"
      fill="none"
      width={28}
      height={28}
      style={{ position: "absolute", opacity: 0.3, ...posStyle[pos] }}
    >
      <path d="M2 26 L2 2 L26 2" stroke="#C9A84C" strokeWidth="1" />
      <circle cx="2" cy="2" r="1.5" fill="#C9A84C" />
    </svg>
  );
}
