"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { InkType } from "@/lib/types";
import { INK_CONFIGS } from "@/lib/types";

// ─── INK TOOLBAR ─────────────────────────────────────────────────────────────
// The six instruments of annotation. Fixed on the left rail of the reading surface.
// Phase 1: Ghost Ink fully active. Others display as "available in beta."

interface InkToolbarProps {
  activeInkType: InkType;
  onInkChange: (ink: InkType) => void;
  isPhase1?: boolean; // Lock non-Ghost inks in Phase 1
}

// Ink tool display order
const INK_ORDER: InkType[] = ["ghost", "ember", "copper", "archive", "signal", "memory"];

// Phase 1: only Ghost is fully active for personal notes
// Signal is available for questions (Phase 1 core feature)
const PHASE_1_ACTIVE: InkType[] = ["ghost", "signal"];

export default function InkToolbar({
  activeInkType,
  onInkChange,
  isPhase1 = false,
}: InkToolbarProps) {
  const [hoveredInk, setHoveredInk] = useState<InkType | null>(null);

  // Broadcast ink changes so ChapterNav can show the active ink
  const handleInkSelect = (inkType: InkType) => {
    const config = INK_CONFIGS[inkType];
    window.dispatchEvent(
      new CustomEvent("inkchange", {
        detail: { color: config.color, label: config.label },
      })
    );
    onInkChange(inkType);
  };

  return (
    <div
      className="fixed left-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center ink-toolbar-fixed"
      style={{
        gap: "0px",
        paddingLeft: "0",
      }}
    >
      {/* ── Vertical brass rail ────────────────────────────── */}
      <div
        className="rail-top"
        style={{
          width: "1px",
          height: "24px",
          background: "linear-gradient(to bottom, transparent, rgba(201,168,76,0.3))",
          marginBottom: "2px",
        }}
      />

      {INK_ORDER.map((inkType) => {
        const config = INK_CONFIGS[inkType];
        const isActive = activeInkType === inkType;
        const isLocked = isPhase1 && !PHASE_1_ACTIVE.includes(inkType);
        const isHovered = hoveredInk === inkType;

        return (
          <div key={inkType} className="relative group">
            <motion.button
              onClick={() => !isLocked && handleInkSelect(inkType)}
              onMouseEnter={() => setHoveredInk(inkType)}
              onMouseLeave={() => setHoveredInk(null)}
              className="relative flex items-center justify-center"
              style={{
                width: "44px",
                height: "44px",
                background: isActive
                  ? `rgba(${hexToRgb(config.color)}, 0.12)`
                  : "transparent",
                border: "none",
                borderRight: isActive
                  ? `2px solid ${config.color}`
                  : "2px solid transparent",
                cursor: isLocked ? "not-allowed" : "pointer",
                opacity: isLocked ? 0.35 : 1,
                transition: "all 0.2s ease",
              }}
              whileHover={!isLocked ? { x: 3 } : {}}
              whileTap={!isLocked ? { scale: 0.95 } : {}}
            >
              <InkIcon
                inkType={inkType}
                color={config.color}
                isActive={isActive}
                isLocked={isLocked}
              />

              {/* Active glow */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 100% 50%, ${config.glowColor} 0%, transparent 70%)`,
                  }}
                  layoutId="activeInkGlow"
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              )}
            </motion.button>

            {/* ── Tooltip on hover ──────────────────────────── */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  className="absolute left-full top-1/2 -translate-y-1/2 ml-3 pointer-events-none"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15 }}
                >
                  <div
                    style={{
                      background: "#1A1208",
                      border: `1px solid ${config.color}50`,
                      boxShadow: `0 4px 16px rgba(0,0,0,0.8), 0 0 8px ${config.glowColor}`,
                      padding: "0.4rem 0.7rem",
                      borderRadius: "2px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: "0.6rem",
                        letterSpacing: "0.15em",
                        color: config.color,
                        textTransform: "uppercase",
                        marginBottom: "2px",
                      }}
                    >
                      {config.label}
                      {isLocked && (
                        <span style={{ color: "rgba(245,230,200,0.3)", marginLeft: "0.5em" }}>
                          [BETA]
                        </span>
                      )}
                    </p>
                    <p
                      style={{
                        fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                        fontSize: "0.75rem",
                        fontStyle: "italic",
                        color: "rgba(245,230,200,0.5)",
                      }}
                    >
                      {config.description}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* ── Bottom rail ────────────────────────────────────── */}
      <div
        className="rail-bottom"
        style={{
          width: "1px",
          height: "24px",
          background: "linear-gradient(to bottom, rgba(201,168,76,0.3), transparent)",
          marginTop: "2px",
        }}
      />
    </div>
  );
}

// ─── INK ICON ────────────────────────────────────────────────────────────────
// Each ink type has a distinct glyph. SVG, minimal, period-appropriate.

function InkIcon({
  inkType,
  color,
  isActive,
  isLocked,
}: {
  inkType: InkType;
  color: string;
  isActive: boolean;
  isLocked: boolean;
}) {
  const opacity = isActive ? 1 : 0.5;

  const icons: Record<InkType, React.ReactNode> = {
    // Ghost — eye (private, invisible)
    ghost: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" opacity={opacity}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
        {isLocked && <line x1="4" y1="4" x2="20" y2="20" strokeWidth="1" stroke="rgba(160,168,168,0.5)" />}
      </svg>
    ),
    // Ember — flame (emotional)
    ember: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" opacity={opacity}>
        <path d="M12 2c0 0-6 5-6 10a6 6 0 0 0 12 0c0-5-6-10-6-10z" />
        <path d="M12 12c0 0-2 1.5-2 3a2 2 0 0 0 4 0c0-1.5-2-3-2-3z" fill={color} fillOpacity="0.3" />
      </svg>
    ),
    // Copper — gear / cog (intellectual, mechanical)
    copper: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" opacity={opacity}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
      </svg>
    ),
    // Archive — book / pages (factual)
    archive: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" opacity={opacity}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="8" y1="7" x2="16" y2="7" strokeWidth="1" />
        <line x1="8" y1="11" x2="14" y2="11" strokeWidth="1" />
      </svg>
    ),
    // Signal — radio wave (transmission to author)
    signal: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" opacity={opacity}>
        <path d="M5.636 18.364a9 9 0 0 1 0-12.728" />
        <path d="M18.364 5.636a9 9 0 0 1 0 12.728" />
        <path d="M8.465 15.535a5 5 0 0 1 0-7.07" />
        <path d="M15.535 8.465a5 5 0 0 1 0 7.07" />
        <circle cx="12" cy="12" r="1.5" fill={color} />
      </svg>
    ),
    // Memory — hourglass (personal past)
    memory: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" opacity={opacity}>
        <path d="M5 22h14" />
        <path d="M5 2h14" />
        <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
        <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
      </svg>
    ),
  };

  return (
    <motion.span
      animate={isActive ? { filter: `drop-shadow(0 0 6px ${color})` } : { filter: "none" }}
      transition={{ duration: 0.3 }}
    >
      {icons[inkType]}
    </motion.span>
  );
}

// ─── UTILITY ─────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "201,168,76";
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}
