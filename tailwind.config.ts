import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ─── SCRIPTORIUM COLOR SYSTEM ───────────────────────────────
      colors: {
        vault:    "#0D0B08",   // Vault Black      — deepest background
        archive:  "#2C1A00",   // Archive Amber    — panel surfaces
        parchment:"#F5E6C8",   // Parchment        — reading text surface
        brass:    "#C9A84C",   // Brass            — UI chrome, borders
        ember:    "#8B1A1A",   // Ember            — emotional ink / Ember Ink
        aether:   "#2E6B72",   // Aether           — Signal Ink / cyan-adjacent
        indigo:   "#2D1B5E",   // Indigo           — Memory Ink

        // Ink system — exact token per ink type
        ink: {
          ember:   "#C0392B",  // Ember Ink   — emotional (crimson)
          copper:  "#B87333",  // Copper Ink  — intellectual (bronze)
          ghost:   "#A0A8A8",  // Ghost Ink   — private (silver)
          archive: "#C9A84C",  // Archive Ink — factual (black-gold)
          signal:  "#00E5CC",  // Signal Ink  — questions (bioluminescent cyan)
          memory:  "#6B3FA0",  // Memory Ink  — personal (deep violet)
        },

        // Extended surfaces
        surface: {
          panel:   "#1A1208",  // Raised panels on vault background
          border:  "#3D2A0A",  // Subtle border between sections
          overlay: "#0D0B08CC",// Semi-transparent overlay (80% vault)
        },
      },

      // ─── TYPOGRAPHY ─────────────────────────────────────────────
      fontFamily: {
        // Body — archival, literary
        garamond: ["EB Garamond", "Garamond", "Georgia", "serif"],
        // UI labels — engineered, mechanical
        mono:     ["JetBrains Mono", "Courier New", "monospace"],
        // Author responses — quasi-handwritten serif
        author:   ["Cormorant Garamond", "Garamond", "serif"],
      },

      fontSize: {
        "reading-sm": ["1.0625rem", { lineHeight: "1.85", letterSpacing: "0.01em" }],
        "reading":    ["1.1875rem", { lineHeight: "1.9",  letterSpacing: "0.01em" }],
        "reading-lg": ["1.3125rem", { lineHeight: "1.9",  letterSpacing: "0.01em" }],
        "chapter-num":["0.6875rem", { lineHeight: "1",    letterSpacing: "0.25em" }],
        "chapter-title":["2.25rem", { lineHeight: "1.2",  letterSpacing: "-0.01em"}],
        "ui-label":   ["0.6875rem", { lineHeight: "1",    letterSpacing: "0.18em" }],
        "ui-sm":      ["0.75rem",   { lineHeight: "1.4",  letterSpacing: "0.08em" }],
      },

      // ─── ANIMATION ──────────────────────────────────────────────
      keyframes: {
        // Annotation vapor drift
        vaporDrift: {
          "0%":   { transform: "translateY(0px) translateX(0px)", opacity: "0" },
          "15%":  { opacity: "1" },
          "85%":  { opacity: "0.9" },
          "100%": { transform: "translateY(-12px) translateX(4px)", opacity: "0" },
        },
        // Ink glow pulse on hover
        inkPulse: {
          "0%, 100%": { boxShadow: "0 0 0px currentColor" },
          "50%":       { boxShadow: "0 0 8px currentColor" },
        },
        // Slow brass border shimmer
        brassShimmer: {
          "0%":   { borderColor: "#C9A84C" },
          "50%":  { borderColor: "#E8C97A" },
          "100%": { borderColor: "#C9A84C" },
        },
        // Author materialization
        materialize: {
          "0%":   { opacity: "0", filter: "blur(8px) brightness(2)" },
          "40%":  { opacity: "0.6", filter: "blur(2px) brightness(1.4)" },
          "100%": { opacity: "1", filter: "blur(0px) brightness(1)" },
        },
        // Iris wipe (chapter transition)
        irisOpen: {
          "0%":   { clipPath: "circle(0% at 50% 50%)" },
          "100%": { clipPath: "circle(150% at 50% 50%)" },
        },
        // Entry flicker
        flicker: {
          "0%, 100%": { opacity: "1" },
          "8%":       { opacity: "0.9" },
          "15%":      { opacity: "1" },
          "42%":      { opacity: "0.95" },
          "60%":      { opacity: "1" },
          "75%":      { opacity: "0.97" },
        },
      },
      animation: {
        "vapor-drift":  "vaporDrift 3s ease-in-out forwards",
        "ink-pulse":    "inkPulse 2s ease-in-out infinite",
        "brass-shimmer":"brassShimmer 4s ease-in-out infinite",
        "materialize":  "materialize 1.2s ease-out forwards",
        "iris-open":    "irisOpen 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "flicker":      "flicker 6s ease-in-out infinite",
      },

      // ─── SPACING & LAYOUT ────────────────────────────────────────
      maxWidth: {
        "reading": "68ch",  // optimal reading line length
        "reading-wide": "80ch",
      },
      spacing: {
        "margin-col": "280px",  // sidebar width for margin world
        "ink-bar": "52px",       // ink toolbar width
      },

      // ─── EFFECTS ────────────────────────────────────────────────
      backgroundImage: {
        "parchment-texture": "url('/textures/parchment.png')",
        "vault-gradient": "radial-gradient(ellipse at top, #1A1208 0%, #0D0B08 60%)",
        "brass-line": "linear-gradient(90deg, transparent 0%, #C9A84C 50%, transparent 100%)",
      },

      boxShadow: {
        "ink-ember":   "0 0 12px rgba(192, 57, 43, 0.6)",
        "ink-copper":  "0 0 12px rgba(184, 115, 51, 0.6)",
        "ink-ghost":   "0 0 8px rgba(160, 168, 168, 0.4)",
        "ink-archive": "0 0 12px rgba(201, 168, 76, 0.6)",
        "ink-signal":  "0 0 16px rgba(0, 229, 204, 0.7)",
        "ink-memory":  "0 0 12px rgba(107, 63, 160, 0.6)",
        "panel":       "inset 0 1px 0 rgba(201,168,76,0.15), 0 4px 24px rgba(0,0,0,0.6)",
        "chapter":     "0 0 60px rgba(44, 26, 0, 0.8)",
      },
    },
  },
  plugins: [],
};

export default config;
