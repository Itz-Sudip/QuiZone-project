import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import {
  assertQuiz,
  assertStudySet,
  buildPrompt,
  buildQuizPrompt,
  extractJson,
} from "./generate.server";
import type { GeneratedQuizQuestion, GeneratedStudySet } from "./study-types";

const ProfileSchema = z
  .object({
    study_description: z.string().nullable().optional(),
    exam: z.string().nullable().optional(),
  })
  .optional();

const InputSchema = z.object({
  notes: z.string().min(10),
  profile: ProfileSchema,
});

const QuizInputSchema = z.object({
  notes: z.string().min(10),
  previousQuestions: z.array(z.string()).default([]),
  profile: ProfileSchema,
});

export const generateStudySet = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<GeneratedStudySet> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const { text } = await generateText({
      model: gateway("google/gemini-2.5-flash"),
      prompt: buildPrompt(data.notes, data.profile?.exam, data.profile?.study_description),
    });

    return assertStudySet(extractJson(text) as GeneratedStudySet);
  });

export const generateNewQuiz = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => QuizInputSchema.parse(input))
  .handler(async ({ data }): Promise<{ quiz: GeneratedQuizQuestion[]; warnings: string[] }> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const { text } = await generateText({
      model: gateway("google/gemini-2.5-flash"),
      prompt: buildQuizPrompt(
        data.notes,
        data.previousQuestions,
        data.profile?.exam,
        data.profile?.study_description,
      ),
      temperature: 1,
    });

    return assertQuiz(extractJson(text) as { quiz: GeneratedQuizQuestion[]; warnings?: string[] });
  });
