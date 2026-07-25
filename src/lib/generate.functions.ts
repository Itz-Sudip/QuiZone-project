import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import type { GeneratedStudySet } from "./study-types";

const InputSchema = z.object({
  notes: z.string().min(10),
  profile: z
    .object({
      study_description: z.string().nullable().optional(),
      exam: z.string().nullable().optional(),
    })
    .optional(),
});

const SCHEMA_TEMPLATE = `{
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

function buildPrompt(notes: string, exam?: string | null, studyDescription?: string | null): string {
  const profileBlock =
    exam || studyDescription
      ? `LEARNER PROFILE (use ONLY to bias tone and difficulty — never as a source of facts):
- Exam being prepared for: ${exam || "(not specified)"}
- Study description: ${studyDescription || "(not specified)"}

`
      : "";

  return `${profileBlock}Convert the following study notes into flashcards and a quiz.

STUDY NOTES:
"""
${notes}
"""

Requirements:
1. Generate exactly 10 flashcards. Each should test one discrete fact, definition, or concept. Questions must be answerable in 1-3 sentences. Do not create overlapping or duplicate flashcards.
2. Generate exactly 5 multiple-choice quiz questions from the same notes, distributed as:
   - 2 easy questions (direct recall of a fact stated explicitly in the notes)
   - 2 medium questions (require connecting two related facts)
   - 1 hard question (requires reasoning or synthesis across the notes)
3. Each quiz question must have exactly 4 options labeled A-D, with exactly one correct answer, plus a short explanation of why it's correct.
4. STRICT: Use ONLY facts explicitly present in the notes above. Do not invent, infer external facts, or add outside knowledge. If the learner profile mentions an exam or topic that is not in the notes, ignore it as a fact source — use it only to shape tone, phrasing, and question difficulty.
5. If the notes are too short to fully satisfy the above, generate as many high-quality items as possible and list the shortfall in "warnings".

Respond with a single JSON object matching this exact schema, no extra keys:
${SCHEMA_TEMPLATE}

Return ONLY the JSON object, no markdown fences, no commentary.`;
}

function extractJson(text: string): unknown {
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

export const generateStudySet = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<GeneratedStudySet> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-2.5-flash");

    const { text } = await generateText({
      model,
      prompt: buildPrompt(data.notes, data.profile?.exam, data.profile?.study_description),
    });

    const parsed = extractJson(text) as GeneratedStudySet;
    if (!parsed || !Array.isArray(parsed.flashcards) || !Array.isArray(parsed.quiz)) {
      throw new Error("Model returned an unexpected shape");
    }
    if (!Array.isArray(parsed.warnings)) parsed.warnings = [];
    return parsed;
  });
