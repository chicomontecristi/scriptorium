// ─── PER-CHAPTER OG IMAGE ─────────────────────────────────────────────────────
// Each chapter gets its own OG image showing chapter number + title.
// Shown when a chapter URL is shared on social media.

import { ImageResponse } from "next/og";
import { getChapter } from "@/lib/content/chapters";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return [{ slug: "one" }, { slug: "two" }];
}

export default function Image({ params }: Props) {
  const chapter = getChapter(params.slug);

  const title = chapter?.title ?? "Tintaxis";
  const roman = chapter?.romanNumeral ?? "";
  const subtitle = chapter?.subtitle ?? "";
  const isLocked = chapter?.isLocked ?? false;

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
        {/* ── Borders ── */}
        <div style={{ position: "absolute", inset: "32px", border: "1px solid rgba(201,168,76,0.3)", display: "flex" }} />
        <div style={{ position: "absolute", inset: "42px", border: "1px solid rgba(201,168,76,0.1)", display: "flex" }} />

        {/* ── Corners ── */}
        <div style={{ position: "absolute", top: "50px", left: "50px", width: "20px", height: "20px", borderTop: "2px solid rgba(201,168,76,0.55)", borderLeft: "2px solid rgba(201,168,76,0.55)", display: "flex" }} />
        <div style={{ position: "absolute", top: "50px", right: "50px", width: "20px", height: "20px", borderTop: "2px solid rgba(201,168,76,0.55)", borderRight: "2px solid rgba(201,168,76,0.55)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: "50px", left: "50px", width: "20px", height: "20px", borderBottom: "2px solid rgba(201,168,76,0.55)", borderLeft: "2px solid rgba(201,168,76,0.55)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: "50px", right: "50px", width: "20px", height: "20px", borderBottom: "2px solid rgba(201,168,76,0.55)", borderRight: "2px solid rgba(201,168,76,0.55)", display: "flex" }} />

        {/* ── Glow ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 50% 40%, rgba(44,26,0,0.65) 0%, transparent 65%)",
            display: "flex",
          }}
        />

        {/* ── Content ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
            padding: "0 100px",
          }}
        >
          {/* Wordmark */}
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "12px",
              letterSpacing: "0.3em",
              color: "rgba(201,168,76,0.4)",
              textTransform: "uppercase",
              marginBottom: "40px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span>TINTAXIS</span>
            <span style={{ color: "rgba(201,168,76,0.2)" }}>·</span>
            <span>THE LIFE OF ROBI DRACO ROSA</span>
          </div>

          {/* Chapter label */}
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "13px",
              letterSpacing: "0.3em",
              color: "rgba(201,168,76,0.55)",
              textTransform: "uppercase",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            CHAPTER {roman}
            {isLocked && (
              <span style={{ fontSize: "14px", display: "flex" }}>⚿</span>
            )}
          </div>

          {/* Chapter title */}
          <div
            style={{
              fontSize: "58px",
              fontWeight: 400,
              letterSpacing: "0.04em",
              color: isLocked ? "rgba(245,230,200,0.5)" : "#F5E6C8",
              lineHeight: 1.15,
              marginBottom: "20px",
              display: "flex",
              maxWidth: "800px",
              textAlign: "center",
            }}
          >
            {title}
          </div>

          {/* Brass rule */}
          <div
            style={{
              width: "200px",
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.7) 50%, transparent)",
              marginBottom: "20px",
              display: "flex",
            }}
          />

          {/* Subtitle */}
          {subtitle && (
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "14px",
                letterSpacing: "0.18em",
                color: "rgba(201,168,76,0.45)",
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              {subtitle}
            </div>
          )}

          {/* Sealed note */}
          {isLocked && (
            <div
              style={{
                marginTop: "20px",
                fontFamily: "monospace",
                fontSize: "12px",
                letterSpacing: "0.2em",
                color: "rgba(201,168,76,0.3)",
                textTransform: "uppercase",
                border: "1px solid rgba(201,168,76,0.15)",
                padding: "6px 16px",
                display: "flex",
              }}
            >
              SEALED · COMING SOON
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
