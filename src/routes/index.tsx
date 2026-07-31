import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Brain, ListChecks, AlertCircle, Plus, User, LogIn, Loader2 } from "lucide-react";
import { generateStudySet } from "@/lib/generate.functions";
import { getMyProfile, type Profile } from "@/lib/profile.functions";
import {
  saveStudySet,
  saveNotes,
  saveProfileContext,
  resetAskedQuestions,
} from "@/lib/study-store";
import { supabase } from "@/integrations/supabase/client";

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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();
  const generate = useServerFn(generateStudySet);
  const loadProfile = useServerFn(getMyProfile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const authed = !!data.session;
      setSignedIn(authed);
      if (authed) {
        loadProfile()
          .then((p) => mounted && setProfile(p))
          .catch(() => {});
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session);
      if (session) {
        loadProfile().then((p) => setProfile(p)).catch(() => {});
      } else {
        setProfile(null);
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const canGenerate = notes.trim().length >= 10 && !loading;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setError(null);
    setLoading(true);
    try {
      const profileContext = profile
        ? { study_description: profile.study_description, exam: profile.exam }
        : undefined;
      const result = await generate({
        data: { notes: notes.trim(), profile: profileContext },
      });
      saveStudySet(result);
      saveNotes(notes.trim());
      saveProfileContext(profileContext ?? null);
      resetAskedQuestions();
      navigate({ to: "/flashcards" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(
        msg.includes("429")
          ? "Rate limit reached. Please try again in a moment."
          : msg.includes("402")
            ? "AI credits exhausted. Add credits in workspace billing."
            : msg,
      );
      setLoading(false);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/parse-notes", { method: "POST", body: form });
      const json = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || !json.text) {
        throw new Error(json.error ?? "Failed to read file");
      }
      setNotes((prev) => (prev.trim() ? `${prev.trim()}\n\n${json.text}` : json.text!));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to read file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen px-5 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <nav className="mb-8 flex items-center justify-between">
          <div className="text-sm font-semibold tracking-tight">
            Flash<span className="text-primary">Genius</span>
          </div>
          {signedIn ? (
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent"
            >
              <User className="h-3.5 w-3.5" />
              {profile?.full_name || "Profile"}
            </Link>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent"
            >
              <LogIn className="h-3.5 w-3.5" /> Sign in
            </Link>
          )}
        </nav>

        <header className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI study companion
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Flash<span className="text-primary">Genius</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            Paste your notes or upload a document. Get flashcards and a quiz in seconds — using only facts from your notes.
          </p>
          {signedIn && profile?.exam && (
            <p className="mx-auto mt-3 max-w-md text-xs text-primary/80">
              Tailoring tone & difficulty for: <span className="font-medium">{profile.exam}</span>
            </p>
          )}
        </header>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="notes" className="block text-sm font-medium">
              Your notes
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground disabled:opacity-60"
              title="Upload .txt, .md, or .pdf"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              {uploading ? "Reading…" : "Upload file"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf"
              onChange={handleFile}
              className="hidden"
            />
          </div>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste lecture notes, a chapter, or key concepts here — or upload a .txt / .pdf file."
            className="h-56 w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-72"
          />
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            <Sparkles className={`h-4 w-4 ${loading ? "animate-pulse" : ""}`} />
            {loading ? "Generating…" : "Generate"}
          </button>
          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {loading
              ? "Reading your notes and crafting your study set…"
              : signedIn
                ? "10 flashcards + a 5-question quiz, tailored to your exam profile."
                : "10 flashcards + a 5-question quiz. Sign in to personalize for your exam."}
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
