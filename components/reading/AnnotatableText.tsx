"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { InkType, Annotation, TextSelection } from "@/lib/types";
import { INK_CONFIGS } from "@/lib/types";
import { saveAnnotation, captureSelection } from "@/lib/ink";
import { playInkScratch } from "@/lib/sound";

// ─── ANNOTATABLE TEXT ────────────────────────────────────────────────────────
// A single paragraph with full annotation capability.
// Handles text selection → ink application → note entry → persistence.

interface AnnotatableTextProps {
  text: string;
  paragraphIndex: number;
  chapterSlug: string;
  activeInkType: InkType;
  annotations: Annotation[];
  onAnnotationCreated: (annotation: Annotation) => void;
  isEpigraph?: boolean;
  isFirstParagraph?: boolean;
}

interface SelectionState {
  selection: TextSelection;
  rect: DOMRect;
}

export default function AnnotatableText({
  text,
  paragraphIndex,
  chapterSlug,
  activeInkType,
  annotations,
  onAnnotationCreated,
  isEpigraph = false,
  isFirstParagraph = false,
}: AnnotatableTextProps) {
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const [pendingSelection, setPendingSelection] = useState<SelectionState | null>(null);
  const [noteValue, setNoteValue] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [justAnnotated, setJustAnnotated] = useState<string | null>(null);

  const inkConfig = INK_CONFIGS[activeInkType];

  // ── Handle text selection (mouse + touch) ─────────────────────
  //
  // Strategy:
  // 1. Capture the selection IMMEDIATELY on selectionchange — no debounce.
  //    This ensures we save the selection before the OS native menu
  //    (iOS "Copy/Define", Android toolbar) can dismiss it and fire
  //    another selectionchange that would reset a debounce timer.
  // 2. Once pendingSelection is set, do NOT clear it when the selection
  //    subsequently becomes empty (e.g. user dismisses OS menu).
  //    Only dismiss() or apply() clears it explicitly.
  // 3. The InkTooltip uses onPointerDown (not onClick) so the MARK tap
  //    registers before the synthetic mousedown clears the selection.

  const captureCurrentSelection = useCallback(() => {
    if (!paragraphRef.current) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

    const range = sel.getRangeAt(0);

    // Check selection is inside this paragraph
    const node = range.commonAncestorContainer;
    const inParagraph =
      paragraphRef.current === node ||
      paragraphRef.current.contains(node);
    if (!inParagraph) return;

    const captured = captureSelection(paragraphIndex);
    if (!captured) return;

    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    setPendingSelection({ selection: captured, rect });
    setNoteValue("");
    setShowNoteInput(false);
  }, [paragraphIndex]);

  // Listen to selectionchange with no debounce — capture immediately
  useEffect(() => {
    document.addEventListener("selectionchange", captureCurrentSelection);
    return () => {
      document.removeEventListener("selectionchange", captureCurrentSelection);
    };
  }, [captureCurrentSelection]);

  // Clear tooltip on scroll so a stale fixed-position tooltip never floats
  // orphaned above the wrong text.  Uses passive listener for performance.
  useEffect(() => {
    if (!pendingSelection) return; // no tooltip → no listener needed
    const onScroll = () => {
      setPendingSelection(null);
      setShowNoteInput(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pendingSelection]);

  // Desktop: also capture on mouseup (instant, redundant but harmless)
  const handleMouseUp = useCallback(() => {
    captureCurrentSelection();
  }, [captureCurrentSelection]);

  // Touch: capture 60ms after finger lifts (browser needs one tick to
  // commit the selection object on iOS before we can read it)
  const handleTouchEnd = useCallback(() => {
    setTimeout(captureCurrentSelection, 60);
  }, [captureCurrentSelection]);

  // ── Apply ink to selection ─────────────────────────────────────
  const applyInk = useCallback((withNote: boolean) => {
    if (!pendingSelection) return;

    if (withNote) {
      setShowNoteInput(true);
      return;
    }

    const annotation = saveAnnotation(
      chapterSlug,
      activeInkType,
      pendingSelection.selection,
      ""
    );

    playInkScratch(activeInkType);
    onAnnotationCreated(annotation);
    setJustAnnotated(annotation.id);
    setTimeout(() => setJustAnnotated(null), 1200);

    setPendingSelection(null);
    window.getSelection()?.removeAllRanges();
  }, [pendingSelection, chapterSlug, activeInkType, onAnnotationCreated]);

  const applyInkWithNote = useCallback(() => {
    if (!pendingSelection) return;

    const annotation = saveAnnotation(
      chapterSlug,
      activeInkType,
      pendingSelection.selection,
      noteValue
    );

    playInkScratch(activeInkType);
    onAnnotationCreated(annotation);
    setJustAnnotated(annotation.id);
    setTimeout(() => setJustAnnotated(null), 1200);

    setPendingSelection(null);
    setShowNoteInput(false);
    setNoteValue("");
    window.getSelection()?.removeAllRanges();
  }, [pendingSelection, chapterSlug, activeInkType, noteValue, onAnnotationCreated]);

  const dismiss = useCallback(() => {
    setPendingSelection(null);
    setShowNoteInput(false);
    setNoteValue("");
    window.getSelection()?.removeAllRanges();
  }, []);

  // ── Build highlighted text spans ──────────────────────────────
  // For Phase 1: simple full-paragraph highlight detection.
  // Phase 2 will implement proper character-offset span splitting.
  const hasAnnotation = annotations.some(
    (a) => a.selection.paragraphIndex === paragraphIndex
  );
  const paragraphAnnotations = annotations.filter(
    (a) => a.selection.paragraphIndex === paragraphIndex
  );

  // ── Paragraph styles ──────────────────────────────────────────
  const paragraphStyle: React.CSSProperties = {
    fontFamily: '"EB Garamond", Garamond, Georgia, serif',
    fontSize: "clamp(1.0625rem, 2vw, 1.1875rem)",
    lineHeight: 1.9,
    letterSpacing: "0.01em",
    color: "#F5E6C8",
    textIndent: isFirstParagraph || isEpigraph ? "0" : "2em",
    marginBottom: "1.5em",
    position: "relative",
    cursor: "text",
    userSelect: "text",
  };

  if (isEpigraph) {
    Object.assign(paragraphStyle, {
      fontStyle: "italic",
      color: "rgba(245,230,200,0.65)",
      fontSize: "1rem",
      lineHeight: 1.7,
      textAlign: "center" as const,
      textIndent: "0",
      marginBottom: "2.5em",
    });
  }

  return (
    <div className="relative" style={{ position: "relative" }}>
      {/* ── The text ────────────────────────────────────────── */}
      <p
        ref={paragraphRef}
        style={paragraphStyle}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleTouchEnd}
        className={`reading-surface ${hasAnnotation ? "has-annotation" : ""}`}
        data-paragraph={paragraphIndex}
      >
        {renderAnnotatedText(text, paragraphAnnotations)}
      </p>

      {/* ── Annotation count indicator ──────────────────────── */}
      {paragraphAnnotations.length > 0 && (
        <div
          className="absolute -left-6 top-1"
          style={{ display: "flex", flexDirection: "column", gap: "3px" }}
        >
          {paragraphAnnotations.slice(0, 3).map((a) => (
            <div
              key={a.id}
              className="w-1 h-1 rounded-full opacity-60"
              style={{ backgroundColor: INK_CONFIGS[a.inkType].color }}
              title={`${INK_CONFIGS[a.inkType].label}`}
            />
          ))}
        </div>
      )}

      {/* ── Ink tooltip + Note panel (portaled to body) ─────── */}
      <TooltipPortal>
        <AnimatePresence>
          {pendingSelection && !showNoteInput && (
            <InkTooltip
              rect={pendingSelection.rect}
              inkConfig={inkConfig}
              onApply={() => applyInk(false)}
              onApplyWithNote={() => applyInk(true)}
              onDismiss={dismiss}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {pendingSelection && showNoteInput && (
            <NoteInputPanel
              rect={pendingSelection.rect}
              inkConfig={inkConfig}
              selectedText={pendingSelection.selection.text}
              value={noteValue}
              onChange={setNoteValue}
              onSave={applyInkWithNote}
              onDismiss={dismiss}
            />
          )}
        </AnimatePresence>
      </TooltipPortal>

      {/* ── Ink applied flash ───────────────────────────────── */}
      <AnimatePresence>
        {justAnnotated && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded"
            style={{ backgroundColor: inkConfig.color }}
            initial={{ opacity: 0.15 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── RENDER ANNOTATED TEXT ──────────────────────────────────────────────────
// Phase 1: highlights the full text of any annotation that matches this paragraph.
// Phase 2: split into character spans for precise offset-based highlighting.

function renderAnnotatedText(text: string, annotations: Annotation[]): React.ReactNode {
  if (annotations.length === 0) return text;

  // For Phase 1, apply the first annotation's highlight class to the full paragraph
  // (real span splitting is Phase 2)
  const topAnnotation = annotations[0];
  const config = INK_CONFIGS[topAnnotation.inkType];

  return (
    <span
      className={`ink-highlight ${config.highlightClass}`}
      title={topAnnotation.note || config.label}
    >
      {text}
    </span>
  );
}

// ─── INK TOOLTIP ────────────────────────────────────────────────────────────

interface InkTooltipProps {
  rect: DOMRect;
  inkConfig: typeof INK_CONFIGS[InkType];
  onApply: () => void;
  onApplyWithNote: () => void;
  onDismiss: () => void;
}

function InkTooltip({ rect, inkConfig, onApply, onApplyWithNote, onDismiss }: InkTooltipProps) {
  // Center above selection in VIEWPORT coordinates (position: fixed).
  // No window.scrollY math needed — rect is already viewport-relative.
  const TOOLTIP_W = 220; // approximate max width
  const MARGIN = 8;
  const rawLeft = rect.left + rect.width / 2;
  const clampedLeft = Math.min(
    Math.max(rawLeft, MARGIN + TOOLTIP_W / 2),
    (typeof window !== "undefined" ? window.innerWidth : 800) - MARGIN - TOOLTIP_W / 2
  );
  // If near top of viewport show below selection instead
  const rawTop = rect.top - 56;
  const top = rawTop < 8 ? rect.bottom + 8 : rawTop;
  const left = clampedLeft;

  return (
    <motion.div
      className="z-50 flex items-center gap-1"
      onMouseDown={(e) => e.preventDefault()}
      style={{
        position: "fixed",      // viewport-relative — no scroll drift
        pointerEvents: "auto",  // only this element, not the portal wrapper
        top,
        left,
        transform: "translateX(-50%)",
        background: "#1A1208",
        border: `1px solid ${inkConfig.color}`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.8), 0 0 12px ${inkConfig.glowColor}`,
        borderRadius: "2px",
        padding: "0.4rem 0.6rem",
        whiteSpace: "nowrap",
      }}
      initial={{ opacity: 0, y: 4, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      {/* Ink type label */}
      <span
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.6rem",
          letterSpacing: "0.15em",
          color: inkConfig.color,
          textTransform: "uppercase",
          marginRight: "0.5rem",
        }}
      >
        {inkConfig.label}
      </span>

      {/* Mark button */}
      <button
        onPointerUp={(e) => { e.preventDefault(); onApply(); }}
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.6rem",
          letterSpacing: "0.1em",
          color: inkConfig.color,
          background: `rgba(${hexToRgb(inkConfig.color)}, 0.12)`,
          border: `1px solid ${inkConfig.color}40`,
          padding: "0.5rem 0.9rem",
          cursor: "pointer",
          borderRadius: "1px",
          minHeight: "40px",
          touchAction: "manipulation",
        }}
      >
        MARK
      </button>

      {/* Add note button */}
      <button
        onPointerUp={(e) => { e.preventDefault(); onApplyWithNote(); }}
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.6rem",
          letterSpacing: "0.1em",
          color: "rgba(245,230,200,0.5)",
          background: "transparent",
          border: "1px solid rgba(245,230,200,0.15)",
          padding: "0.5rem 0.9rem",
          cursor: "pointer",
          borderRadius: "1px",
          minHeight: "40px",
          touchAction: "manipulation",
        }}
      >
        + NOTE
      </button>

      {/* Dismiss */}
      <button
        onPointerUp={(e) => { e.preventDefault(); onDismiss(); }}
        style={{
          color: "rgba(245,230,200,0.25)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "0.5rem 0.75rem",
          fontSize: "0.85rem",
          lineHeight: 1,
          minHeight: "40px",
          touchAction: "manipulation",
        }}
      >
        ×
      </button>
    </motion.div>
  );
}

// ─── NOTE INPUT PANEL ───────────────────────────────────────────────────────

interface NoteInputPanelProps {
  rect: DOMRect;
  inkConfig: typeof INK_CONFIGS[InkType];
  selectedText: string;
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onDismiss: () => void;
}

function NoteInputPanel({
  rect,
  inkConfig,
  selectedText,
  value,
  onChange,
  onSave,
  onDismiss,
}: NoteInputPanelProps) {
  // Viewport-relative (position: fixed) — no scrollY offset needed
  const rawTop = rect.top - 196;
  const top = rawTop < 8 ? rect.bottom + 8 : rawTop;
  const left = rect.left + rect.width / 2;

  return (
    <motion.div
      className="z-50 w-full max-w-sm"
      style={{
        position: "fixed",      // viewport-relative
        pointerEvents: "auto",  // enable interaction on panel only
        top,
        left,
        transform: "translateX(-50%)",
        background: "#1A1208",
        border: `1px solid ${inkConfig.color}60`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.9), 0 0 16px ${inkConfig.glowColor}`,
        borderRadius: "2px",
        padding: "0.75rem",
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
    >
      {/* Selected text preview */}
      <p
        style={{
          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
          fontSize: "0.8rem",
          fontStyle: "italic",
          color: "rgba(245,230,200,0.45)",
          marginBottom: "0.5rem",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        &ldquo;{selectedText.slice(0, 60)}{selectedText.length > 60 ? "…" : ""}&rdquo;
      </p>

      {/* Ink label */}
      <div
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.55rem",
          letterSpacing: "0.2em",
          color: inkConfig.color,
          textTransform: "uppercase",
          marginBottom: "0.4rem",
        }}
      >
        {inkConfig.label} — {inkConfig.description}
      </div>

      {/* Note textarea */}
      <textarea
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Write your ${inkConfig.label.toLowerCase()} note…`}
        rows={3}
        style={{
          width: "100%",
          background: "rgba(13,11,8,0.8)",
          border: `1px solid rgba(201,168,76,0.2)`,
          borderRadius: "1px",
          padding: "0.5rem",
          color: "#F5E6C8",
          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
          fontSize: "0.9rem",
          lineHeight: 1.6,
          resize: "none",
          outline: "none",
          marginBottom: "0.5rem",
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSave();
          if (e.key === "Escape") onDismiss();
        }}
      />

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
        <button
          onClick={onDismiss}
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.6rem",
            letterSpacing: "0.1em",
            color: "rgba(245,230,200,0.3)",
            background: "transparent",
            border: "1px solid rgba(245,230,200,0.15)",
            padding: "0.25rem 0.6rem",
            cursor: "pointer",
            borderRadius: "1px",
          }}
        >
          CANCEL
        </button>
        <button
          onClick={onSave}
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.6rem",
            letterSpacing: "0.1em",
            color: inkConfig.color,
            background: `rgba(${hexToRgb(inkConfig.color)}, 0.12)`,
            border: `1px solid ${inkConfig.color}60`,
            padding: "0.25rem 0.6rem",
            cursor: "pointer",
            borderRadius: "1px",
          }}
        >
          SEAL INK
        </button>
      </div>
    </motion.div>
  );
}

// ─── TOOLTIP PORTAL ──────────────────────────────────────────────────────────
// Renders tooltip/note panel into document.body to escape any overflow clipping.
// Uses position: fixed viewport layer so no scroll-offset math is needed and
// the portal wrapper never intercepts touch events on the reading surface.

function TooltipPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;
  return createPortal(
    // pointer-events: none on the container — each child is responsible for
    // enabling its own pointer events.  This ensures the invisible full-screen
    // wrapper never swallows taps on the reading text below.
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none", overflow: "visible" }}>
      {children}
    </div>,
    document.body
  );
}

// ─── UTILITY ─────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "201,168,76";
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}
