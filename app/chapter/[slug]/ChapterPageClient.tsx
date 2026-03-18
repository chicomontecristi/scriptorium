"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Chapter } from "@/lib/types";
import ReadingSurface from "@/components/reading/ReadingSurface";

// ─── CHAPTER PAGE CLIENT ─────────────────────────────────────────────────────
// Handles the mechanical iris open transition, then mounts the reading surface.

interface Props {
  chapter: Chapter;
}

export default function ChapterPageClient({ chapter }: Props) {
  const [transitionDone, setTransitionDone] = useState(false);

  useEffect(() => {
    // Small delay for the iris animation to complete before reading surface appears
    const timer = setTimeout(() => setTransitionDone(true), 900);
    return () => clearTimeout(timer);
  }, []);

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
