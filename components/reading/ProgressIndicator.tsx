"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// ─── READING PROGRESS INDICATOR ──────────────────────────────────────────────
// Thin brass line on the right edge. Fills as the reader scrolls.

export default function ProgressIndicator() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const total = scrollHeight - clientHeight;
      if (total <= 0) return;
      setProgress(Math.min(1, Math.max(0, scrollTop / total)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* ── Right edge brass rail ────────────────────────── */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 pointer-events-none"
        style={{ width: "3px", backgroundColor: "rgba(201,168,76,0.06)" }}
      >
        {/* Filled portion */}
        <motion.div
          className="absolute top-0 left-0 right-0"
          style={{ originY: 0 }}
          animate={{ scaleY: progress }}
          transition={{ type: "spring", stiffness: 55, damping: 22, mass: 0.8 }}
          initial={{ scaleY: 0 }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: "-100vh",
              background:
                "linear-gradient(to bottom, rgba(201,168,76,0.3) 0%, rgba(201,168,76,0.7) 60%, rgba(232,201,122,0.9) 100%)",
              boxShadow: "0 0 6px rgba(201,168,76,0.35)",
            }}
          />
        </motion.div>

        {/* Traveling glow dot */}
        <motion.div
          className="absolute left-1/2"
          style={{
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            backgroundColor: "#E8C97A",
            boxShadow: "0 0 8px rgba(232,201,122,0.9), 0 0 16px rgba(201,168,76,0.5)",
            transform: "translateX(-50%)",
            opacity: progress > 0.01 ? 1 : 0,
          }}
          animate={{ top: `${progress * 100}%` }}
          transition={{ type: "spring", stiffness: 55, damping: 22, mass: 0.8 }}
        />
      </div>

      {/* ── Percentage readout ────────────────────────────── */}
      <motion.div
        className="fixed bottom-6 right-5 z-50 pointer-events-none"
        animate={{ opacity: progress > 0.03 ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      >
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.5rem",
            letterSpacing: "0.15em",
            color: "rgba(201,168,76,0.45)",
            display: "block",
            textAlign: "right",
          }}
        >
          {Math.round(progress * 100)}%
        </span>
      </motion.div>
    </>
  );
}
