"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveQuestion } from "@/lib/ink";
import { INK_CONFIGS } from "@/lib/types";
import { playSignalSend } from "@/lib/sound";

// ─── SIGNAL INK MODAL — THE QUESTION CHAMBER ─────────────────────────────────
// One question per chapter. First read only.
// Phase 1: submits via API route → emails the question to the author.
// Phase 2: goes into the author dashboard question queue.

interface SignalInkModalProps {
  isOpen: boolean;
  selectedText: string;
  chapterSlug: string;
  hasAlreadyAsked: boolean;
  onClose: () => void;
  onQuestionSent: () => void;
}

type SubmitState = "idle" | "sending" | "sent" | "error";

export default function SignalInkModal({
  isOpen,
  selectedText,
  chapterSlug,
  hasAlreadyAsked,
  onClose,
  onQuestionSent,
}: SignalInkModalProps) {
  const [question, setQuestion] = useState("");
  const [email, setEmail] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const signalConfig = INK_CONFIGS.signal;

  const handleSubmit = async () => {
    if (!question.trim()) return;
    setSubmitState("sending");

    try {
      // Save locally
      saveQuestion(chapterSlug, selectedText, question.trim(), email.trim() || undefined);
      playSignalSend();

      // Phase 1: POST to API route which emails the author
      const res = await fetch("/api/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterSlug,
          selectedText,
          question: question.trim(),
          readerEmail: email.trim() || null,
        }),
      });

      if (!res.ok) throw new Error("Signal failed");

      setSubmitState("sent");
      onQuestionSent();

      // Auto-close after confirmation
      setTimeout(() => {
        onClose();
        setSubmitState("idle");
        setQuestion("");
        setEmail("");
      }, 3000);
    } catch {
      // Even if the network call fails, the question is saved locally
      setSubmitState("sent");
      onQuestionSent();
      setTimeout(() => {
        onClose();
        setSubmitState("idle");
        setQuestion("");
        setEmail("");
      }, 3000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ────────────────────────────────────── */}
          <motion.div
            className="fixed inset-0 z-50 question-chamber-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={submitState === "idle" ? onClose : undefined}
          />

          {/* ── Modal ───────────────────────────────────────── */}
          <motion.div
            className="fixed z-50"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              maxWidth: "520px",
              maxHeight: "calc(100dvh - 2rem)",
              padding: "0 1rem",
              display: "flex",
              flexDirection: "column",
            }}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0.1, 1] }}
          >
            <div
              style={{
                background: "#0D0B08",
                border: `1px solid ${signalConfig.color}40`,
                boxShadow: `0 0 60px rgba(0,229,204,0.12), 0 24px 64px rgba(0,0,0,0.9)`,
                borderRadius: "2px",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                flex: 1,
                minHeight: 0,
              }}
            >
              {/* ── Header ──────────────────────────────────── */}
              <div
                style={{
                  background: "#0D0B08",
                  borderBottom: `1px solid rgba(0,229,204,0.15)`,
                  padding: "1.25rem 1.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.6rem",
                      letterSpacing: "0.25em",
                      color: signalConfig.color,
                      textTransform: "uppercase",
                      marginBottom: "0.35rem",
                    }}
                  >
                    Signal Ink — Question Chamber
                  </p>
                  <p
                    style={{
                      fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                      fontSize: "1.0rem",
                      fontStyle: "italic",
                      color: "rgba(245,230,200,0.6)",
                    }}
                  >
                    One question. This chapter. First read only.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    color: "rgba(245,230,200,0.3)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                    lineHeight: 1,
                    padding: "0.1rem 0.3rem",
                  }}
                >
                  ×
                </button>
              </div>

              {/* ── Body ────────────────────────────────────── */}
              <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1, minHeight: 0 }}>

                {hasAlreadyAsked ? (
                  <AlreadyAsked onClose={onClose} />
                ) : submitState === "sent" ? (
                  <SentConfirmation />
                ) : (
                  <>
                    {/* Selected text context */}
                    {selectedText && (
                      <div
                        style={{
                          borderLeft: `2px solid ${signalConfig.color}60`,
                          paddingLeft: "0.75rem",
                          marginBottom: "1.25rem",
                        }}
                      >
                        <p
                          style={{
                            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                            fontSize: "0.875rem",
                            fontStyle: "italic",
                            color: "rgba(245,230,200,0.4)",
                            lineHeight: 1.6,
                          }}
                        >
                          &ldquo;{selectedText.slice(0, 140)}{selectedText.length > 140 ? "…" : ""}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Question input */}
                    <div style={{ marginBottom: "1rem" }}>
                      <label
                        style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: "0.55rem",
                          letterSpacing: "0.2em",
                          color: "rgba(245,230,200,0.4)",
                          textTransform: "uppercase",
                          display: "block",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Your Question
                      </label>
                      <textarea
                        autoFocus
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="What do you need to know?"
                        rows={4}
                        style={{
                          width: "100%",
                          background: "rgba(13,11,8,0.9)",
                          border: `1px solid rgba(0,229,204,0.25)`,
                          borderRadius: "1px",
                          padding: "0.75rem",
                          color: "#F5E6C8",
                          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                          fontSize: "1rem",
                          lineHeight: 1.7,
                          resize: "vertical",
                          outline: "none",
                          transition: "border-color 0.2s ease",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "rgba(0,229,204,0.5)";
                          e.target.style.boxShadow = "0 0 12px rgba(0,229,204,0.1)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "rgba(0,229,204,0.25)";
                          e.target.style.boxShadow = "none";
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
                        }}
                      />
                    </div>

                    {/* Optional email */}
                    <div style={{ marginBottom: "1.5rem" }}>
                      <label
                        style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: "0.55rem",
                          letterSpacing: "0.2em",
                          color: "rgba(245,230,200,0.3)",
                          textTransform: "uppercase",
                          display: "block",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Your Address (optional — to receive a reply)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="reader@archive.net"
                        style={{
                          width: "100%",
                          background: "rgba(13,11,8,0.9)",
                          border: "1px solid rgba(245,230,200,0.1)",
                          borderRadius: "1px",
                          padding: "0.5rem 0.75rem",
                          color: "#F5E6C8",
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: "0.75rem",
                          outline: "none",
                        }}
                      />
                    </div>

                    {/* Notice */}
                    <p
                      style={{
                        fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                        fontSize: "0.75rem",
                        fontStyle: "italic",
                        color: "rgba(245,230,200,0.25)",
                        marginBottom: "1.25rem",
                        lineHeight: 1.5,
                      }}
                    >
                      Your question enters the Archive. The author may respond —
                      in text, in voice, or in silence. Not every question is answered.
                      All questions are read.
                    </p>

                    {/* Submit */}
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <motion.button
                        onClick={handleSubmit}
                        disabled={!question.trim() || submitState === "sending"}
                        style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: "0.65rem",
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          color: question.trim() ? signalConfig.color : "rgba(0,229,204,0.3)",
                          background: question.trim()
                            ? "rgba(0,229,204,0.08)"
                            : "transparent",
                          border: `1px solid ${question.trim() ? signalConfig.color + "60" : "rgba(0,229,204,0.2)"}`,
                          padding: "0.6rem 1.5rem",
                          cursor: question.trim() ? "pointer" : "not-allowed",
                          borderRadius: "1px",
                          transition: "all 0.2s ease",
                        }}
                        whileHover={question.trim() ? {
                          boxShadow: "0 0 16px rgba(0,229,204,0.2)",
                        } : {}}
                      >
                        {submitState === "sending"
                          ? "TRANSMITTING…"
                          : "SEND INTO THE ARCHIVE"}
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── ALREADY ASKED ───────────────────────────────────────────────────────────

function AlreadyAsked({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "1rem 0" }}>
      <p
        style={{
          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
          fontSize: "1.1rem",
          fontStyle: "italic",
          color: "rgba(245,230,200,0.6)",
          lineHeight: 1.7,
          marginBottom: "1rem",
        }}
      >
        Your question has already been sent into the Archive for this chapter.
        <br />
        The chamber does not open twice on first read.
      </p>
      <p
        style={{
          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
          fontSize: "0.85rem",
          color: "rgba(245,230,200,0.3)",
          fontStyle: "italic",
          marginBottom: "1.5rem",
        }}
      >
        On your second read — if you return — it opens again.
      </p>
      <button
        onClick={onClose}
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.6rem",
          letterSpacing: "0.2em",
          color: "rgba(201,168,76,0.6)",
          background: "transparent",
          border: "1px solid rgba(201,168,76,0.3)",
          padding: "0.5rem 1.2rem",
          cursor: "pointer",
          borderRadius: "1px",
        }}
      >
        CLOSE THE CHAMBER
      </button>
    </div>
  );
}

// ─── SENT CONFIRMATION ───────────────────────────────────────────────────────

function SentConfirmation() {
  return (
    <motion.div
      style={{ textAlign: "center", padding: "1rem 0" }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "1px solid rgba(0,229,204,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1rem",
        }}
        animate={{ boxShadow: ["0 0 0px rgba(0,229,204,0.3)", "0 0 20px rgba(0,229,204,0.5)", "0 0 0px rgba(0,229,204,0.3)"] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00E5CC" strokeWidth="1.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </motion.div>

      <p
        style={{
          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
          fontSize: "1.15rem",
          fontStyle: "italic",
          color: "rgba(245,230,200,0.8)",
          lineHeight: 1.6,
          marginBottom: "0.5rem",
        }}
      >
        Your question has entered the Archive.
      </p>
      <p
        style={{
          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
          fontSize: "0.85rem",
          color: "rgba(245,230,200,0.35)",
          fontStyle: "italic",
        }}
      >
        The chamber is now sealed for this read.
      </p>
    </motion.div>
  );
}
