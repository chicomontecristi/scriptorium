// ─── THE SCRIPTORIUM — TYPE SYSTEM ───────────────────────────────────────────
// Every annotation, every interaction, every state is typed here.
// This is the vocabulary of the platform.

// ─── INK TYPES ──────────────────────────────────────────────────────────────

export type InkType =
  | "ember"    // Emotional responses — crimson
  | "copper"   // Intellectual observations — bronze
  | "ghost"    // Private notes — silver, invisible to others
  | "archive"  // Factual references — black-gold
  | "signal"   // Questions to author — bioluminescent cyan
  | "memory";  // Personal memories triggered by text — deep violet

export interface InkConfig {
  id: InkType;
  label: string;
  description: string;
  color: string;         // CSS color
  glowColor: string;     // CSS glow color
  highlightClass: string; // Tailwind/CSS class for highlight
  isPrivate: boolean;    // Ghost ink only
  canQueryAuthor: boolean; // Signal ink only
}

export const INK_CONFIGS: Record<InkType, InkConfig> = {
  ember: {
    id: "ember",
    label: "Ember Ink",
    description: "Mark what moves you",
    color: "#C0392B",
    glowColor: "rgba(192, 57, 43, 0.6)",
    highlightClass: "ink-ember-highlight",
    isPrivate: false,
    canQueryAuthor: false,
  },
  copper: {
    id: "copper",
    label: "Copper Ink",
    description: "Mark what strikes your mind",
    color: "#B87333",
    glowColor: "rgba(184, 115, 51, 0.6)",
    highlightClass: "ink-copper-highlight",
    isPrivate: false,
    canQueryAuthor: false,
  },
  ghost: {
    id: "ghost",
    label: "Ghost Ink",
    description: "Private — yours alone",
    color: "#A0A8A8",
    glowColor: "rgba(160, 168, 168, 0.3)",
    highlightClass: "ink-ghost-highlight",
    isPrivate: true,
    canQueryAuthor: false,
  },
  archive: {
    id: "archive",
    label: "Archive Ink",
    description: "Record what is true",
    color: "#C9A84C",
    glowColor: "rgba(201, 168, 76, 0.6)",
    highlightClass: "ink-archive-highlight",
    isPrivate: false,
    canQueryAuthor: false,
  },
  signal: {
    id: "signal",
    label: "Signal Ink",
    description: "Send a question into the archive",
    color: "#00E5CC",
    glowColor: "rgba(0, 229, 204, 0.7)",
    highlightClass: "ink-signal-highlight",
    isPrivate: false,
    canQueryAuthor: true,
  },
  memory: {
    id: "memory",
    label: "Memory Ink",
    description: "Anchor your own story here",
    color: "#6B3FA0",
    glowColor: "rgba(107, 63, 160, 0.6)",
    highlightClass: "ink-memory-highlight",
    isPrivate: false,
    canQueryAuthor: false,
  },
};

// ─── ANNOTATION ─────────────────────────────────────────────────────────────

export interface TextSelection {
  text: string;
  startOffset: number;
  endOffset: number;
  paragraphIndex: number;
}

export interface Annotation {
  id: string;
  inkType: InkType;
  selection: TextSelection;
  note: string;           // The reader's written note (may be empty for pure highlights)
  chapterSlug: string;
  createdAt: string;      // ISO timestamp
  readerId?: string;      // Phase 2: linked to user account
  isPublic: boolean;      // Ghost ink = always false
}

// ─── SIGNAL INK QUESTION ────────────────────────────────────────────────────

export interface SignalQuestion {
  id: string;
  selectedText: string;
  question: string;
  chapterSlug: string;
  readerEmail?: string;
  createdAt: string;
  status: "pending" | "answered" | "archived";
}

// ─── AUTHOR RESPONSE ────────────────────────────────────────────────────────

export type AuthorResponseType =
  | "whisper"       // Short text
  | "transmission"  // Voice recording
  | "reflection"    // Long-form post-chapter
  | "anchor"        // Pin a reader insight permanently
  | "correction";   // Factual overlay on text

export interface AuthorResponse {
  id: string;
  type: AuthorResponseType;
  chapterSlug: string;
  targetAnnotationId?: string; // If responding to a specific annotation
  content: string;             // Text for whisper/reflection/correction
  audioUrl?: string;           // For transmissions
  isAnchored: boolean;
  createdAt: string;
}

// ─── CHAPTER ────────────────────────────────────────────────────────────────

export interface ChapterParagraph {
  index: number;
  text: string;
  isIndented?: boolean;      // First paragraph of section = no indent; subsequent = indent
  isSectionBreak?: boolean;  // Marks a scene / section break (rendered as ornamental divider)
  isEpigraph?: boolean;      // Opening quote / epigraph styling
}

export interface Chapter {
  slug: string;
  number: number;           // Chapter number (1-indexed)
  romanNumeral: string;     // "ONE", "TWO", etc.
  title: string;
  subtitle?: string;
  epigraph?: {
    text: string;
    attribution: string;
  };
  paragraphs: ChapterParagraph[];
  authorNote?: string;       // Optional pre/post chapter note from author
  isLocked: boolean;         // Requires Codex Key to read
  wordCount: number;
}

// ─── READER STATE ────────────────────────────────────────────────────────────

export type ReadPhase =
  | "initiation"  // Before reading begins
  | "first_read"  // Active first read — all Ink tools available
  | "completion"  // Chapter or book just completed — Completion Event pending
  | "archive";    // Archive Mode — locked until unlock conditions met

export interface ReaderState {
  chapterSlug: string;
  phase: ReadPhase;
  hasCompletedFirstRead: boolean;
  completedAt?: string;
  scrollProgress: number; // 0–1
  activeInkType: InkType;
  annotations: Annotation[];
  questionAsked: boolean; // Question Chamber — one per chapter, first read only
}

// ─── MARGIN WORLD ───────────────────────────────────────────────────────────

export type MarginLayer = "mine" | "author" | "community" | "all";

export interface MarginAnnotation extends Annotation {
  isIlluminated?: boolean; // Community-upvoted — permanent brass border
  voteCount?: number;
  authorResponse?: AuthorResponse;
}

// ─── SUBSCRIPTION TIERS ─────────────────────────────────────────────────────

export type SubscriptionTier =
  | "none"              // No purchase
  | "codex_key"         // Tier 1 — base one-time purchase
  | "author_sub"        // Tier 2 — monthly/annual author subscription
  | "subject_archive"   // Tier 3 — subject archive subscription
  | "master_chronicler"; // Tier 4 — annual, limited seats

// ─── UTILITY TYPES ──────────────────────────────────────────────────────────

export type Nullable<T> = T | null;

export type UUID = string;

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}
