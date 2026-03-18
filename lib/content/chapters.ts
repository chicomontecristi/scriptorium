// ─── CHAPTER CONTENT ────────────────────────────────────────────────────────
// Phase 1: Static content. One chapter to prove the concept.
// Phase 2: This feeds from Sanity.io CMS.
//
// IMPORTANT FOR JOSÉ:
// Replace the placeholder paragraphs with the actual biography content.
// Each paragraph = one ChapterParagraph object.
// Use { isSectionBreak: true } for scene/section breaks.
// Use { isEpigraph: true } on the first paragraph for opening quotes.

import type { Chapter } from "@/lib/types";

export const CHAPTERS: Record<string, Chapter> = {
  one: {
    slug: "one",
    number: 1,
    romanNumeral: "ONE",
    title: "The Sound Before the Sound",
    subtitle: "San Juan, 1966–1978",
    epigraph: {
      text: "Every song is a country. I was born stateless.",
      attribution: "Robi Draco Rosa",
    },
    isLocked: false,
    wordCount: 0, // Will be calculated
    paragraphs: [
      // ────────────────────────────────────────────────────────────────────
      // PLACEHOLDER CONTENT — Replace with actual biography text
      // ────────────────────────────────────────────────────────────────────
      {
        index: 0,
        text: "The house on Calle del Parque had a room that didn't appear on any floor plan. His mother called it the listening room. His father called it the problem. For the boy who would become Robi Draco Rosa, it was simply where he went when the world outside was too loud or too quiet — which meant he went there almost always.",
        isIndented: false,
      },
      {
        index: 1,
        text: "San Juan in those years was a city performing its own mythology. The Atlantic arrived at its shore every morning like a rumor confirming itself, salt and violence and absolute blue. The Americanization was deep but imperfect, which gave the island its particular texture: a place where the imported and the ancient had been arguing long enough to produce something new, something unnamed, something that sounded exactly like the music he would spend his life making.",
      },
      {
        index: 2,
        text: "Roberto Rogelio Rosa Flores was born on October 9, 1965, in Santurce, a barrio of San Juan that carried in its name both a saint and a kind of wound. His father, Roberto Rosa, was a man who understood geometry — he built things that stayed built — and who listened to music the way an engineer listens to a bridge: for the forces inside it, for what might give way. His mother, Iraida Flores, was the source of the dreams.",
      },
      {
        index: 3,
        isSectionBreak: true,
        text: "",
      },
      {
        index: 4,
        text: "The guitar came into his hands at seven. His uncle placed it there with the ceremony of someone handing over something dangerous, which it was. The instrument was larger than his body could comfortably hold, and he spent the first months not playing it so much as negotiating with it — learning where it would give, where it would resist, finding the logic in the frets the way you find the logic in a face you will eventually love.",
        isIndented: false,
      },
      {
        index: 5,
        text: "What no one around him understood yet was that he was not learning an instrument. He was discovering a medium. The guitar was the first technology that felt native to him — more native than language, more certain than memory. When he played, something in his nervous system organized itself around the sound in a way that no other activity, before or since, would fully replicate.",
      },
      {
        index: 6,
        text: "By ten, he was writing songs. Not fragments, not exercises — songs. Structured, whole, with a beginning that created expectation and an ending that honored it. His mother found the notebooks. She recognized, without being able to name, what she was looking at: evidence of a vocation.",
      },
      {
        index: 7,
        isSectionBreak: true,
        text: "",
      },
      {
        index: 8,
        text: "The school he attended was not designed for him. Schools in that era were rarely designed for the children inside them, but there is a particular mismatch between a certain kind of intelligence and the institutional containers built to hold it, and this mismatch has consequences. He was not a bad student. He was an absent one — present in body, elsewhere in mind, mapping the interior landscape that would eventually become his discography.",
        isIndented: false,
      },
      {
        index: 9,
        text: "There were teachers who saw through the absence. The music teacher, a woman named Doña Carmen who smelled of talcum powder and tobacco and had once, in another life, performed in New York, recognized the boy immediately. She gave him access to the school's practice rooms after hours. She did not explain this generosity and he did not ask her to. Some things between a teacher and a student do not require explanation — they require only that both parties show up, which they did, for three years, until he left for something larger.",
      },
      {
        index: 10,
        text: "The something larger was Menudo.",
      },
      {
        index: 11,
        isSectionBreak: true,
        text: "",
      },
      {
        index: 12,
        text: "The audition happened in 1977. He was twelve years old. The group was already a phenomenon in Latin America — a machine of synchronized adolescent performance that had absorbed and would continue to absorb a specific type of beautiful, talented, replaceable boy. The producer, Edgardo Díaz, sat in a room full of children and their hope, and when this particular child stood up to sing, something in the equation changed.",
        isIndented: false,
      },
      {
        index: 13,
        text: "He was accepted. His parents drove home in a silence that contained both pride and grief — the silence of parents who understand that their child's future will no longer be primarily theirs to protect. He sat in the back seat and watched San Juan move past the window, the city he was about to briefly leave and would spend decades returning to, in memory if not in body, in music if not in fact.",
      },
      {
        index: 14,
        text: "The boy on his way to becoming a star did not yet know what stardom would cost. Very few people do, at twelve, in the back of a car, watching a city of saints and wounds recede into the particular kind of tropical evening that feels like the world offering you everything it has.",
      },
    ],
  },
};

export function getChapter(slug: string): Chapter | null {
  return CHAPTERS[slug] ?? null;
}

export function getAllChapterSlugs(): string[] {
  return Object.keys(CHAPTERS);
}
