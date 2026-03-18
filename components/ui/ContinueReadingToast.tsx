"use client";

// ─── CONTINUE READING TOAST ───────────────────────────────────────────────────
// Appears 1.5s after mount if the reader has prior scroll progress (5%–95%).
// Offers to scroll them back to where they left off.
// Auto-dismisses after 9 seconds. Manual dismiss also available.

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getReaderState } from "@/lib/ink";

interface ContinueReadingToastProps {
  chapterSlug: string;
  chapterRomanNumeral: string;
}

export default function ContinueReadingToast({
  chapterSlug,
  chapterRomanNumeral,
}: ContinueReadingToastProps) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const state = getReaderState(chapterSlug);
    if (!state) return;

    const p = state.scrollProgress;
    // Only show if meaningfully into the chapter but not at the end
    if (p < 0.05 || p > 0.92) return;

    setProgress(Math.round(p * 100));

    const showTimer = setTimeout(() => setVisible(true), 1500);
    const hideTimer = setTimeout(() => setVisible(false), 10500); // auto-dismiss after 9s

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [chapterSlug]);

  const handleResume = useCallback(() => {
    const state = getReaderState(chapterSlug);
    if (!state) return;

    const { scrollHeight, clientHeight } = document.documentElement;
    const targetY = state.scrollProgress * (scrollHeight - clientHeight);

    window.scrollTo({ top: targetY, behavior: "smooth" });
    setVisible(false);
  }, [chapterSlug]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          style={{
            position: "fixed",
            bottom: "5rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 45,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            background: "rgba(13,11,8,0.95)",
            border: "1px solid rgba(201,168,76,0.25)",
            padding: "0.7rem 1rem 0.7rem 1.1rem",
            backdropFilter: "blur(8px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.05)",
            maxWidth: "calc(100vw - 3rem)",
          }}
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97, transition: { duration: 0.25 } }}
          transition={{ duration: 0.35, ease: [0.2, 0, 0.1, 1] }}
        >
          {/* Progress bar — left edge accent */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "2px",
              background: `linear-gradient(180deg, rgba(201,168,76,0.2), rgba(201,168,76,0.7) ${progress}%, rgba(201,168,76,0.1) ${progress}%)`,
            }}
          />

          {/* Text */}
          <div>
            <p
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.5rem",
                letterSpacing: "0.2em",
                color: "rgba(201,168,76,0.5)",
                textTransform: "uppercase",
                marginBottom: "0.2rem",
              }}
            >
              Chapter {chapterRomanNumeral} · {progress}% read
            </p>
            <p
              style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "0.85rem",
                fontStyle: "italic",
                color: "rgba(245,230,200,0.65)",
                lineHeight: 1,
              }}
            >
              Continue where you left off?
            </p>
          </div>

          {/* Resume button */}
          <motion.button
            onClick={handleResume}
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.5rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#C9A84C",
              background: "transparent",
              border: "1px solid rgba(201,168,76,0.35)",
              padding: "0.35rem 0.8rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
            whileHover={{
              borderColor: "rgba(201,168,76,0.7)",
              boxShadow: "0 0 12px rgba(201,168,76,0.12)",
            }}
            whileTap={{ scale: 0.97 }}
          >
            Resume ↓
          </motion.button>

          {/* Dismiss */}
          <button
            onClick={() => setVisible(false)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "rgba(245,230,200,0.2)",
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.55rem",
              padding: "0.2rem",
              lineHeight: 1,
              flexShrink: 0,
            }}
            aria-label="Dismiss"
          >
            ✕
          </button>

          {/* Auto-dismiss progress line */}
          <motion.div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              height: "1px",
              background: "rgba(201,168,76,0.2)",
              transformOrigin: "left",
            }}
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 9, ease: "linear", delay: 0.35 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
