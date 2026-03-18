"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Annotation, MarginLayer } from "@/lib/types";
import { INK_CONFIGS } from "@/lib/types";
import { deleteAnnotation, updateAnnotationNote } from "@/lib/ink";
import AuthorWhisper, { DEMO_WHISPERS } from "./AuthorWhisper";

// ─── MARGIN WORLD ────────────────────────────────────────────────────────────
// The living right rail where annotations surface as floating steam.
// Phase 1: "My Ink" layer only (Ghost Ink notes + any ink the reader has applied).
// Phase 2: Author Ink, Community Ink, All layers.

interface MarginWorldProps {
  annotations: Annotation[];
  chapterSlug: string;
  activeLayer: MarginLayer;
  onLayerChange: (layer: MarginLayer) => void;
  onAnnotationUpdated: (annotation: Annotation) => void;
  onAnnotationDeleted: (id: string) => void;
}

export default function MarginWorld({
  annotations,
  chapterSlug,
  activeLayer,
  onLayerChange,
  onAnnotationUpdated,
  onAnnotationDeleted,
}: MarginWorldProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Sort by paragraph order
  const sorted = [...annotations].sort(
    (a, b) => a.selection.paragraphIndex - b.selection.paragraphIndex
  );

  return (
    <div
      className="flex flex-col"
      style={{
        width: "240px",
        minHeight: "100vh",
        paddingTop: "6rem",
        paddingLeft: "1.5rem",
      }}
    >
      {/* ── Layer selector ─────────────────────────────────── */}
      <LayerSelector activeLayer={activeLayer} onLayerChange={onLayerChange} />

      {/* ── Author Whispers — always visible ──────────────── */}
      <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column" }}>
        <p
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.5rem",
            letterSpacing: "0.2em",
            color: "rgba(201,168,76,0.4)",
            textTransform: "uppercase",
            marginBottom: "0.75rem",
          }}
        >
          Author
        </p>
        {DEMO_WHISPERS.map((whisper) => (
          <AuthorWhisper key={whisper.id} whisper={whisper} />
        ))}
      </div>

      {/* ── Brass divider ─────────────────────────────────── */}
      <div className="brass-line" style={{ margin: "1rem 0" }} />

      {/* ── Annotations ────────────────────────────────────── */}
      <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <AnimatePresence mode="popLayout">
          {sorted.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "0.8rem",
                fontStyle: "italic",
                color: "rgba(245,230,200,0.2)",
                lineHeight: 1.6,
              }}
            >
              The margins are silent.
              <br />Select text to leave your mark.
            </motion.div>
          ) : (
            sorted.map((annotation) => (
              <MarginNote
                key={annotation.id}
                annotation={annotation}
                chapterSlug={chapterSlug}
                isExpanded={expandedId === annotation.id}
                onExpand={() =>
                  setExpandedId(expandedId === annotation.id ? null : annotation.id)
                }
                onUpdated={onAnnotationUpdated}
                onDeleted={() => {
                  deleteAnnotation(chapterSlug, annotation.id);
                  onAnnotationDeleted(annotation.id);
                }}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* ── Annotation count ──────────────────────────────── */}
      {sorted.length > 0 && (
        <motion.div
          style={{
            marginTop: "2rem",
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.55rem",
            letterSpacing: "0.18em",
            color: "rgba(201,168,76,0.3)",
            textTransform: "uppercase",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {sorted.length} {sorted.length === 1 ? "mark" : "marks"} in this chapter
        </motion.div>
      )}
    </div>
  );
}

// ─── LAYER SELECTOR ──────────────────────────────────────────────────────────

const LAYERS: { id: MarginLayer; label: string; available: boolean }[] = [
  { id: "mine",      label: "My Ink",    available: true },
  { id: "author",    label: "Author",    available: false }, // Phase 2
  { id: "community", label: "Archive",   available: false }, // Phase 2
  { id: "all",       label: "All",       available: false }, // Phase 2
];

function LayerSelector({
  activeLayer,
  onLayerChange,
}: {
  activeLayer: MarginLayer;
  onLayerChange: (layer: MarginLayer) => void;
}) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      {LAYERS.map(({ id, label, available }) => (
        <button
          key={id}
          onClick={() => available && onLayerChange(id)}
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.55rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: activeLayer === id
              ? "#C9A84C"
              : available
                ? "rgba(245,230,200,0.35)"
                : "rgba(245,230,200,0.15)",
            background: "transparent",
            border: activeLayer === id
              ? "1px solid rgba(201,168,76,0.4)"
              : "1px solid transparent",
            padding: "0.2rem 0.45rem",
            cursor: available ? "pointer" : "default",
            borderRadius: "1px",
            transition: "all 0.2s ease",
          }}
        >
          {label}
          {!available && (
            <span style={{ marginLeft: "0.2em", opacity: 0.5, fontSize: "0.5rem" }}>↑</span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── MARGIN NOTE ─────────────────────────────────────────────────────────────

interface MarginNoteProps {
  annotation: Annotation;
  chapterSlug: string;
  isExpanded: boolean;
  onExpand: () => void;
  onUpdated: (annotation: Annotation) => void;
  onDeleted: () => void;
}

function MarginNote({
  annotation,
  chapterSlug,
  isExpanded,
  onExpand,
  onUpdated,
  onDeleted,
}: MarginNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [noteValue, setNoteValue] = useState(annotation.note);
  const config = INK_CONFIGS[annotation.inkType];

  const saveEdit = () => {
    updateAnnotationNote(chapterSlug, annotation.id, noteValue);
    onUpdated({ ...annotation, note: noteValue });
    setIsEditing(false);
  };

  return (
    <motion.div
      className="margin-annotation"
      layout
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: isExpanded ? 1 : 0.65, x: 0 }}
      exit={{ opacity: 0, x: 16, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        borderLeft: `2px solid ${config.color}`,
        paddingLeft: "0.6rem",
        paddingTop: "0.1rem",
        paddingBottom: "0.3rem",
      }}
    >
      {/* ── Ink type label ──────────────────────────────────── */}
      <div
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.5rem",
          letterSpacing: "0.18em",
          color: config.color,
          textTransform: "uppercase",
          marginBottom: "0.25rem",
          opacity: 0.8,
        }}
      >
        {config.label}
      </div>

      {/* ── Selected text excerpt ───────────────────────────── */}
      <button
        onClick={onExpand}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
          textAlign: "left",
          width: "100%",
        }}
      >
        <p
          style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "0.8rem",
            fontStyle: "italic",
            color: "rgba(245,230,200,0.5)",
            lineHeight: 1.5,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: isExpanded ? undefined : 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          &ldquo;{annotation.selection.text}&rdquo;
        </p>
      </button>

      {/* ── Expanded: note content ───────────────────────────── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ marginTop: "0.5rem" }}>
              {isEditing ? (
                <div>
                  <textarea
                    autoFocus
                    value={noteValue}
                    onChange={(e) => setNoteValue(e.target.value)}
                    rows={4}
                    style={{
                      width: "100%",
                      background: "rgba(13,11,8,0.8)",
                      border: "1px solid rgba(201,168,76,0.2)",
                      borderRadius: "1px",
                      padding: "0.4rem",
                      color: "#F5E6C8",
                      fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                      fontSize: "0.85rem",
                      lineHeight: 1.6,
                      resize: "none",
                      outline: "none",
                      marginBottom: "0.4rem",
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveEdit();
                      if (e.key === "Escape") setIsEditing(false);
                    }}
                  />
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <NoteActionBtn label="SAVE" color={config.color} onClick={saveEdit} />
                    <NoteActionBtn label="CANCEL" color="rgba(245,230,200,0.3)" onClick={() => setIsEditing(false)} />
                  </div>
                </div>
              ) : (
                <>
                  {annotation.note && (
                    <p
                      style={{
                        fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                        fontSize: "0.85rem",
                        color: "rgba(245,230,200,0.75)",
                        lineHeight: 1.65,
                        marginBottom: "0.4rem",
                        borderTop: "1px solid rgba(201,168,76,0.1)",
                        paddingTop: "0.4rem",
                      }}
                    >
                      {annotation.note}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.25rem" }}>
                    <NoteActionBtn
                      label={annotation.note ? "EDIT" : "+ NOTE"}
                      color="rgba(245,230,200,0.3)"
                      onClick={() => setIsEditing(true)}
                    />
                    <NoteActionBtn
                      label="REMOVE"
                      color="rgba(139,26,26,0.5)"
                      onClick={onDeleted}
                    />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Timestamp ───────────────────────────────────────── */}
      <p
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.5rem",
          color: "rgba(245,230,200,0.2)",
          letterSpacing: "0.1em",
          marginTop: "0.3rem",
        }}
      >
        {new Date(annotation.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </motion.div>
  );
}

// ─── NOTE ACTION BUTTON ──────────────────────────────────────────────────────

function NoteActionBtn({
  label,
  color,
  onClick,
}: {
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "0.5rem",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color,
        background: "transparent",
        border: `1px solid ${color}40`,
        padding: "0.15rem 0.35rem",
        cursor: "pointer",
        borderRadius: "1px",
        transition: "all 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}
