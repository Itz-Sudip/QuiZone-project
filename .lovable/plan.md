Rewrite README.md with a comprehensive project overview for QuiZone.

Current README is a minimal Lovable-generated stub. Replace it with a polished README that explains:

1. What QuiZone is and the problem it solves (AI-powered flashcards & quizzes from study notes).
2. Core features:
   - Paste notes or upload .txt / .md / .pdf documents.
   - AI-generated flashcards with 3D flip interaction and progress bar.
   - AI-generated 10-question multiple-choice quizzes with instant right/wrong feedback and explanations.
   - Post-quiz options: take another fresh quiz (questions deduplicated, options reshuffled if a fact repeats), review answers, retry the same quiz, or jump back to flashcards.
   - User authentication via email/password and Google OAuth.
   - User profile with study description and exam target, which tailors tone and difficulty without adding outside facts.
3. Tech stack: TanStack Start (React 19), TypeScript, Tailwind CSS v4, Lovable AI Gateway (google/gemini-2.5-flash), Lovable Cloud (Supabase) auth + profiles, unpdf for PDF parsing.
4. Architecture notes:
   - `src/routes/index.tsx` landing page.
   - `src/routes/flashcards.tsx` and `src/routes/quiz.tsx` for study modes.
   - `src/routes/auth.tsx` and `src/routes/_authenticated/profile.tsx` for auth/profile.
   - `src/lib/generate.functions.ts` server functions for AI generation.
   - `src/lib/study-store.ts` for sessionStorage persistence.
5. Setup instructions: install dependencies, environment variables (LOVABLE_API_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY), run dev, build.
6. Usage guide and data-privacy note (AI only uses facts from the uploaded/pasted notes).
7. License and contribution placeholders.

Keep the existing "Built with Lovable" paragraph and project links at the end.