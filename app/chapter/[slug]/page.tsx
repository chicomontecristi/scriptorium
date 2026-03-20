import { notFound } from "next/navigation";
import { getChapter, getAllChapterSlugs, CHAPTERS } from "@/lib/content/chapters";
import ChapterPageClient from "./ChapterPageClient";

// ─── CHAPTER PAGE ────────────────────────────────────────────────────────────
// Server component: fetches chapter data, renders the client reading surface.
// Phase 1: static content from chapters.ts
// Phase 2: fetch from Sanity.io

interface Props {
  params: { slug: string };
}

// Generate static paths at build time
export async function generateStaticParams() {
  return getAllChapterSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const chapter = getChapter(params.slug);
  if (!chapter) return {};

  return {
    title: `Chapter ${chapter.romanNumeral}: ${chapter.title} — Tintaxis`,
    description: chapter.subtitle,
  };
}

export default function ChapterPage({ params }: Props) {
  const chapter = getChapter(params.slug);

  if (!chapter) {
    notFound();
  }

  // Resolve next chapter (by chapter number)
  const allChapters = Object.values(CHAPTERS).sort((a, b) => a.number - b.number);
  const currentIndex = allChapters.findIndex((c) => c.slug === chapter.slug);
  const nextChapter = currentIndex >= 0 ? (allChapters[currentIndex + 1] ?? null) : null;
  const prevChapter = currentIndex > 0 ? (allChapters[currentIndex - 1] ?? null) : null;

  return <ChapterPageClient chapter={chapter} nextChapter={nextChapter} prevChapter={prevChapter} />;
}
