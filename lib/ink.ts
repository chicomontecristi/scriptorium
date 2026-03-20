// ─── GHOST INK — localStorage persistence layer ──────────────────────────────
// Phase 1: All annotations stored in localStorage.
// Phase 2: Migrate to PostgreSQL with user accounts (Clerk auth).
// The API shape is identical — swap the storage layer, keep the interface.

import type { Annotation, SignalQuestion, ReaderState, InkType, TextSelection } from "./types";

const STORAGE_KEYS = {
  annotations: (chapterSlug: string) => `tintaxis:annotations:${chapterSlug}`,
  readerState: (chapterSlug: string) => `tintaxis:state:${chapterSlug}`,
  questions:   (chapterSlug: string) => `tintaxis:questions:${chapterSlug}`,
  allChapters: "tintaxis:chapters:read",
} as const;

// ─── ID GENERATION ──────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── ANNOTATION STORAGE ─────────────────────────────────────────────────────

export function getAnnotations(chapterSlug: string): Annotation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.annotations(chapterSlug));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAnnotation(
  chapterSlug: string,
  inkType: InkType,
  selection: TextSelection,
  note: string = ""
): Annotation {
  const annotation: Annotation = {
    id: generateId(),
    inkType,
    selection,
    note,
    chapterSlug,
    createdAt: new Date().toISOString(),
    isPublic: inkType !== "ghost",
  };

  const existing = getAnnotations(chapterSlug);
  const updated = [...existing, annotation];

  if (typeof window !== "undefined") {
    localStorage.setItem(
      STORAGE_KEYS.annotations(chapterSlug),
      JSON.stringify(updated)
    );
  }

  return annotation;
}

export function updateAnnotationNote(
  chapterSlug: string,
  annotationId: string,
  note: string
): void {
  if (typeof window === "undefined") return;
  const existing = getAnnotations(chapterSlug);
  const updated = existing.map((a) =>
    a.id === annotationId ? { ...a, note } : a
  );
  localStorage.setItem(
    STORAGE_KEYS.annotations(chapterSlug),
    JSON.stringify(updated)
  );
}

export function deleteAnnotation(chapterSlug: string, annotationId: string): void {
  if (typeof window === "undefined") return;
  const existing = getAnnotations(chapterSlug);
  const updated = existing.filter((a) => a.id !== annotationId);
  localStorage.setItem(
    STORAGE_KEYS.annotations(chapterSlug),
    JSON.stringify(updated)
  );
}

export function getAnnotationsByParagraph(
  chapterSlug: string,
  paragraphIndex: number
): Annotation[] {
  return getAnnotations(chapterSlug).filter(
    (a) => a.selection.paragraphIndex === paragraphIndex
  );
}

// ─── READER STATE STORAGE ────────────────────────────────────────────────────

export function getReaderState(chapterSlug: string): ReaderState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.readerState(chapterSlug));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function initReaderState(chapterSlug: string): ReaderState {
  const state: ReaderState = {
    chapterSlug,
    phase: "first_read",
    hasCompletedFirstRead: false,
    scrollProgress: 0,
    activeInkType: "ghost",
    annotations: [],
    questionAsked: false,
  };
  saveReaderState(state);
  return state;
}

export function saveReaderState(state: ReaderState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEYS.readerState(state.chapterSlug),
    JSON.stringify(state)
  );
}

export function updateScrollProgress(
  chapterSlug: string,
  progress: number
): void {
  const state = getReaderState(chapterSlug);
  if (!state) return;
  saveReaderState({ ...state, scrollProgress: Math.min(1, Math.max(0, progress)) });
}

export function markChapterComplete(chapterSlug: string): void {
  const state = getReaderState(chapterSlug);
  if (!state) return;

  const updated: ReaderState = {
    ...state,
    phase: "completion",
    hasCompletedFirstRead: true,
    completedAt: new Date().toISOString(),
  };
  saveReaderState(updated);

  // Track in global chapters-read list
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(STORAGE_KEYS.allChapters);
    const read: string[] = raw ? JSON.parse(raw) : [];
    if (!read.includes(chapterSlug)) {
      localStorage.setItem(
        STORAGE_KEYS.allChapters,
        JSON.stringify([...read, chapterSlug])
      );
    }
  }
}

export function setActiveInkType(chapterSlug: string, inkType: InkType): void {
  const state = getReaderState(chapterSlug);
  if (!state) return;
  saveReaderState({ ...state, activeInkType: inkType });
}

// ─── QUESTION CHAMBER ────────────────────────────────────────────────────────

export function getQuestions(chapterSlug: string): SignalQuestion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.questions(chapterSlug));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveQuestion(
  chapterSlug: string,
  selectedText: string,
  question: string,
  readerEmail?: string
): SignalQuestion {
  const q: SignalQuestion = {
    id: generateId(),
    selectedText,
    question,
    chapterSlug,
    readerEmail,
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  const existing = getQuestions(chapterSlug);
  localStorage.setItem(
    STORAGE_KEYS.questions(chapterSlug),
    JSON.stringify([...existing, q])
  );

  // Mark that a question has been asked for this chapter
  const state = getReaderState(chapterSlug);
  if (state) {
    saveReaderState({ ...state, questionAsked: true });
  }

  return q;
}

export function hasAskedQuestion(chapterSlug: string): boolean {
  const state = getReaderState(chapterSlug);
  return state?.questionAsked ?? false;
}

// ─── TEXT SELECTION UTILITIES ────────────────────────────────────────────────

export function captureSelection(paragraphIndex: number): TextSelection | null {
  if (typeof window === "undefined") return null;

  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || !selection.toString().trim()) {
    return null;
  }

  const text = selection.toString().trim();
  const range = selection.getRangeAt(0);

  return {
    text,
    startOffset: range.startOffset,
    endOffset: range.endOffset,
    paragraphIndex,
  };
}

// ─── CHAPTER COMPLETION CHECK ────────────────────────────────────────────────

export function getCompletedChapters(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.allChapters);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isChapterComplete(chapterSlug: string): boolean {
  return getCompletedChapters().includes(chapterSlug);
}

// ─── FULL EXPORT (for Phase 2 data migration) ───────────────────────────────

export function exportReaderData(): {
  annotations: Record<string, Annotation[]>;
  states: Record<string, ReaderState>;
  questions: Record<string, SignalQuestion[]>;
} {
  if (typeof window === "undefined") {
    return { annotations: {}, states: {}, questions: {} };
  }

  const chapters = getCompletedChapters();
  const result = {
    annotations: {} as Record<string, Annotation[]>,
    states: {} as Record<string, ReaderState>,
    questions: {} as Record<string, SignalQuestion[]>,
  };

  chapters.forEach((slug) => {
    result.annotations[slug] = getAnnotations(slug);
    const state = getReaderState(slug);
    if (state) result.states[slug] = state;
    result.questions[slug] = getQuestions(slug);
  });

  return result;
}

// ─── CLEAR (for dev/testing) ──────────────────────────────────────────────────

export function clearChapterData(chapterSlug: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.annotations(chapterSlug));
  localStorage.removeItem(STORAGE_KEYS.readerState(chapterSlug));
  localStorage.removeItem(STORAGE_KEYS.questions(chapterSlug));
}
