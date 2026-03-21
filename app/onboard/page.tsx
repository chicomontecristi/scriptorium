"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import TintaxisLogo from "@/components/ui/TintaxisLogo";

// ─── WRITER ONBOARDING PAGE ───────────────────────────────────────────────────
// Reached via /onboard?token=...
// Validates the invitation token, collects the writer's profile, and
// emails José for manual activation.

type TokenState = "checking" | "valid" | "invalid" | "expired";
type FormState = "idle" | "submitting" | "success" | "error";

interface Work {
  id: string;
  title: string;
  description: string;
  language: string;
}

export default function OnboardPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", backgroundColor: "#0D0B08", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: "0.5rem", letterSpacing: "0.25em", color: "rgba(201,168,76,0.4)", textTransform: "uppercase" }}>
          Loading…
        </p>
      </div>
    }>
      <OnboardInner />
    </Suspense>
  );
}

function OnboardInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  // ── Token validation ──────────────────────────────────────────────────────
  const [tokenState, setTokenState] = useState<TokenState>("checking");
  const [writerSlug, setWriterSlug] = useState<string>("");

  useEffect(() => {
    if (!token) { setTokenState("invalid"); return; }
    fetch(`/api/writer/onboard?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setTokenState("valid");
          setWriterSlug(data.writerSlug ?? "");
        } else if (data.reason === "expired") {
          setTokenState("expired");
        } else {
          setTokenState("invalid");
        }
      })
      .catch(() => setTokenState("invalid"));
  }, [token]);

  // ── Form fields ───────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [origin, setOrigin] = useState("");
  const [genre, setGenre] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const [works, setWorks] = useState<Work[]>([
    { id: crypto.randomUUID(), title: "", description: "", language: "" },
  ]);

  // ── Works helpers ─────────────────────────────────────────────────────────
  function addWork() {
    setWorks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: "", description: "", language: "" },
    ]);
  }
  function removeWork(id: string) {
    setWorks((prev) => prev.filter((w) => w.id !== id));
  }
  function updateWork(id: string, field: keyof Omit<Work, "id">, value: string) {
    setWorks((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    );
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState("submitting");
    setErrorMsg("");

    const payload = {
      token,
      name: name.trim(),
      artistName: artistName.trim() || null,
      origin: origin.trim(),
      genre: genre.trim(),
      bio: bio.trim(),
      instagram: instagram.replace(/^@/, "").trim() || null,
      website: website.trim() || null,
      works: works
        .filter((w) => w.title.trim())
        .map(({ title, description, language }) => ({
          title: title.trim(),
          description: description.trim(),
          language: language.trim() || "EN",
        })),
    };

    try {
      const res = await fetch("/api/writer/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFormState("success");
      } else {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        setFormState("error");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setFormState("error");
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D0B08" }}>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0.85rem clamp(1rem, 4vw, 2rem)",
        borderBottom: "1px solid rgba(201,168,76,0.07)",
        background: "rgba(13,11,8,0.9)",
        backdropFilter: "blur(8px)",
      }}>
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
        <span style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.5rem",
          letterSpacing: "0.2em",
          color: "rgba(201,168,76,0.3)",
          textTransform: "uppercase",
        }}>
          Writer Onboarding
        </span>
      </nav>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div style={{
        maxWidth: "680px",
        margin: "0 auto",
        padding: "clamp(6rem, 12vw, 8rem) clamp(1rem, 4vw, 2rem) 6rem",
      }}>

        {/* ── Checking token ─────────────────────────────────────────── */}
        {tokenState === "checking" && (
          <motion.div
            style={{ textAlign: "center", paddingTop: "4rem" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.55rem",
              letterSpacing: "0.25em",
              color: "rgba(201,168,76,0.4)",
              textTransform: "uppercase",
            }}>
              Verifying invitation…
            </p>
          </motion.div>
        )}

        {/* ── Invalid token ──────────────────────────────────────────── */}
        {(tokenState === "invalid" || tokenState === "expired") && (
          <motion.div
            style={{ textAlign: "center", paddingTop: "4rem" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.5rem",
              letterSpacing: "0.3em",
              color: "rgba(201,168,76,0.35)",
              textTransform: "uppercase",
              marginBottom: "1.5rem",
            }}>
              {tokenState === "expired" ? "Invitation Expired" : "Invalid Invitation"}
            </p>
            <h1 style={{
              fontFamily: '"EB Garamond", Garamond, Georgia, serif',
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              fontWeight: 400,
              color: "#F5E6C8",
              marginBottom: "1rem",
            }}>
              {tokenState === "expired"
                ? "This invitation link has expired."
                : "This invitation link is not valid."}
            </h1>
            <p style={{
              fontFamily: '"EB Garamond", Garamond, Georgia, serif',
              fontSize: "1rem",
              fontStyle: "italic",
              color: "rgba(245,230,200,0.45)",
              lineHeight: 1.7,
              marginBottom: "2rem",
            }}>
              {tokenState === "expired"
                ? "Invitation links are valid for 30 days. Please contact José to request a new one."
                : "Please check the link you received, or contact José if you believe this is an error."}
            </p>
            <Link href="/" style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.5rem",
              letterSpacing: "0.2em",
              color: "rgba(201,168,76,0.5)",
              textDecoration: "none",
              textTransform: "uppercase",
              border: "1px solid rgba(201,168,76,0.2)",
              padding: "0.6rem 1.5rem",
            }}>
              Return to Tintaxis
            </Link>
          </motion.div>
        )}

        {/* ── Success state ──────────────────────────────────────────── */}
        {formState === "success" && (
          <motion.div
            style={{ textAlign: "center", paddingTop: "4rem" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.5rem",
              letterSpacing: "0.3em",
              color: "rgba(201,168,76,0.45)",
              textTransform: "uppercase",
              marginBottom: "1.5rem",
            }}>
              Profile Submitted
            </p>
            <h1 style={{
              fontFamily: '"EB Garamond", Garamond, Georgia, serif',
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 400,
              color: "#F5E6C8",
              marginBottom: "1.25rem",
            }}>
              Welcome to Tintaxis.
            </h1>
            <div style={{ height: "1px", background: "rgba(201,168,76,0.15)", marginBottom: "1.25rem", maxWidth: "240px", margin: "0 auto 1.5rem" }} />
            <p style={{
              fontFamily: '"EB Garamond", Garamond, Georgia, serif',
              fontSize: "1.05rem",
              fontStyle: "italic",
              color: "rgba(245,230,200,0.6)",
              lineHeight: 1.8,
              maxWidth: "52ch",
              margin: "0 auto 2rem",
            }}>
              Your profile has been submitted. José will review your submission
              and activate your page within 48 hours. You'll receive a
              confirmation once you're live.
            </p>
            <Link href="/writers" style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.5rem",
              letterSpacing: "0.2em",
              color: "rgba(201,168,76,0.5)",
              textDecoration: "none",
              textTransform: "uppercase",
              border: "1px solid rgba(201,168,76,0.2)",
              padding: "0.6rem 1.5rem",
            }}>
              View Featured Artists →
            </Link>
          </motion.div>
        )}

        {/* ── Form ───────────────────────────────────────────────────── */}
        {tokenState === "valid" && formState !== "success" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.2, 0, 0.1, 1] }}
          >
            {/* Header */}
            <div style={{ marginBottom: "3rem" }}>
              <p style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.5rem",
                letterSpacing: "0.3em",
                color: "rgba(201,168,76,0.4)",
                textTransform: "uppercase",
                marginBottom: "1rem",
              }}>
                You've been invited
              </p>
              <h1 style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: 400,
                color: "#F5E6C8",
                lineHeight: 1.15,
                marginBottom: "1rem",
              }}>
                Join Tintaxis as a Featured Writer
              </h1>
              <p style={{
                fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                fontSize: "1rem",
                fontStyle: "italic",
                color: "rgba(245,230,200,0.45)",
                lineHeight: 1.7,
                maxWidth: "56ch",
              }}>
                Fill out your profile below. Once submitted, José will review
                your submission and activate your page. No application process —
                you've already been selected.
              </p>
              {writerSlug && (
                <p style={{
                  marginTop: "0.75rem",
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.45rem",
                  letterSpacing: "0.15em",
                  color: "rgba(201,168,76,0.3)",
                  textTransform: "uppercase",
                }}>
                  Your page will live at /writers/{writerSlug}
                </p>
              )}
            </div>

            <div style={{ height: "1px", background: "rgba(201,168,76,0.1)", marginBottom: "2.5rem" }} />

            {/* Form */}
            <form onSubmit={handleSubmit}>

              {/* ── Identity ────────────────────────────────────────── */}
              <SectionLabel>Identity</SectionLabel>

              <FieldGroup>
                <Field label="Full Legal Name" required>
                  <TextInput
                    value={name}
                    onChange={setName}
                    placeholder="e.g. José Martínez"
                    required
                  />
                </Field>
                <Field label="Artist Name" hint="Leave blank if same as legal name">
                  <TextInput
                    value={artistName}
                    onChange={setArtistName}
                    placeholder="e.g. Chico Montecristi"
                  />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field label="Origin" required hint="City/country of origin or where you write from">
                  <TextInput
                    value={origin}
                    onChange={setOrigin}
                    placeholder="e.g. Santo Domingo, Dominican Republic · New York, NY"
                    required
                  />
                </Field>
                <Field label="Genre / Descriptor" required hint="Short phrase describing your work">
                  <TextInput
                    value={genre}
                    onChange={setGenre}
                    placeholder="e.g. Dark Fiction · Oil Painter"
                    required
                  />
                </Field>
              </FieldGroup>

              {/* ── Bio ─────────────────────────────────────────────── */}
              <div style={{ marginBottom: "2rem" }}>
                <SectionLabel>Biography</SectionLabel>
                <Field label="Full Bio" required hint="2–4 paragraphs. Write in third person.">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    required
                    rows={7}
                    placeholder="Your full biography. This will appear on your profile page."
                    style={textareaStyle}
                  />
                </Field>
              </div>

              {/* ── Works ───────────────────────────────────────────── */}
              <div style={{ marginBottom: "2rem" }}>
                <SectionLabel>Works</SectionLabel>
                <p style={{
                  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
                  fontSize: "0.875rem",
                  fontStyle: "italic",
                  color: "rgba(245,230,200,0.35)",
                  marginBottom: "1.25rem",
                  lineHeight: 1.6,
                }}>
                  Add the works you want featured on your profile. At least one is required.
                </p>

                <AnimatePresence>
                  {works.map((work, i) => (
                    <motion.div
                      key={work.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                      transition={{ duration: 0.3 }}
                      style={{
                        border: "1px solid rgba(201,168,76,0.12)",
                        padding: "1.25rem",
                        marginBottom: "1rem",
                        position: "relative",
                      }}
                    >
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                      }}>
                        <span style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: "0.45rem",
                          letterSpacing: "0.2em",
                          color: "rgba(201,168,76,0.35)",
                          textTransform: "uppercase",
                        }}>
                          Work {i + 1}
                        </span>
                        {works.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeWork(work.id)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: "0.45rem",
                              letterSpacing: "0.15em",
                              color: "rgba(201,168,76,0.25)",
                              textTransform: "uppercase",
                              padding: "0.2rem 0.5rem",
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <FieldGroup>
                        <Field label="Title" required={i === 0}>
                          <TextInput
                            value={work.title}
                            onChange={(v) => updateWork(work.id, "title", v)}
                            placeholder="e.g. The Hunt"
                            required={i === 0}
                          />
                        </Field>
                        <Field label="Language" hint="EN · ES · FR · etc.">
                          <TextInput
                            value={work.language}
                            onChange={(v) => updateWork(work.id, "language", v)}
                            placeholder="EN"
                          />
                        </Field>
                      </FieldGroup>

                      <Field label="Description">
                        <textarea
                          value={work.description}
                          onChange={(e) => updateWork(work.id, "description", e.target.value)}
                          rows={2}
                          placeholder="One or two sentences describing this work."
                          style={{ ...textareaStyle, minHeight: "unset" }}
                        />
                      </Field>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={addWork}
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.5rem",
                    letterSpacing: "0.2em",
                    color: "rgba(201,168,76,0.45)",
                    background: "none",
                    border: "1px solid rgba(201,168,76,0.15)",
                    padding: "0.5rem 1.25rem",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    marginTop: "0.25rem",
                  }}
                >
                  + Add Another Work
                </button>
              </div>

              {/* ── Links ───────────────────────────────────────────── */}
              <SectionLabel>Links</SectionLabel>
              <FieldGroup>
                <Field label="Instagram Handle" hint="Without the @">
                  <TextInput
                    value={instagram}
                    onChange={setInstagram}
                    placeholder="yourhandle"
                  />
                </Field>
                <Field label="Website">
                  <TextInput
                    value={website}
                    onChange={setWebsite}
                    placeholder="yoursite.com"
                  />
                </Field>
              </FieldGroup>

              {/* ── Error ───────────────────────────────────────────── */}
              <AnimatePresence>
                {formState === "error" && errorMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.5rem",
                      letterSpacing: "0.1em",
                      color: "rgba(220,60,60,0.7)",
                      marginBottom: "1.5rem",
                    }}
                  >
                    {errorMsg}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* ── Submit ──────────────────────────────────────────── */}
              <div style={{ paddingTop: "0.5rem" }}>
                <motion.button
                  type="submit"
                  disabled={formState === "submitting"}
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.6rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: formState === "submitting" ? "rgba(13,11,8,0.5)" : "#0D0B08",
                    background: formState === "submitting" ? "rgba(201,168,76,0.5)" : "#C9A84C",
                    border: "none",
                    padding: "0.85rem 2.5rem",
                    cursor: formState === "submitting" ? "default" : "pointer",
                    width: "100%",
                  }}
                  whileHover={formState !== "submitting" ? { background: "#E8C97A" } : {}}
                  whileTap={formState !== "submitting" ? { scale: 0.99 } : {}}
                  transition={{ duration: 0.15 }}
                >
                  {formState === "submitting" ? "Submitting…" : "Submit Profile"}
                </motion.button>
                <p style={{
                  marginTop: "1rem",
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.45rem",
                  letterSpacing: "0.12em",
                  color: "rgba(201,168,76,0.2)",
                  textTransform: "uppercase",
                  textAlign: "center",
                }}>
                  Your submission will be emailed to José for review
                </p>
              </div>

            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: "0.5rem",
      letterSpacing: "0.3em",
      color: "rgba(201,168,76,0.35)",
      textTransform: "uppercase",
      marginBottom: "1.25rem",
    }}>
      {children}
    </p>
  );
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
      gap: "1rem",
      marginBottom: "1rem",
    }}>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={{
        display: "block",
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "0.45rem",
        letterSpacing: "0.15em",
        color: "rgba(201,168,76,0.45)",
        textTransform: "uppercase",
        marginBottom: "0.4rem",
      }}>
        {label}{required && <span style={{ color: "rgba(201,168,76,0.6)", marginLeft: "0.3em" }}>*</span>}
        {hint && (
          <span style={{
            display: "block",
            fontSize: "0.4rem",
            letterSpacing: "0.08em",
            color: "rgba(201,168,76,0.25)",
            marginTop: "0.15rem",
            fontWeight: 400,
          }}>
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      style={inputStyle}
    />
  );
}

// ─── SHARED STYLES ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  background: "rgba(201,168,76,0.03)",
  border: "1px solid rgba(201,168,76,0.15)",
  color: "rgba(245,230,200,0.75)",
  fontFamily: '"EB Garamond", Garamond, Georgia, serif',
  fontSize: "0.95rem",
  padding: "0.6rem 0.8rem",
  outline: "none",
  boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical" as const,
  minHeight: "120px",
  lineHeight: 1.7,
};
