"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import type { FeaturedWriter, FeaturedWork } from "@/lib/featured-writers";
import TintaxisLogo from "@/components/ui/TintaxisLogo";
import SubscriptionModal from "@/components/ui/SubscriptionModal";
import type { SubscriptionTierName } from "@/components/ui/SubscriptionModal";

// ─── WRITER PROFILE CLIENT ────────────────────────────────────────────────────

export default function WriterProfileClient({ writer }: { writer: FeaturedWriter }) {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", backgroundColor: "#0D0B08" }} />}>
      <WriterProfileInner writer={writer} />
    </Suspense>
  );
}

function WriterProfileInner({ writer }: { writer: FeaturedWriter }) {
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [gateTier] = useState<SubscriptionTierName>("codex");
  const displayName = writer.artistName ?? writer.name;

  // ── Stripe Connect callback banner ────────────────────────────────────────
  const searchParams = useSearchParams();
  const connectStatus = searchParams.get("connect"); // "connected" | "incomplete" | "error"
  const [connectBanner, setConnectBanner] = useState<string | null>(null);

  useEffect(() => {
    if (connectStatus === "connected") setConnectBanner("✓ Stripe account connected. Add the env var to Vercel to activate payouts.");
    else if (connectStatus === "incomplete") setConnectBanner("⚠ Stripe onboarding incomplete. Please finish the form.");
    else if (connectStatus === "error") setConnectBanner("✕ Something went wrong with Stripe Connect. Try generating a new link.");
  }, [connectStatus]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D0B08" }}>

      {/* ── Connect status banner (admin-only, post-onboarding) ── */}
      {connectBanner && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: connectStatus === "connected" ? "rgba(0,180,100,0.85)" : "rgba(200,80,40,0.85)",
          padding: "0.6rem 1.5rem",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          backdropFilter: "blur(4px)",
        }}>
          <span style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.5rem",
            letterSpacing: "0.12em",
            color: "#fff",
          }}>
            {connectBanner}
          </span>
          <button
            onClick={() => setConnectBanner(null)}
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "0.75rem" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Top Nav ───────────────────────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.85rem clamp(1rem, 4vw, 2rem)",
          borderBottom: "1px solid rgba(201,168,76,0.07)",
          background: "rgba(13,11,8,0.9)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <TintaxisLogo size={20} />
          <span style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.5rem",
            letterSpacing: "0.25em",
            color: "rgba(201,168,76,0.55)",
            textTransform: "uppercase",
          }}>
            Tintaxis
          </span>
        </Link>
        <div style={{ display: "flex", gap: "1.75rem", alignItems: "center" }}>
          <Link href="/writers" style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.5rem",
            letterSpacing: "0.25em",
            color: "rgba(201,168,76,0.55)",
            textDecoration: "none",
            textTransform: "uppercase",
          }}>
            ← Featured Artists
          </Link>
          <Link href="/author/login" style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.5rem",
            letterSpacing: "0.25em",
            color: "rgba(245,230,200,0.2)",
            textDecoration: "none",
            textTransform: "uppercase",
          }}>
            Author Login →
          </Link>
        </div>
      </nav>

      <div style={{
        maxWidth: "860px",
        margin: "0 auto",
        padding: "clamp(6rem, 12vw, 8rem) clamp(1rem, 4vw, 2rem) 6rem",
      }}>

        {/* ── Profile Header ────────────────────────────────────── */}
        <motion.div
          style={{
            display: "flex",
            gap: "2rem",
            alignItems: "flex-start",
            flexWrap: "wrap",
            marginBottom: "3rem",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.2, 0, 0.1, 1] }}
        >
          {/* Photo */}
          <div style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            border: "1px solid rgba(201,168,76,0.25)",
            overflow: "hidden",
            flexShrink: 0,
            background: "rgba(201,168,76,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {writer.photo ? (
              <Image
                src={writer.photo}
                alt={displayName}
                width={120}
                height={120}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            ) : (
              <span style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "2.5rem",
                color: "rgba(201,168,76,0.35)",
                fontStyle: "italic",
              }}>
                {displayName[0]}
              </span>
            )}
          </div>

          {/* Identity */}
          <div style={{ flex: 1, minWidth: "240px" }}>
            <p style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.5rem",
              letterSpacing: "0.3em",
              color: "rgba(201,168,76,0.4)",
              textTransform: "uppercase",
              marginBottom: "0.6rem",
            }}>
              {writer.genre}
            </p>

            <h1 style={{
              fontFamily: '"EB Garamond", Garamond, Georgia, serif',
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 400,
              color: "#F5E6C8",
              lineHeight: 1.15,
              marginBottom: writer.artistName ? "0.25rem" : "0.5rem",
            }}>
              {displayName}
            </h1>

            {writer.artistName && (
              <p style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "0.9rem",
                fontStyle: "italic",
                color: "rgba(245,230,200,0.35)",
                marginBottom: "0.5rem",
              }}>
                {writer.name}
              </p>
            )}

            <p style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.5rem",
              letterSpacing: "0.1em",
              color: "rgba(201,168,76,0.3)",
              textTransform: "uppercase",
              marginBottom: "1.25rem",
            }}>
              {writer.origin}
            </p>

            {/* Social links */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {writer.instagram && (
                <a
                  href={`https://instagram.com/${writer.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.5rem",
                    letterSpacing: "0.15em",
                    color: "rgba(201,168,76,0.45)",
                    textDecoration: "none",
                    textTransform: "uppercase",
                    border: "1px solid rgba(201,168,76,0.15)",
                    padding: "0.35rem 0.75rem",
                  }}
                >
                  @{writer.instagram}
                </a>
              )}
              {writer.website && (
                <a
                  href={`https://${writer.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.5rem",
                    letterSpacing: "0.15em",
                    color: "rgba(201,168,76,0.45)",
                    textDecoration: "none",
                    textTransform: "uppercase",
                    border: "1px solid rgba(201,168,76,0.15)",
                    padding: "0.35rem 0.75rem",
                  }}
                >
                  {writer.website}
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Brass rule ──────────────────────────────────────── */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{ marginBottom: "2.5rem" }}
        >
          <div className="brass-line" />
        </motion.div>

        {/* ── Full Bio ─────────────────────────────────────────── */}
        <motion.div
          style={{ marginBottom: "3.5rem" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          <p style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.5rem",
            letterSpacing: "0.3em",
            color: "rgba(201,168,76,0.35)",
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}>
            About
          </p>
          <p style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "clamp(1rem, 2vw, 1.125rem)",
            lineHeight: 1.85,
            color: "rgba(245,230,200,0.75)",
            maxWidth: "68ch",
          }}>
            {writer.fullBio}
          </p>
        </motion.div>

        {/* ── Subscribe CTA ────────────────────────────────────── */}
        <motion.div
          style={{
            padding: "1.5rem",
            border: "1px solid rgba(201,168,76,0.2)",
            background: "rgba(201,168,76,0.03)",
            marginBottom: "3.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.5rem",
            flexWrap: "wrap",
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div>
            <p style={{
              fontFamily: '"EB Garamond", Garamond, Georgia, serif',
              fontSize: "1.1rem",
              fontStyle: "italic",
              color: "rgba(245,230,200,0.75)",
              marginBottom: "0.25rem",
            }}>
              Read {displayName}'s work on Tintaxis
            </p>
            <p style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.5rem",
              letterSpacing: "0.15em",
              color: "rgba(201,168,76,0.35)",
              textTransform: "uppercase",
            }}>
              Full access from $3 / month · Cancel anytime
            </p>
          </div>
          <motion.button
            onClick={() => setSubModalOpen(true)}
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#0D0B08",
              background: "#C9A84C",
              border: "none",
              padding: "0.75rem 2rem",
              cursor: "pointer",
              flexShrink: 0,
            }}
            whileHover={{ background: "#E8C97A" }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            Subscribe to Read
          </motion.button>
        </motion.div>

        {/* ── Works ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.7 }}
        >
          <p style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.5rem",
            letterSpacing: "0.3em",
            color: "rgba(201,168,76,0.35)",
            textTransform: "uppercase",
            marginBottom: "1.5rem",
          }}>
            Works
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {writer.works.map((work, i) => (
              <WorkCard key={i} work={work} index={i} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Subscription Modal ──────────────────────────────────── */}
      <SubscriptionModal
        isOpen={subModalOpen}
        triggeredBy={gateTier}
        featureName={`${displayName}'s work`}
        onClose={() => setSubModalOpen(false)}
        returnUrl={`/writers/${writer.slug}`}
        writerSlug={writer.slug}
      />
    </div>
  );
}

// ─── WORK CARD ────────────────────────────────────────────────────────────────

function WorkCard({ work, index }: { work: FeaturedWork; index: number }) {
  const isLive = !!work.href && !work.comingSoon;

  const content = (
    <motion.div
      style={{
        padding: "1.25rem 1.5rem",
        border: isLive
          ? "1px solid rgba(201,168,76,0.22)"
          : "1px solid rgba(201,168,76,0.1)",
        background: isLive ? "rgba(201,168,76,0.03)" : "rgba(13,11,8,0.5)",
        display: "flex",
        gap: "1.25rem",
        alignItems: "flex-start",
        cursor: isLive ? "pointer" : "default",
        position: "relative",
      }}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.65 + index * 0.08, duration: 0.5 }}
      whileHover={isLive ? { borderColor: "rgba(201,168,76,0.4)", background: "rgba(201,168,76,0.06)" } : {}}
    >
      {/* Language badge */}
      {work.language && (
        <div style={{
          flexShrink: 0,
          width: "32px",
          height: "32px",
          border: "1px solid rgba(201,168,76,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "2px",
        }}>
          <span style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.45rem",
            letterSpacing: "0.05em",
            color: "rgba(201,168,76,0.4)",
          }}>
            {work.language}
          </span>
        </div>
      )}

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
          <p style={{
            fontFamily: '"EB Garamond", Garamond, Georgia, serif',
            fontSize: "1.1rem",
            fontStyle: "italic",
            color: isLive ? "rgba(245,230,200,0.85)" : "rgba(245,230,200,0.4)",
            lineHeight: 1.2,
          }}>
            {work.title}
          </p>
          {work.subtitle && (
            <p style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.45rem",
              letterSpacing: "0.1em",
              color: isLive ? "rgba(201,168,76,0.4)" : "rgba(201,168,76,0.2)",
              textTransform: "uppercase",
            }}>
              {work.subtitle}
            </p>
          )}
        </div>

        {work.wordCount && (
          <p style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.45rem",
            letterSpacing: "0.08em",
            color: "rgba(201,168,76,0.25)",
            marginBottom: "0.5rem",
          }}>
            {work.wordCount}
          </p>
        )}

        <p style={{
          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
          fontSize: "0.9rem",
          fontStyle: "italic",
          color: isLive ? "rgba(245,230,200,0.55)" : "rgba(245,230,200,0.25)",
          lineHeight: 1.6,
        }}>
          {work.description}
        </p>
      </div>

      {/* Status badge */}
      <div style={{ flexShrink: 0, alignSelf: "center" }}>
        {isLive ? (
          <span style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.45rem",
            letterSpacing: "0.15em",
            color: "#C9A84C",
            textTransform: "uppercase",
          }}>
            Read →
          </span>
        ) : (
          <span style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.45rem",
            letterSpacing: "0.15em",
            color: "rgba(201,168,76,0.2)",
            textTransform: "uppercase",
          }}>
            ⚿ Soon
          </span>
        )}
      </div>
    </motion.div>
  );

  if (isLive && work.href) {
    return <Link href={work.href} style={{ textDecoration: "none" }}>{content}</Link>;
  }
  return content;
}
