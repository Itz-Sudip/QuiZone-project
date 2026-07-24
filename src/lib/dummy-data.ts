export type Flashcard = { id: number; front: string; back: string };
export type QuizQuestion = {
  id: number;
  question: string;
  choices: string[];
  correctIndex: number;
};

export const dummyFlashcards: Flashcard[] = [
  { id: 1, front: "What is photosynthesis?", back: "The process by which plants convert light energy into chemical energy stored in glucose." },
  { id: 2, front: "Define mitochondria", back: "The organelle responsible for producing ATP — the cell's energy currency." },
  { id: 3, front: "What is Newton's First Law?", back: "An object at rest stays at rest, and an object in motion stays in motion, unless acted upon by an external force." },
  { id: 4, front: "What is a covalent bond?", back: "A chemical bond formed by the sharing of electron pairs between atoms." },
  { id: 5, front: "Define osmosis", back: "The movement of water across a semipermeable membrane from low to high solute concentration." },
  { id: 6, front: "What is DNA?", back: "Deoxyribonucleic acid — the molecule that carries genetic instructions in living organisms." },
  { id: 7, front: "What is kinetic energy?", back: "The energy an object possesses due to its motion, calculated as ½mv²." },
  { id: 8, front: "Define entropy", back: "A measure of disorder or randomness in a thermodynamic system." },
  { id: 9, front: "What is a catalyst?", base: undefined as never, back: "A substance that speeds up a chemical reaction without being consumed." },
  { id: 10, front: "What is gravity?", back: "The force by which a planet or other body draws objects toward its center." },
];

export const dummyQuiz: QuizQuestion[] = [
  {
    id: 1,
    question: "Which organelle produces ATP?",
    choices: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
    correctIndex: 1,
  },
  {
    id: 2,
    question: "Photosynthesis primarily converts light energy into what?",
    choices: ["Heat", "Kinetic energy", "Chemical energy", "Electrical energy"],
    correctIndex: 2,
  },
  {
    id: 3,
    question: "Newton's First Law is also known as the law of…",
    choices: ["Inertia", "Acceleration", "Gravitation", "Momentum"],
    correctIndex: 0,
  },
  {
    id: 4,
    question: "A covalent bond involves…",
    choices: ["Transfer of electrons", "Sharing of electrons", "Sharing of protons", "Magnetic attraction"],
    correctIndex: 1,
  },
  {
    id: 5,
    question: "Osmosis is the movement of…",
    choices: ["Ions", "Water", "Proteins", "Gases"],
    correctIndex: 1,
  },
  {
    id: 6,
    question: "DNA stands for…",
    choices: ["Dinucleic acid", "Deoxyribonucleic acid", "Diribonucleic acid", "Deoxyriboneutral acid"],
    correctIndex: 1,
  },
  {
    id: 7,
    question: "Kinetic energy formula is…",
    choices: ["mgh", "½mv²", "Fd", "mc²"],
    correctIndex: 1,
  },
  {
    id: 8,
    question: "Entropy is a measure of…",
    choices: ["Energy", "Mass", "Disorder", "Temperature"],
    correctIndex: 2,
  },
];
