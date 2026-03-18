"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Annotation, InkType, MarginLayer, Chapter } from "@/lib/types";
import {
  getAnnotations,
  getReaderState,
  initReaderState,
  setActiveInkType,
  updateScrollProgress,
  markChapterComplete,
  hasAskedQuestion,
} from "@/lib/ink";
import AnnotatableText from "./AnnotatableText";
import InkToolbar from "./InkToolbar";
import MarginWorld from "./MarginWorld";
import SignalInkModal from "./SignalInkModal";
import ProgressIndicator from "./ProgressIndicator";
import ChapterNav from "@/components/ui/ChapterNav";

// ─── READING SURFACE ─────────────────────────────────────────────────────────
// The complete reading environment. This is the heart of The Scriptorium.
// All subsystems are orchestrated here.

interface ReadingSurfaceProps {
  chapter: Chapter;
}

export default function ReadingSurface({ chapter }: ReadingSurfaceProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeInkType, setActiveInkTypeState] = useState<InkType>("ghost");
  const [marginLayer, setMarginLayer] = useState<MarginLayer>("mine");
  const [signalModalOpen, setSignalModalOpen] = useState(false);
  const [signalSelectedText, setSignalSelectedText] = useState("");
  const [questionAsked, setQuestionAsked] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showCompletionEvent, setShowCompletionEvent] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // ── Initialize reader state ────────────────────────────────
  useEffect(() => {
    let state = getReaderState(chapter.slug);
    if (!state) {
      state = initReaderState(chapter.slug);
    }

    const saved = getAnnotations(chapter.slug);
    setAnnotations(saved);
    setActiveInkTypeState(state.activeInkType);
    setQuestionAsked(hasAskedQuestion(chapter.slug));
    setIsComplete(state.hasCompletedFirstRead);
  }, [chapter.slug]);

  // ── Track scroll progress ──────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const progress = scrollTop / (scrollHeight - clientHeight);
      updateScrollProgress(chapter.slug, progress);

      // Trigger completion when reader reaches end
      if (progress > 0.92 && !isComplete) {
        markChapterComplete(chapter.slug);
        setIsComplete(true);
        setTimeout(() => setShowCompletionEvent(true), 800);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [chapter.slug, isComplete]);

  // ── Handle ink type change ─────────────────────────────────
  const handleInkChange = useCallback(
    (ink: InkType) => {
      setActiveInkTypeState(ink);
      setActiveInkType(chapter.slug, ink);

      // Signal ink: open the question chamber
      if (ink === "signal") {
        const selection = window.getSelection();
        const text = selection?.toString().trim() || "";
        setSignalSelectedText(text);
        setSignalModalOpen(true);
        return;
      }
    },
    [chapter.slug]
  );

  // ── Handle annotation created ─────────────────────────────
  const handleAnnotationCreated = useCallback((annotation: Annotation) => {
    setAnnotations((prev) => [...prev, annotation]);
  }, []);

  // ── Handle annotation updated ─────────────────────────────
  const handleAnnotationUpdated = useCallback((updated: Annotation) => {
    setAnnotations((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a))
    );
  }, []);

  // ── Handle annotation deleted ─────────────────────────────
  const handleAnnotationDeleted = useCallback((id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#0D0B08" }}
    >
      {/* ── Chapter navigation — top bar ────────────────────── */}
      <ChapterNav chapter={chapter} />

      {/* ── Reading progress — right rail ────────────────────── */}
      <ProgressIndicator />

      {/* ── Ink Toolbar — left rail ──────────────────────────── */}
      <InkToolbar
        activeInkType={activeInkType}
        onInkChange={handleInkChange}
        isPhase1={false}
      />

      {/* ── Reading layout ──────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingLeft: "52px",  // ink toolbar width
        }}
      >
        {/* ── Reading column ──────────────────────────────── */}
        <div
          ref={contentRef}
          className="parchment-surface"
          style={{
            flex: "0 0 auto",
            width: "100%",
            maxWidth: "72ch",
            minHeight: "100vh",
            padding: "8rem 3rem 12rem",
            borderLeft: "1px solid rgba(201,168,76,0.08)",
            borderRight: "1px solid rgba(201,168,76,0.08)",
            boxShadow: "0 0 60px rgba(44,26,0,0.4)",
          }}
        >
          {/* ── Chapter header ──────────────────────────────── */}
          <ChapterHeader chapter={chapter} />

          {/* ── Brass rule ────────────────────────────────── */}
          <div className="brass-line" style={{ marginBottom: "3rem" }} />

          {/* ── Epigraph ──────────────────────────────────── */}
          {chapter.epigraph && (
            <div
              style={{
                textAlign: "center",
                maxWidth: "46ch",
                margin: "0 auto 3rem",
                padding: "0 1.5rem",
              }}
            >
              <AnnotatableText
                text={chapter.epigraph.text}
                paragraphIndex={-1}
                chapterSlug={chapter.slug}
                activeInkType={activeInkType}
                annotations={annotations}
                onAnnotationCreated={handleAnnotationCreated}
                isEpigraph
              />
              <p
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.6rem",
                  letterSpacing: "0.18em",
                  color: "rgba(201,168,76,0.5)",
                  textTransform: "uppercase",
                  marginTop: "-0.5rem",
                }}
              >
                — {chapter.epigraph.attribution}
              </p>
            </div>
          )}

          {/* ── Paragraphs ──────────────────────────────────── */}
          {chapter.paragraphs.map((para, i) => {
            if (para.isSectionBreak) {
              return (
                <SectionBreak key={`break-${i}`} />
              );
            }

            return (
              <AnnotatableText
                key={`para-${para.index}`}
                text={para.text}
                paragraphIndex={para.index}
                chapterSlug={chapter.slug}
                activeInkType={activeInkType}
                annotations={annotations.filter(
                  (a) => a.selection.paragraphIndex === para.index
                )}
                onAnnotationCreated={handleAnnotationCreated}
                isFirstParagraph={i === 0 || (i > 0 && chapter.paragraphs[i - 1]?.isSectionBreak)}
              />
            );
          })}

          {/* ── Chapter end marker ──────────────────────────── */}
          <div
            style={{
              textAlign: "center",
              marginTop: "4rem",
              paddingTop: "3rem",
            }}
          >
            <div className="brass-line" style={{ marginBottom: "1.5rem" }} />
            <p
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.6rem",
                letterSpacing: "0.3em",
                color: "rgba(201,168,76,0.35)",
                textTransform: "uppercase",
              }}
            >
              — END OF CHAPTER {chapter.romanNumeral} —
            </p>
          </div>
        </div>

        {/* ── Margin World — right rail ────────────────────── */}
        <div
          style={{
            flex: "0 0 auto",
            position: "sticky",
            top: 0,
            height: "100vh",
            overflowY: "auto",
            paddingRight: "1rem",
          }}
        >
          <MarginWorld
            annotations={annotations}
            chapterSlug={chapter.slug}
            activeLayer={marginLayer}
            onLayerChange={setMarginLayer}
            onAnnotationUpdated={handleAnnotationUpdated}
            onAnnotationDeleted={handleAnnotationDeleted}
          />
        </div>
      </div>

      {/* ── Signal Ink Modal ────────────────────────────────── */}
      <SignalInkModal
        isOpen={signalModalOpen}
        selectedText={signalSelectedText}
        chapterSlug={chapter.slug}
        hasAlreadyAsked={questionAsked}
        onClose={() => {
          setSignalModalOpen(false);
          // Return to ghost ink after using signal
          setActiveInkTypeState("ghost");
          setActiveInkType(chapter.slug, "ghost");
        }}
        onQuestionSent={() => {
          setQuestionAsked(true);
        }}
      />

      {/* ── Completion Event ────────────────────────────────── */}
      <AnimatePresence>
        {showCompletionEvent && (
          <CompletionEvent
            chapter={chapter}
            onDismiss={() => setShowCompletionEvent(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── CHAPTER HEADER ──────────────────────────────────────────────────────────

function ChapterHeader({ chapter }: { chapter: Chapter }) {
  return (
    <motion.header
      style={{ textAlign: "center", marginBottom: "3rem" }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.2, 0, 0.1, 1] }}
    >
      <p
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.6rem",
          letterSpacing: "0.3em",
          color: "rgba(201,168,76,0.55)",
          textTransform: "uppercase",
          marginBottom: "1.25rem",
        }}
      >
        CHAPTER {chapter.romanNumeral}
      </p>

      <h1
        style={{
          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
          fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
          fontWeight: 400,
          color: "#F5E6C8",
          lineHeight: 1.2,
          letterSpacing: "-0.01em",
          marginBottom: chapter.subtitle ? "0.75rem" : "0",
        }}
      >
        {chapter.title}
      </h1>

      {chapter.subtitle && (
        <p
          style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "1rem",
            fontStyle: "italic",
            color: "rgba(245,230,200,0.45)",
            lineHeight: 1.5,
          }}
        >
          {chapter.subtitle}
        </p>
      )}
    </motion.header>
  );
}

// ─── SECTION BREAK ──────────────────────────────────────────────────────────

function SectionBreak() {
  return (
    <div
      style={{
        textAlign: "center",
        margin: "2.5rem 0",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <div className="brass-line" style={{ flex: 1 }} />
      <span
        style={{
          color: "rgba(201,168,76,0.4)",
          fontSize: "1rem",
          letterSpacing: "0.3em",
        }}
      >
        ✦
      </span>
      <div className="brass-line" style={{ flex: 1 }} />
    </div>
  );
}

// ─── COMPLETION EVENT ────────────────────────────────────────────────────────

function CompletionEvent({
  chapter,
  onDismiss,
}: {
  chapter: Chapter;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 question-chamber-backdrop flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        style={{
          maxWidth: "440px",
          width: "100%",
          margin: "0 1rem",
          background: "#0D0B08",
          border: "1px solid rgba(201,168,76,0.4)",
          boxShadow: "0 0 60px rgba(201,168,76,0.1), 0 32px 80px rgba(0,0,0,0.95)",
          padding: "2.5rem 2rem",
          textAlign: "center",
          borderRadius: "2px",
        }}
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 24 }}
        transition={{ duration: 0.5, ease: [0.2, 0, 0.1, 1] }}
      >
        <p
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.55rem",
            letterSpacing: "0.3em",
            color: "rgba(201,168,76,0.5)",
            textTransform: "uppercase",
            marginBottom: "1.5rem",
          }}
        >
          Chapter Complete — First Read
        </p>

        <div className="brass-line" style={{ marginBottom: "1.5rem" }} />

        <p
          style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "1.15rem",
            fontStyle: "italic",
            color: "rgba(245,230,200,0.75)",
            lineHeight: 1.7,
            marginBottom: "0.5rem",
          }}
        >
          You have completed your first read
          <br />
          of Chapter {chapter.romanNumeral}.
        </p>

        <p
          style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "0.85rem",
            color: "rgba(245,230,200,0.3)",
            fontStyle: "italic",
            marginBottom: "2rem",
          }}
        >
          Your marks are sealed here.
          The chapter enters Archive Mode.
        </p>

        <button
          onClick={onDismiss}
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.6rem",
            letterSpacing: "0.2em",
            color: "#C9A84C",
            background: "transparent",
            border: "1px solid rgba(201,168,76,0.4)",
            padding: "0.6rem 1.5rem",
            cursor: "pointer",
            borderRadius: "1px",
            textTransform: "uppercase",
          }}
        >
          Acknowledge
        </button>
      </motion.div>
    </motion.div>
  );
}
