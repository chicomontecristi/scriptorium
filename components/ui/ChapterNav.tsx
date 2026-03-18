"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Chapter } from "@/lib/types";
import ScriptoriumLogo from "./ScriptoriumLogo";

// ─── CHAPTER NAVIGATION ───────────────────────────────────────────────────────
// Minimal top bar. Hides on scroll down, reveals on scroll up.
// Contains: Scriptorium wordmark (links home) + chapter identity.

interface ChapterNavProps {
  chapter: Chapter;
}

export default function ChapterNav({ chapter }: ChapterNavProps) {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const scrollingDown = currentY > lastScrollY;
      const threshold = 80;

      setAtTop(currentY < threshold);

      if (currentY < threshold) {
        setVisible(true);
      } else if (scrollingDown && currentY > lastScrollY + 8) {
        setVisible(false);
      } else if (!scrollingDown && lastScrollY > currentY + 4) {
        setVisible(true);
      }

      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.header
          className="fixed top-0 left-0 right-0 z-40"
          style={{
            height: "52px",
            background: atTop
              ? "transparent"
              : "rgba(13,11,8,0.92)",
            borderBottom: atTop
              ? "1px solid transparent"
              : "1px solid rgba(201,168,76,0.12)",
            backdropFilter: atTop ? "none" : "blur(8px)",
            transition: "background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease",
            paddingLeft: "60px", // clear the ink toolbar
          }}
          initial={{ y: -52, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -52, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.2, 0, 0.1, 1] }}
        >
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 1.5rem 0 1rem",
              maxWidth: "calc(72ch + 240px + 60px)",
              margin: "0 auto",
            }}
          >
            {/* ── Left: Scriptorium wordmark ──────────────── */}
            <Link href="/" style={{ textDecoration: "none" }}>
              <motion.div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
                whileHover={{ opacity: 0.9 }}
                initial={{ opacity: 0.7 }}
              >
                <ScriptoriumLogo size={22} />
                <span
                  style={{
                    fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                    fontSize: "0.875rem",
                    letterSpacing: "0.1em",
                    color: "rgba(245,230,200,0.65)",
                  }}
                >
                  The Scriptorium
                </span>
              </motion.div>
            </Link>

            {/* ── Center: Chapter identity ────────────────── */}
            <div style={{ textAlign: "center", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
              <span
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.55rem",
                  letterSpacing: "0.25em",
                  color: "rgba(201,168,76,0.45)",
                  textTransform: "uppercase",
                  display: "block",
                  lineHeight: 1,
                  marginBottom: "3px",
                }}
              >
                Chapter {chapter.romanNumeral}
              </span>
              <span
                style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "0.8rem",
                  fontStyle: "italic",
                  color: "rgba(245,230,200,0.4)",
                  letterSpacing: "0.02em",
                }}
              >
                {chapter.title}
              </span>
            </div>

            {/* ── Right: Ink indicator ─────────────────────── */}
            <InkStatusDot />
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}

// ─── INK STATUS DOT ──────────────────────────────────────────────────────────
// Shows which ink is active via a small colored pulse.
// Reads from a global custom event dispatched by the InkToolbar.

function InkStatusDot() {
  const [activeColor, setActiveColor] = useState("rgba(160,168,168,0.6)"); // ghost default
  const [activeLabel, setActiveLabel] = useState("Ghost Ink");

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setActiveColor(e.detail.color);
      setActiveLabel(e.detail.label);
    };
    window.addEventListener("inkchange" as keyof WindowEventMap, handler as EventListener);
    return () => window.removeEventListener("inkchange" as keyof WindowEventMap, handler as EventListener);
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <motion.div
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: activeColor,
          boxShadow: `0 0 6px ${activeColor}`,
        }}
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <span
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.5rem",
          letterSpacing: "0.15em",
          color: activeColor,
          textTransform: "uppercase",
          opacity: 0.8,
        }}
      >
        {activeLabel}
      </span>
    </div>
  );
}
