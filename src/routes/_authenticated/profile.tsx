import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, LogOut, Save, User, BookOpen, GraduationCap, CheckCircle2 } from "lucide-react";
import { getMyProfile, updateMyProfile } from "@/lib/profile.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — QuiZone" },
      { name: "description", content: "Set your study description and the exam you're preparing for." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const load = useServerFn(getMyProfile);
  const save = useServerFn(updateMyProfile);

  const [fullName, setFullName] = useState("");
  const [studyDescription, setStudyDescription] = useState("");
  const [exam, setExam] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load()
      .then((p) => {
        setFullName(p.full_name ?? "");
        setStudyDescription(p.study_description ?? "");
        setExam(p.exam ?? "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await save({
        data: {
          full_name: fullName.trim() || null,
          study_description: studyDescription.trim() || null,
          exam: exam.trim() || null,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <main className="min-h-screen px-5 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate({ to: "/" })}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </button>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Your study profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell QuiZone what you're studying and which exam you're preparing for. We'll bias the tone and difficulty of your flashcards and quizzes to match — while sticking strictly to facts in your notes.
          </p>
        </header>

        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Loading…
          </div>
        ) : (
          <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                <User className="h-3.5 w-3.5 text-primary" /> Name
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="What should we call you?"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                <GraduationCap className="h-3.5 w-3.5 text-primary" /> Exam you're preparing for
              </label>
              <input
                value={exam}
                onChange={(e) => setExam(e.target.value)}
                placeholder="e.g. NEET, GRE, AP Biology, CFA Level 1…"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                <BookOpen className="h-3.5 w-3.5 text-primary" /> Study description
              </label>
              <textarea
                value={studyDescription}
                onChange={(e) => setStudyDescription(e.target.value)}
                placeholder="Subjects, level (undergrad/high school), goals, weak areas…"
                className="h-32 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                maxLength={1000}
              />
              <div className="mt-1 text-right text-xs text-muted-foreground">
                {studyDescription.length}/1000
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving…" : saved ? "Saved" : "Save profile"}
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
