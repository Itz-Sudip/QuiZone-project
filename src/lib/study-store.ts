import type { GeneratedQuizQuestion, GeneratedStudySet } from "./study-types";

const KEY = "flashgenius:studySet";
const NOTES_KEY = "flashgenius:notes";
const PROFILE_KEY = "flashgenius:profile";
const ASKED_KEY = "flashgenius:askedQuestions";

export type StoredProfile = { study_description?: string | null; exam?: string | null };

export function saveStudySet(set: GeneratedStudySet) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(set));
  } catch {
    // ignore
  }
}

export function loadStudySet(): GeneratedStudySet | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as GeneratedStudySet) : null;
  } catch {
    return null;
  }
}

export function saveQuiz(quiz: GeneratedQuizQuestion[]) {
  const set = loadStudySet();
  if (!set) return;
  saveStudySet({ ...set, quiz });
}

export function saveNotes(notes: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(NOTES_KEY, notes);
  } catch {
    // ignore
  }
}

export function loadNotes(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(NOTES_KEY);
  } catch {
    return null;
  }
}

export function saveProfileContext(profile: StoredProfile | null) {
  if (typeof window === "undefined") return;
  try {
    if (profile) sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    else sessionStorage.removeItem(PROFILE_KEY);
  } catch {
    // ignore
  }
}

export function loadProfileContext(): StoredProfile | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = sessionStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as StoredProfile) : undefined;
  } catch {
    return undefined;
  }
}

export function loadAskedQuestions(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(ASKED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function addAskedQuestions(questions: string[]) {
  if (typeof window === "undefined") return;
  try {
    const merged = Array.from(new Set([...loadAskedQuestions(), ...questions])).slice(-60);
    sessionStorage.setItem(ASKED_KEY, JSON.stringify(merged));
  } catch {
    // ignore
  }
}

export function resetAskedQuestions() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(ASKED_KEY);
  } catch {
    // ignore
  }
}
