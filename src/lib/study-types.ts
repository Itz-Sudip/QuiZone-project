export type GeneratedFlashcard = { id: number; question: string; answer: string };
export type GeneratedQuizQuestion = {
  id: number;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
};
export type GeneratedStudySet = {
  title: string;
  flashcards: GeneratedFlashcard[];
  quiz: GeneratedQuizQuestion[];
  warnings: string[];
};
