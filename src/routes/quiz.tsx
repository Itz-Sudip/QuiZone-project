import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, X, Trophy, RotateCcw, Brain } from "lucide-react";
import { dummyQuiz } from "@/lib/dummy-data";
import { loadStudySet } from "@/lib/study-store";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Quiz — FlashGenius" },
      { name: "description", content: "Test your knowledge with instant feedback." },
      { property: "og:title", content: "Quiz — FlashGenius" },
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

function Quiz() {
  const [questions, setQuestions] = useState<QQ[]>(() =>
    dummyQuiz.map((q) => ({
      question: q.question,
      choices: q.choices,
      correctIndex: q.correctIndex,
    })),
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const set = loadStudySet();
    if (set && set.quiz.length > 0) {
      setQuestions(
        set.quiz.map((q) => {
          const choices = LETTERS.map((l) => q.options[l]);
          const correctIndex = LETTERS.indexOf(q.correctAnswer);
          return {
            question: q.question,
            choices,
            correctIndex: correctIndex >= 0 ? correctIndex : 0,
            explanation: q.explanation,
            difficulty: q.difficulty,
          };
        }),
      );
    }
  }, []);

  const q = questions[index];
  const progress = ((index + (selected !== null ? 1 : 0)) / questions.length) * 100;

  const pick = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
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

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  };

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
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={restart}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <RotateCcw className="h-4 w-4" /> Retry
            </button>
            <Link
              to="/flashcards"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium hover:border-primary/50"
            >
              <Brain className="h-4 w-4" /> Review cards
            </Link>
          </div>
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
