import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  Check,
  X,
  Trophy,
  RotateCcw,
  Brain,
  Sparkles,
  Loader2,
  ClipboardList,
  AlertCircle,
} from "lucide-react";
import { dummyQuiz } from "@/lib/dummy-data";
import {
  addAskedQuestions,
  loadAskedQuestions,
  loadNotes,
  loadProfileContext,
  loadStudySet,
  saveQuiz,
} from "@/lib/study-store";
import { generateNewQuiz } from "@/lib/generate.functions";
import type { GeneratedQuizQuestion } from "@/lib/study-types";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Quiz — QuiZone" },
      { name: "description", content: "Test your knowledge with instant feedback." },
      { property: "og:title", content: "Quiz — QuiZone" },
      { property: "og:description", content: "Test your knowledge with instant feedback." },
    ],
  }),
  component: Quiz,
});

type QQ = {
  question: string;
  choices: string[];
  correctIndex: number;
  explanation?: string;
  difficulty?: string;
};

const LETTERS = ["A", "B", "C", "D"] as const;

function mapQuiz(quiz: GeneratedQuizQuestion[]): QQ[] {
  return quiz.map((q) => {
    const choices = LETTERS.map((l) => q.options[l]);
    const correctIndex = LETTERS.indexOf(q.correctAnswer);
    return {
      question: q.question,
      choices,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
      explanation: q.explanation,
      difficulty: q.difficulty,
    };
  });
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleLocalQuiz(): QQ[] {
  return shuffle(dummyQuiz).map((q) => {
    const pairs = shuffle(q.choices.map((c, i) => ({ c, correct: i === q.correctIndex })));
    return {
      question: q.question,
      choices: pairs.map((p) => p.c),
      correctIndex: pairs.findIndex((p) => p.correct),
    };
  });
}

function Quiz() {
  const [questions, setQuestions] = useState<QQ[]>(() =>
    dummyQuiz.map((q) => ({
      question: q.question,
      choices: q.choices,
      correctIndex: q.correctIndex,
    })),
  );
  const [isAiSet, setIsAiSet] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const newQuiz = useServerFn(generateNewQuiz);

  useEffect(() => {
    const set = loadStudySet();
    if (set && set.quiz.length > 0) {
      setQuestions(mapQuiz(set.quiz));
      setIsAiSet(true);
      addAskedQuestions(set.quiz.map((q) => q.question));
    }
  }, []);

  const q = questions[index];
  const progress = ((index + (selected !== null ? 1 : 0)) / questions.length) * 100;

  const pick = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = i;
      return next;
    });
    if (i === q.correctIndex) setScore((s) => s + 1);
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      setDone(true);
    } else {
      setIndex(index + 1);
      setSelected(null);
    }
  };

  const resetRun = () => {
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setScore(0);
    setDone(false);
    setReviewing(false);
  };

  const handleAnotherQuiz = async () => {
    setError(null);
    const notes = loadNotes();
    if (!isAiSet || !notes) {
      setQuestions(shuffleLocalQuiz());
      resetRun();
      return;
    }
    setRegenerating(true);
    try {
      const result = await newQuiz({
        data: {
          notes,
          previousQuestions: loadAskedQuestions(),
          profile: loadProfileContext(),
        },
      });
      setQuestions(mapQuiz(result.quiz));
      saveQuiz(result.quiz);
      addAskedQuestions(result.quiz.map((item) => item.question));
      resetRun();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(
        msg.includes("429")
          ? "Rate limit reached. Please try again in a moment."
          : msg.includes("402")
            ? "AI credits exhausted. Add credits in workspace billing."
            : msg,
      );
    } finally {
      setRegenerating(false);
    }
  };

  if (reviewing) {
    return (
      <main className="min-h-screen px-5 py-6 sm:py-10">
        <div className="mx-auto w-full max-w-xl">
          <div className="mb-5 flex items-center justify-between">
            <button
              onClick={() => setReviewing(false)}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Results
            </button>
            <span className="text-xs text-muted-foreground">
              {score}/{questions.length} correct
            </span>
          </div>

          <h1 className="mb-4 text-xl font-semibold tracking-tight">Review your answers</h1>

          <div className="flex flex-col gap-3">
            {questions.map((item, qi) => {
              const picked = answers[qi] ?? null;
              const wasCorrect = picked === item.correctIndex;
              return (
                <div key={qi} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                        wasCorrect
                          ? "bg-[color-mix(in_oklab,var(--success)_20%,transparent)] text-[color:var(--success)]"
                          : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      {wasCorrect ? "✓" : "✕"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Question {qi + 1}
                      {item.difficulty ? ` · ${item.difficulty}` : ""}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{item.question}</p>
                  <div className="mt-3 flex flex-col gap-1.5">
                    {item.choices.map((choice, ci) => {
                      const isCorrect = ci === item.correctIndex;
                      const isPicked = picked === ci;
                      let cls =
                        "flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs";
                      if (isCorrect)
                        cls +=
                          " border-[color:var(--success)] bg-[color-mix(in_oklab,var(--success)_12%,transparent)]";
                      else if (isPicked) cls += " border-destructive bg-destructive/10";
                      else cls += " opacity-70";
                      return (
                        <div key={ci} className={cls}>
                          <span>
                            <span className="mr-2 text-muted-foreground">{LETTERS[ci]}.</span>
                            {choice}
                          </span>
                          {isCorrect && <Check className="h-3.5 w-3.5 text-[color:var(--success)]" />}
                          {isPicked && !isCorrect && <X className="h-3.5 w-3.5 text-destructive" />}
                        </div>
                      );
                    })}
                  </div>
                  {picked === null && (
                    <p className="mt-2 text-xs text-muted-foreground">You skipped this question.</p>
                  )}
                  {item.explanation && (
                    <div className="mt-3 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                      {item.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setReviewing(false)}
            className="mt-5 w-full rounded-xl border border-border bg-card py-3 text-sm font-medium hover:border-primary/50"
          >
            Back to results
          </button>
        </div>
      </main>
    );
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const msg =
      pct >= 80 ? "Outstanding!" : pct >= 50 ? "Nice work — keep going." : "Keep practicing.";
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Trophy className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-semibold">Quiz complete</h1>
          <p className="mt-1 text-sm text-muted-foreground">{msg}</p>
          <div className="my-6">
            <div className="text-5xl font-bold text-primary">
              {score}<span className="text-2xl text-muted-foreground">/{questions.length}</span>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{pct}% correct</div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleAnotherQuiz}
              disabled={regenerating}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {regenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {regenerating ? "Building a new quiz…" : "Take another quiz"}
            </button>
            <button
              onClick={() => setReviewing(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium hover:border-primary/50"
            >
              <ClipboardList className="h-4 w-4" /> Review this quiz
            </button>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={resetRun}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium hover:border-primary/50"
              >
                <RotateCcw className="h-4 w-4" /> Retry same quiz
              </button>
              <Link
                to="/flashcards"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium hover:border-primary/50"
              >
                <Brain className="h-4 w-4" /> Review cards
              </Link>
            </div>
          </div>
          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-left text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <Link to="/" className="mt-4 inline-block text-xs text-muted-foreground hover:text-foreground">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-5 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <span className="text-xs text-muted-foreground">Score {score}</span>
        </div>

        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Question {index + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
          {q.difficulty && (
            <div className="mb-2 inline-flex rounded-full border border-border bg-background px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
              {q.difficulty}
            </div>
          )}
          <h2 className="text-lg font-medium sm:text-xl">{q.question}</h2>

          <div className="mt-5 flex flex-col gap-2">
            {q.choices.map((choice, i) => {
              const isCorrect = i === q.correctIndex;
              const isPicked = selected === i;
              let cls =
                "flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3 text-left text-sm transition";
              if (selected === null) {
                cls += " hover:border-primary/50";
              } else if (isCorrect) {
                cls += " border-[color:var(--success)] bg-[color-mix(in_oklab,var(--success)_15%,transparent)]";
              } else if (isPicked) {
                cls += " border-destructive bg-[color-mix(in_oklab,var(--destructive)_15%,transparent)]";
              } else {
                cls += " opacity-60";
              }
              return (
                <button key={i} onClick={() => pick(i)} className={cls} disabled={selected !== null}>
                  <span><span className="mr-2 text-muted-foreground">{LETTERS[i]}.</span>{choice}</span>
                  {selected !== null && isCorrect && <Check className="h-4 w-4 text-[color:var(--success)]" />}
                  {selected !== null && isPicked && !isCorrect && <X className="h-4 w-4 text-destructive" />}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div className="mt-5 flex flex-col gap-3">
              <div className="text-sm">
                {selected === q.correctIndex ? (
                  <span className="text-[color:var(--success)]">Correct!</span>
                ) : (
                  <span className="text-destructive">Not quite.</span>
                )}
              </div>
              {q.explanation && (
                <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                  {q.explanation}
                </div>
              )}
              <div className="flex justify-end">
                <button
                  onClick={next}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  {index + 1 >= questions.length ? "See results" : "Next"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
