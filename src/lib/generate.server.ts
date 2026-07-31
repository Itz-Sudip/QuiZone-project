import type { GeneratedStudySet, GeneratedQuizQuestion } from "./study-types";

export const SCHEMA_TEMPLATE = `{
  "title": "string — short auto-generated title summarizing the notes topic",
  "flashcards": [
    { "id": 1, "question": "string", "answer": "string" }
  ],
  "quiz": [
    {
      "id": 1,
      "difficulty": "easy" | "medium" | "hard",
      "question": "string",
      "options": { "A": "string", "B": "string", "C": "string", "D": "string" },
      "correctAnswer": "A" | "B" | "C" | "D",
      "explanation": "string — why this option is correct"
    }
  ],
  "warnings": []
}`;

export const QUIZ_SCHEMA_TEMPLATE = `{
  "quiz": [
    {
      "id": 1,
      "difficulty": "easy" | "medium" | "hard",
      "question": "string",
      "options": { "A": "string", "B": "string", "C": "string", "D": "string" },
      "correctAnswer": "A" | "B" | "C" | "D",
      "explanation": "string — why this option is correct"
    }
  ],
  "warnings": []
}`;

const QUIZ_RULES = `Generate exactly 10 multiple-choice quiz questions from the notes, distributed as:
   - 4 easy questions (direct recall of a fact stated explicitly in the notes)
   - 4 medium questions (require connecting two related facts)
   - 2 hard questions (require reasoning or synthesis across the notes)
Each quiz question must have exactly 4 options labeled A-D, with exactly one correct answer, plus a short explanation of why it's correct. Vary which letter is correct across questions.`;

function profileBlock(exam?: string | null, studyDescription?: string | null): string {
  if (!exam && !studyDescription) return "";
  return `LEARNER PROFILE (use ONLY to bias tone and difficulty — never as a source of facts):
- Exam being prepared for: ${exam || "(not specified)"}
- Study description: ${studyDescription || "(not specified)"}

`;
}

export function buildPrompt(
  notes: string,
  exam?: string | null,
  studyDescription?: string | null,
): string {
  return `${profileBlock(exam, studyDescription)}Convert the following study notes into flashcards and a quiz.

STUDY NOTES:
"""
${notes}
"""

Requirements:
1. Generate exactly 10 flashcards. Each should test one discrete fact, definition, or concept. Questions must be answerable in 1-3 sentences. Do not create overlapping or duplicate flashcards.
2. ${QUIZ_RULES}
3. STRICT: Use ONLY facts explicitly present in the notes above. Do not invent, infer external facts, or add outside knowledge. If the learner profile mentions an exam or topic that is not in the notes, ignore it as a fact source — use it only to shape tone, phrasing, and question difficulty.
4. If the notes are too short to fully satisfy the above, generate as many high-quality items as possible and list the shortfall in "warnings".

Respond with a single JSON object matching this exact schema, no extra keys:
${SCHEMA_TEMPLATE}

Return ONLY the JSON object, no markdown fences, no commentary.`;
}

export function buildQuizPrompt(
  notes: string,
  previousQuestions: string[],
  exam?: string | null,
  studyDescription?: string | null,
): string {
  const prev = previousQuestions.length
    ? `QUESTIONS ALREADY ASKED (do not repeat them):
${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

`
    : "";

  return `${profileBlock(exam, studyDescription)}Create a NEW practice quiz from the following study notes.

STUDY NOTES:
"""
${notes}
"""

${prev}Requirements:
1. ${QUIZ_RULES}
2. The new questions must be DIFFERENT from the questions already asked — cover other facts, angles, or phrasings from the notes.
3. If the notes are limited and a question must cover the same fact as a previous one, then rewrite the question wording AND use a completely different set of four answer options (different distractors and a different correct-option letter).
4. STRICT: Use ONLY facts explicitly present in the notes above. Do not invent or add outside knowledge.
5. If the notes are too short, generate as many high-quality items as possible and list the shortfall in "warnings".

Respond with a single JSON object matching this exact schema, no extra keys:
${QUIZ_SCHEMA_TEMPLATE}

Return ONLY the JSON object, no markdown fences, no commentary.`;
}

export function extractJson(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("Model did not return valid JSON");
  }
}

export function assertStudySet(parsed: GeneratedStudySet): GeneratedStudySet {
  if (!parsed || !Array.isArray(parsed.flashcards) || !Array.isArray(parsed.quiz)) {
    throw new Error("Model returned an unexpected shape");
  }
  if (!Array.isArray(parsed.warnings)) parsed.warnings = [];
  return parsed;
}

export function assertQuiz(parsed: { quiz: GeneratedQuizQuestion[]; warnings?: string[] }) {
  if (!parsed || !Array.isArray(parsed.quiz) || parsed.quiz.length === 0) {
    throw new Error("Model returned an unexpected shape");
  }
  return { quiz: parsed.quiz, warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [] };
}
