import type { GeneratedStudySet } from "./study-types";

const KEY = "flashgenius:studySet";

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
