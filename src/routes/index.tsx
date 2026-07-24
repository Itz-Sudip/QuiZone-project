import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Brain, ListChecks } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FlashGenius — Study smarter" },
      { name: "description", content: "Paste your notes and generate flashcards & quizzes instantly." },
      { property: "og:title", content: "FlashGenius — Study smarter" },
      { property: "og:description", content: "Paste your notes and generate flashcards & quizzes instantly." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = () => {
    setLoading(true);
    // Dummy delay — real AI hookup goes here later
    setTimeout(() => {
      setLoading(false);
      navigate({ to: "/flashcards" });
    }, 700);
  };

  return (
    <main className="min-h-screen px-5 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI study companion
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Flash<span className="text-primary">Genius</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            Paste your notes. Get flashcards and a quiz in seconds.
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <label htmlFor="notes" className="mb-2 block text-sm font-medium">
            Your notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste lecture notes, a chapter, or key concepts here…"
            className="h-56 w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-72"
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Generating…" : "Generate"}
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Using sample study set for now — AI hookup coming soon.
          </p>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3">
          <Link
            to="/flashcards"
            className="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/50"
          >
            <Brain className="h-5 w-5 text-primary" />
            <div className="text-sm font-medium">Flashcards</div>
            <div className="text-xs text-muted-foreground">Flip to review</div>
          </Link>
          <Link
            to="/quiz"
            className="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/50"
          >
            <ListChecks className="h-5 w-5 text-primary" />
            <div className="text-sm font-medium">Quiz</div>
            <div className="text-xs text-muted-foreground">Test yourself</div>
          </Link>
        </section>
      </div>
    </main>
  );
}
