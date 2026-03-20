// ─── SITE-LEVEL OG IMAGE ─────────────────────────────────────────────────────
// Rendered by Next.js at build time via ImageResponse.
// Shown when the root URL is shared on social media.
// 1200 × 630px — standard OG dimensions.

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Tintaxis — A Living Reading Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0D0B08",
          position: "relative",
          fontFamily: "serif",
        }}
      >
        {/* ── Outer brass border ── */}
        <div
          style={{
            position: "absolute",
            inset: "32px",
            border: "1px solid rgba(201,168,76,0.35)",
            display: "flex",
          }}
        />

        {/* ── Inner brass border ── */}
        <div
          style={{
            position: "absolute",
            inset: "40px",
            border: "1px solid rgba(201,168,76,0.12)",
            display: "flex",
          }}
        />

        {/* ── Corner marks — top left ── */}
        <div style={{ position: "absolute", top: "48px", left: "48px", width: "24px", height: "24px", borderTop: "2px solid rgba(201,168,76,0.6)", borderLeft: "2px solid rgba(201,168,76,0.6)", display: "flex" }} />
        <div style={{ position: "absolute", top: "48px", right: "48px", width: "24px", height: "24px", borderTop: "2px solid rgba(201,168,76,0.6)", borderRight: "2px solid rgba(201,168,76,0.6)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: "48px", left: "48px", width: "24px", height: "24px", borderBottom: "2px solid rgba(201,168,76,0.6)", borderLeft: "2px solid rgba(201,168,76,0.6)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: "48px", right: "48px", width: "24px", height: "24px", borderBottom: "2px solid rgba(201,168,76,0.6)", borderRight: "2px solid rgba(201,168,76,0.6)", display: "flex" }} />

        {/* ── Radial glow ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 50% 45%, rgba(44,26,0,0.7) 0%, transparent 65%)",
            display: "flex",
          }}
        />

        {/* ── Main content ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
            padding: "0 80px",
          }}
        >
          {/* Edition tag */}
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "13px",
              letterSpacing: "0.28em",
              color: "rgba(201,168,76,0.55)",
              textTransform: "uppercase",
              marginBottom: "28px",
              display: "flex",
            }}
          >
            INAUGURAL EDITION
          </div>

          {/* Sigil — simplified SVG inline */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            width={80}
            height={80}
            style={{ marginBottom: "24px" }}
          >
            {/* Gear teeth */}
            {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg) => (
              <rect
                key={deg}
                x={48} y={2}
                width={4} height={7}
                fill="#C9A84C"
                transform={`rotate(${deg} 50 50)`}
              />
            ))}
            <circle cx="50" cy="50" r="41" stroke="#C9A84C" strokeWidth="1.2" fill="none"/>
            <path d="M 18 50 Q 50 22 82 50 Q 50 78 18 50 Z" stroke="#C9A84C" strokeWidth="1.4" fill="none"/>
            <circle cx="50" cy="50" r="11" stroke="#C9A84C" strokeWidth="1.4" fill="none"/>
            <circle cx="50" cy="50" r="3.5" fill="#C9A84C"/>
          </svg>

          {/* Title */}
          <div
            style={{
              fontSize: "68px",
              fontWeight: 400,
              letterSpacing: "0.1em",
              color: "#F5E6C8",
              lineHeight: 1,
              marginBottom: "16px",
              display: "flex",
              textShadow: "0 0 60px rgba(201,168,76,0.25)",
            }}
          >
            TINTAXIS
          </div>

          {/* Brass rule */}
          <div
            style={{
              width: "320px",
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.7) 30%, rgba(201,168,76,0.9) 50%, rgba(201,168,76,0.7) 70%, transparent)",
              marginBottom: "20px",
              display: "flex",
            }}
          />

          {/* Subject */}
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "16px",
              letterSpacing: "0.22em",
              color: "rgba(201,168,76,0.75)",
              textTransform: "uppercase",
              marginBottom: "16px",
              display: "flex",
            }}
          >
            THE LIFE OF ROBI DRACO ROSA
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "22px",
              fontStyle: "italic",
              color: "rgba(245,230,200,0.4)",
              letterSpacing: "0.02em",
              display: "flex",
            }}
          >
            A living reading platform · Year 2250
          </div>
        </div>

        {/* ── Bottom system status ── */}
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            display: "flex",
            gap: "32px",
            alignItems: "center",
          }}
        >
          {["ARCHIVE", "INK", "MARGINS", "AUTHOR"].map((label, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: i === 3 ? "#00E5CC" : "rgba(201,168,76,0.6)",
                  display: "flex",
                }}
              />
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "10px",
                  letterSpacing: "0.2em",
                  color: "rgba(201,168,76,0.45)",
                  display: "flex",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
