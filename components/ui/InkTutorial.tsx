"use client";

// ─── INK TUTORIAL ─────────────────────────────────────────────────────────────
// First-visit onboarding. Fires once — stored in localStorage.
// Three steps: Select → Ink → Archive.
// Each step has a visual demo and a one-line instruction.
// Does not block reading — dismissable at any point.

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "scriptorium_tutorial_v1";

const STEPS = [
  {
    id: "select",
    label: "01 — SELECT",
    headline: "Choose any passage.",
    body: "Highlight words that move you, trouble you, or demand a second look. The text is yours to mark.",
    visual: <SelectDemo />,
  },
  {
    id: "ink",
    label: "02 — INK",
    headline: "Six inks. Six ways of reading.",
    body: "Each ink carries a different intention — curiosity, memory, a private thought, a question sent directly to the author.",
    visual: <InkDemo />,
  },
  {
    id: "archive",
    label: "03 — ARCHIVE",
    headline: "Your marks live in the Archive.",
    body: "Every annotation is sealed into this chapter. Return to any page and your ink will be exactly where you left it.",
    visual: <ArchiveDemo />,
  },
];

interface InkTutorialProps {
  // Pass false to skip for returning readers (saves the localStorage check at parent level)
  enabled?: boolean;
}

export default function InkTutorial({ enabled = true }: InkTutorialProps) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    // Check if tutorial has been seen
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return; // localStorage unavailable
    }

    // Show after 2.5s — let the reader get oriented first
    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, [enabled]);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  }, []);

  const next = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  }, [step, dismiss]);

  const prev = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(13,11,8,0.85)", backdropFilter: "blur(3px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 0.4 }}
            onClick={dismiss}
          />

          {/* ── Tutorial card ── */}
          <motion.div
            className="fixed z-40"
            style={{
              // Center on screen
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(480px, calc(100vw - 2rem))",
            }}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97, transition: { duration: 0.25 } }}
            transition={{ duration: 0.5, ease: [0.2, 0, 0.1, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Card border ── */}
            <div
              style={{
                border: "1px solid rgba(201,168,76,0.22)",
                background: "rgba(13,11,8,0.98)",
                padding: "clamp(1.5rem, 5vw, 2.2rem)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Corner accents */}
              {["top-0 left-0 border-t border-l", "top-0 right-0 border-t border-r", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"].map((cls, i) => (
                <span
                  key={i}
                  className={`absolute w-3 h-3 ${cls}`}
                  style={{ borderColor: "rgba(201,168,76,0.35)" }}
                />
              ))}

              {/* ── Step label ── */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={`label-${step}`}
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.5rem",
                    letterSpacing: "0.3em",
                    color: "rgba(201,168,76,0.5)",
                    textTransform: "uppercase",
                    marginBottom: "1.25rem",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {STEPS[step].label}
                </motion.p>
              </AnimatePresence>

              {/* ── Visual demo area ── */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`visual-${step}`}
                  style={{
                    marginBottom: "1.5rem",
                    height: "100px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderTop: "1px solid rgba(201,168,76,0.08)",
                    borderBottom: "1px solid rgba(201,168,76,0.08)",
                    padding: "1rem 0",
                  }}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  {STEPS[step].visual}
                </motion.div>
              </AnimatePresence>

              {/* ── Headline ── */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`content-${step}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <h3
                    style={{
                      fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                      fontSize: "1.3rem",
                      fontWeight: 400,
                      color: "#F5E6C8",
                      lineHeight: 1.3,
                      marginBottom: "0.6rem",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {STEPS[step].headline}
                  </h3>
                  <p
                    style={{
                      fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                      fontSize: "0.95rem",
                      fontStyle: "italic",
                      color: "rgba(245,230,200,0.45)",
                      lineHeight: 1.7,
                      marginBottom: "1.75rem",
                    }}
                  >
                    {STEPS[step].body}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* ── Progress dots ── */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                {STEPS.map((_, i) => (
                  <motion.div
                    key={i}
                    style={{
                      width: i === step ? "20px" : "6px",
                      height: "6px",
                      borderRadius: "3px",
                      backgroundColor:
                        i === step
                          ? "rgba(201,168,76,0.8)"
                          : i < step
                          ? "rgba(201,168,76,0.35)"
                          : "rgba(201,168,76,0.12)",
                    }}
                    animate={{
                      width: i === step ? 20 : 6,
                      backgroundColor:
                        i === step
                          ? "rgba(201,168,76,0.8)"
                          : i < step
                          ? "rgba(201,168,76,0.35)"
                          : "rgba(201,168,76,0.12)",
                    }}
                    transition={{ duration: 0.25 }}
                  />
                ))}
              </div>

              {/* ── Navigation ── */}
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                {step > 0 && (
                  <motion.button
                    onClick={prev}
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.55rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "rgba(245,230,200,0.3)",
                      background: "transparent",
                      border: "1px solid rgba(245,230,200,0.1)",
                      padding: "0.6rem 1rem",
                      cursor: "pointer",
                    }}
                    whileHover={{ color: "rgba(245,230,200,0.6)", borderColor: "rgba(245,230,200,0.2)" }}
                    whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    ← Back
                  </motion.button>
                )}

                <motion.button
                  onClick={next}
                  style={{
                    flex: 1,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.6rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#C9A84C",
                    background: "transparent",
                    border: "1px solid rgba(201,168,76,0.4)",
                    padding: "0.7rem 1.5rem",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  whileHover={{
                    borderColor: "rgba(201,168,76,0.8)",
                    boxShadow: "0 0 16px rgba(201,168,76,0.12)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Corner accents */}
                  {["top-0 left-0 border-t border-l", "top-0 right-0 border-t border-r", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"].map((cls, i) => (
                    <span key={i} className={`absolute w-1.5 h-1.5 ${cls}`} style={{ borderColor: "#C9A84C" }} />
                  ))}
                  {step < STEPS.length - 1 ? "Next →" : "Begin Reading"}
                </motion.button>

                {/* Skip — always visible */}
                <button
                  onClick={dismiss}
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.5rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "rgba(245,230,200,0.18)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.4rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  Skip
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── STEP VISUALS ─────────────────────────────────────────────────────────────

function SelectDemo() {
  const [highlighted, setHighlighted] = useState(false);

  useEffect(() => {
    // Animate the selection appearing
    const t1 = setTimeout(() => setHighlighted(true), 400);
    return () => clearTimeout(t1);
  }, []);

  const words = ["Every", "song", "is", "a", "country.", "I", "was", "born", "stateless."];
  const highlightRange = [0, 4]; // "Every song is a country."

  return (
    <div
      style={{
        fontFamily: '"EB Garamond", Garamond, Georgia, serif',
        fontSize: "1rem",
        fontStyle: "italic",
        color: "rgba(245,230,200,0.6)",
        lineHeight: 1.6,
        textAlign: "center",
        maxWidth: "32ch",
        userSelect: "none",
      }}
    >
      {words.map((word, i) => {
        const isHighlighted = highlighted && i >= highlightRange[0] && i <= highlightRange[1];
        return (
          <motion.span
            key={i}
            style={{
              backgroundColor: isHighlighted ? "rgba(214,83,60,0.25)" : "transparent",
              color: isHighlighted ? "rgba(245,230,200,0.95)" : "rgba(245,230,200,0.5)",
              borderRadius: "1px",
              padding: "0 1px",
            }}
            animate={{
              backgroundColor: isHighlighted ? "rgba(214,83,60,0.25)" : "transparent",
              color: isHighlighted ? "rgba(245,230,200,0.95)" : "rgba(245,230,200,0.5)",
            }}
            transition={{ duration: 0.3, delay: i < 5 ? i * 0.06 : 0 }}
          >
            {word}{" "}
          </motion.span>
        );
      })}
    </div>
  );
}

function InkDemo() {
  const [activeIndex, setActiveIndex] = useState(0);

  const inks = [
    { label: "Ghost", color: "rgba(160,168,168,0.8)", desc: "Private thought" },
    { label: "Ember", color: "rgba(214,83,60,0.8)", desc: "Strong reaction" },
    { label: "Copper", color: "rgba(201,140,60,0.8)", desc: "Question, curiosity" },
    { label: "Archive", color: "rgba(201,168,76,0.9)", desc: "Permanent mark" },
    { label: "Signal", color: "rgba(0,229,204,0.8)", desc: "Ask the author" },
    { label: "Memory", color: "rgba(106,60,196,0.8)", desc: "Personal memory" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % inks.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
      {inks.map((ink, i) => (
        <motion.div
          key={ink.label}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}
          animate={{ opacity: i === activeIndex ? 1 : 0.25, scale: i === activeIndex ? 1.1 : 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: ink.color,
              boxShadow: i === activeIndex ? `0 0 12px ${ink.color}` : "none",
            }}
          />
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.45rem",
              letterSpacing: "0.1em",
              color: ink.color,
              textTransform: "uppercase",
            }}
          >
            {ink.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function ArchiveDemo() {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.4rem", width: "100%", maxWidth: "280px" }}>
      {/* Annotation entry */}
      <motion.div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "0.5rem",
          opacity: phase >= 1 ? 1 : 0,
          borderLeft: "2px solid rgba(214,83,60,0.5)",
          paddingLeft: "0.6rem",
        }}
        animate={{ opacity: phase >= 1 ? 1 : 0, x: phase >= 1 ? 0 : 8 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: "0.45rem", letterSpacing: "0.15em", color: "rgba(214,83,60,0.6)", textTransform: "uppercase", marginBottom: "0.15rem" }}>Ember Ink</p>
          <p style={{ fontFamily: '"EB Garamond", Garamond, Georgia, serif', fontSize: "0.8rem", fontStyle: "italic", color: "rgba(245,230,200,0.5)" }}>"born stateless"</p>
        </div>
      </motion.div>

      {/* Timestamp + seal */}
      <motion.div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
        animate={{ opacity: phase >= 2 ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "rgba(201,168,76,0.5)" }} />
        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: "0.45rem", letterSpacing: "0.12em", color: "rgba(201,168,76,0.4)" }}>
          SEALED TO ARCHIVE · PERSISTS ACROSS VISITS
        </span>
      </motion.div>
    </div>
  );
}
