"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { playArchiveMode } from "@/lib/sound";
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
import SubscriptionModal from "@/components/ui/SubscriptionModal";
import type { SubscriptionTierName } from "@/components/ui/SubscriptionModal";
import ContinueReadingToast from "@/components/ui/ContinueReadingToast";
import InkTutorial from "@/components/ui/InkTutorial";
import Link from "next/link";

// ─── READING SURFACE ─────────────────────────────────────────────────────────
// The complete reading environment. This is the heart of Tintaxis.
// All subsystems are orchestrated here.

interface ReadingSurfaceProps {
  chapter: Chapter;
  nextChapter?: Chapter | null;
  prevChapter?: Chapter | null;
}

export default function ReadingSurface({ chapter, nextChapter, prevChapter }: ReadingSurfaceProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeInkType, setActiveInkTypeState] = useState<InkType>("ghost");
  const [marginLayer, setMarginLayer] = useState<MarginLayer>("mine");
  const [signalModalOpen, setSignalModalOpen] = useState(false);
  const [signalSelectedText, setSignalSelectedText] = useState("");
  const [questionAsked, setQuestionAsked] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showCompletionEvent, setShowCompletionEvent] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [gateTier, setGateTier] = useState<SubscriptionTierName | undefined>(undefined);
  const [gateFeatureName, setGateFeatureName] = useState<string | undefined>(undefined);
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
        setTimeout(() => {
          playArchiveMode();
          setShowCompletionEvent(true);
        }, 800);
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

  // ── Handle subscription gate trigger ──────────────────────
  const handleGateTriggered = useCallback((tier: SubscriptionTierName, featureName: string) => {
    setGateTier(tier);
    setGateFeatureName(featureName);
    setSubscriptionModalOpen(true);
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
          // On mobile: no left padding (toolbar collapses to bottom)
          // On desktop: offset for left toolbar
          paddingLeft: "var(--toolbar-offset, 52px)",
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
            // Mobile: tighter padding; desktop: generous
            padding: "clamp(5rem, 10vw, 8rem) clamp(1.25rem, 5vw, 3rem) 12rem",
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

          {/* ── Chapter navigation ───────────────────────────── */}
          <ChapterEndNav
            prevChapter={prevChapter}
            nextChapter={nextChapter}
            onGateTriggered={handleGateTriggered}
          />
        </div>

        {/* ── Margin World — hidden on mobile, right rail on desktop ── */}
        <div className="margin-world-rail">
          <MarginWorld
            annotations={annotations}
            chapterSlug={chapter.slug}
            activeLayer={marginLayer}
            onLayerChange={setMarginLayer}
            onAnnotationUpdated={handleAnnotationUpdated}
            onAnnotationDeleted={handleAnnotationDeleted}
            onGateTriggered={handleGateTriggered}
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

      {/* ── Subscription Gate Modal ──────────────────────────── */}
      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        triggeredBy={gateTier}
        featureName={gateFeatureName}
        onClose={() => setSubscriptionModalOpen(false)}
      />

      {/* ── Continue Reading toast ───────────────────────────── */}
      <ContinueReadingToast
        chapterSlug={chapter.slug}
        chapterRomanNumeral={chapter.romanNumeral}
      />

      {/* ── First-visit ink tutorial ─────────────────────────── */}
      <InkTutorial />
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
  const [phase, setPhase] = useState<"seal" | "reveal">("seal");

  useEffect(() => {
    const t = setTimeout(() => setPhase("reveal"), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(13,11,8,0.97)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Expanding brass ring ────────────────────────── */}
      <motion.div
        className="absolute"
        style={{
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          border: "1px solid rgba(201,168,76,0.2)",
        }}
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 3.5, opacity: 0 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
      />
      <motion.div
        className="absolute"
        style={{
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          border: "1px solid rgba(201,168,76,0.15)",
        }}
        initial={{ scale: 0, opacity: 0.6 }}
        animate={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
      />

      {/* ── Main panel ──────────────────────────────────── */}
      <motion.div
        style={{
          maxWidth: "480px",
          width: "100%",
          margin: "0 1.5rem",
          textAlign: "center",
          position: "relative",
          zIndex: 2,
        }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.2, 0, 0.1, 1] }}
      >
        {/* Label */}
        <motion.p
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.55rem",
            letterSpacing: "0.35em",
            color: "rgba(201,168,76,0.4)",
            textTransform: "uppercase",
            marginBottom: "2rem",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          First Read · Sealed
        </motion.p>

        {/* Brass ornament */}
        <motion.div
          style={{ marginBottom: "1.5rem" }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <div className="brass-line" />
        </motion.div>

        {/* Chapter identity */}
        <AnimatePresence>
          {phase === "reveal" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <p
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.55rem",
                  letterSpacing: "0.25em",
                  color: "rgba(201,168,76,0.5)",
                  textTransform: "uppercase",
                  marginBottom: "0.75rem",
                }}
              >
                Chapter {chapter.romanNumeral}
              </p>
              <p
                style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "clamp(1.25rem, 4vw, 1.75rem)",
                  fontStyle: "italic",
                  color: "rgba(245,230,200,0.85)",
                  lineHeight: 1.4,
                  marginBottom: "0.5rem",
                  letterSpacing: "-0.01em",
                }}
              >
                {chapter.title}
              </p>
              <p
                style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "0.95rem",
                  fontStyle: "italic",
                  color: "rgba(245,230,200,0.3)",
                  lineHeight: 1.6,
                  marginBottom: "2.5rem",
                }}
              >
                Your marks are in the Archive.
                <br />
                They will be here when you return.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom rule */}
        <motion.div
          style={{ marginBottom: "2rem" }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          <div className="brass-line" />
        </motion.div>

        {/* Acknowledge */}
        <motion.button
          onClick={onDismiss}
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.6rem",
            letterSpacing: "0.25em",
            color: "#C9A84C",
            background: "transparent",
            border: "1px solid rgba(201,168,76,0.35)",
            padding: "0.75rem 2rem",
            cursor: "pointer",
            borderRadius: "1px",
            textTransform: "uppercase",
            position: "relative",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          whileHover={{
            borderColor: "rgba(201,168,76,0.8)",
            boxShadow: "0 0 20px rgba(201,168,76,0.15)",
          }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Corner accents */}
          {["top-0 left-0 border-t border-l","top-0 right-0 border-t border-r","bottom-0 left-0 border-b border-l","bottom-0 right-0 border-b border-r"].map((cls, i) => (
            <span key={i} className={`absolute w-2 h-2 ${cls}`} style={{ borderColor: "#C9A84C" }} />
          ))}
          I have read this chapter
        </motion.button>
      </motion.div>
    </motion.div>
  );
}


// ─── CHAPTER END NAV ─────────────────────────────────────────────────────────
// Navigation strip at the bottom of the reading column.
// Shows prev chapter (if any) and next chapter (open or sealed).

interface ChapterEndNavProps {
  prevChapter?: Chapter | null;
  nextChapter?: Chapter | null;
  onGateTriggered: (tier: SubscriptionTierName, featureName: string) => void;
}

function ChapterEndNav({ prevChapter, nextChapter, onGateTriggered }: ChapterEndNavProps) {
  if (!prevChapter && !nextChapter) return null;

  return (
    <motion.div
      style={{
        marginTop: "4rem",
        paddingTop: "3rem",
        paddingBottom: "3rem",
        borderTop: "1px solid rgba(201,168,76,0.1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "stretch",
        gap: "1rem",
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
    >
      {/* ── Previous chapter ── */}
      <div style={{ flex: 1 }}>
        {prevChapter && (
          <Link href={`/chapter/${prevChapter.slug}`} style={{ textDecoration: "none" }}>
            <motion.div
              style={{
                padding: "1rem",
                border: "1px solid rgba(201,168,76,0.12)",
                background: "rgba(201,168,76,0.02)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: "0.3rem",
              }}
              whileHover={{
                borderColor: "rgba(201,168,76,0.3)",
                background: "rgba(201,168,76,0.05)",
              }}
              transition={{ duration: 0.2 }}
            >
              <span
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.5rem",
                  letterSpacing: "0.2em",
                  color: "rgba(201,168,76,0.4)",
                  textTransform: "uppercase",
                }}
              >
                ← Previous
              </span>
              <span
                style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "0.95rem",
                  fontStyle: "italic",
                  color: "rgba(245,230,200,0.65)",
                  lineHeight: 1.3,
                }}
              >
                {prevChapter.title}
              </span>
              <span
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.5rem",
                  letterSpacing: "0.1em",
                  color: "rgba(201,168,76,0.3)",
                  textTransform: "uppercase",
                }}
              >
                Chapter {prevChapter.romanNumeral}
              </span>
            </motion.div>
          </Link>
        )}
      </div>

      {/* ── Divider ── */}
      {prevChapter && nextChapter && (
        <div
          style={{
            width: "1px",
            background:
              "linear-gradient(180deg, transparent, rgba(201,168,76,0.2) 30%, rgba(201,168,76,0.2) 70%, transparent)",
            alignSelf: "stretch",
          }}
        />
      )}

      {/* ── Next chapter ── */}
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
        {nextChapter && (
          nextChapter.isLocked ? (
            // Locked — clicking opens subscription gate
            <motion.button
              onClick={() => onGateTriggered("codex", `Chapter ${nextChapter.romanNumeral}`)}
              style={{
                width: "100%",
                padding: "1rem",
                border: "1px solid rgba(201,168,76,0.08)",
                background: "rgba(201,168,76,0.01)",
                cursor: "pointer",
                textAlign: "right",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "0.3rem",
              }}
              whileHover={{
                borderColor: "rgba(201,168,76,0.18)",
                background: "rgba(201,168,76,0.03)",
              }}
              transition={{ duration: 0.2 }}
            >
              <span
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.5rem",
                  letterSpacing: "0.2em",
                  color: "rgba(201,168,76,0.3)",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                Next →
                <span style={{ fontSize: "0.65rem" }}>⚿</span>
              </span>
              <span
                style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "0.95rem",
                  fontStyle: "italic",
                  color: "rgba(245,230,200,0.3)",
                  lineHeight: 1.3,
                }}
              >
                {nextChapter.title}
              </span>
              <span
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.5rem",
                  letterSpacing: "0.1em",
                  color: "rgba(201,168,76,0.2)",
                  textTransform: "uppercase",
                }}
              >
                Chapter {nextChapter.romanNumeral} · Sealed
              </span>
            </motion.button>
          ) : (
            // Open chapter
            <Link href={`/chapter/${nextChapter.slug}`} style={{ textDecoration: "none", width: "100%" }}>
              <motion.div
                style={{
                  padding: "1rem",
                  border: "1px solid rgba(201,168,76,0.15)",
                  background: "rgba(201,168,76,0.03)",
                  cursor: "pointer",
                  textAlign: "right",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "0.3rem",
                }}
                whileHover={{
                  borderColor: "rgba(201,168,76,0.4)",
                  background: "rgba(201,168,76,0.07)",
                }}
                transition={{ duration: 0.2 }}
              >
                <span
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.5rem",
                    letterSpacing: "0.2em",
                    color: "rgba(201,168,76,0.5)",
                    textTransform: "uppercase",
                  }}
                >
                  Next →
                </span>
                <span
                  style={{
                    fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                    fontSize: "0.95rem",
                    fontStyle: "italic",
                    color: "rgba(245,230,200,0.7)",
                    lineHeight: 1.3,
                  }}
                >
                  {nextChapter.title}
                </span>
                <span
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.5rem",
                    letterSpacing: "0.1em",
                    color: "rgba(201,168,76,0.35)",
                    textTransform: "uppercase",
                  }}
                >
                  Chapter {nextChapter.romanNumeral}
                </span>
              </motion.div>
            </Link>
          )
        )}
      </div>
    </motion.div>
  );
}
