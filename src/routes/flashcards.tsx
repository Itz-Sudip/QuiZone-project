import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, ListChecks } from "lucide-react";
import { dummyFlashcards } from "@/lib/dummy-data";
import { loadStudySet } from "@/lib/study-store";

export const Route = createFileRoute("/flashcards")({
  head: () => ({
    meta: [
      { title: "Flashcards — FlashGenius" },
      { name: "description", content: "Flip through your study flashcards." },
      { property: "og:title", content: "Flashcards — FlashGenius" },
      { property: "og:description", content: "Flip through your study flashcards." },
    ],
  }),
  component: Flashcards,
});

type Card = { front: string; back: string };

function Flashcards() {
  const [cards, setCards] = useState<Card[]>(() =>
    dummyFlashcards.map((c) => ({ front: c.front, back: c.back })),
  );
  const [title, setTitle] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const set = loadStudySet();
    if (set && set.flashcards.length > 0) {
      setCards(set.flashcards.map((f) => ({ front: f.question, back: f.answer })));
      setTitle(set.title ?? null);
    }
  }, []);

  const card = cards[index];
  const progress = ((index + 1) / cards.length) * 100;

  const go = (delta: number) => {
    setFlipped(false);
    setIndex((i) => Math.min(Math.max(i + delta, 0), cards.length - 1));
  };

  return (
    <main className="min-h-screen px-5 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-5 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <Link
            to="/quiz"
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50"
          >
            <ListChecks className="h-3.5 w-3.5" /> Take quiz
          </Link>
        </div>

        {title && (
          <h1 className="mb-3 text-center text-lg font-semibold tracking-tight sm:text-xl">{title}</h1>
        )}

        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Card {index + 1} of {cards.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div
          className="mx-auto mb-6 aspect-[3/4] w-full max-w-sm cursor-pointer sm:aspect-[4/3]"
          style={{ perspective: "1200px" }}
          onClick={() => setFlipped((f) => !f)}
          role="button"
          aria-label="Flip card"
        >
          <div className={`card-flip relative h-full w-full ${flipped ? "card-flip-flipped" : ""}`}>
            <div className="card-face absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
              <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Question</div>
              <div className="text-xl font-medium sm:text-2xl">{card.front}</div>
              <div className="mt-6 text-xs text-muted-foreground">Tap to reveal</div>
            </div>
            <div className="card-face card-face-back absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-primary/40 bg-card p-6 text-center shadow-sm">
              <div className="mb-3 text-xs uppercase tracking-widest text-primary">Answer</div>
              <div className="text-base sm:text-lg">{card.back}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => go(-1)}
            disabled={index === 0}
            className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-border bg-card py-3 text-sm font-medium disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" /> Prev
          </button>
          <button
            onClick={() => { setFlipped(false); setIndex(0); }}
            className="rounded-xl border border-border bg-card p-3"
            aria-label="Restart"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => go(1)}
            disabled={index === cards.length - 1}
            className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >
            Next <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  );
}
