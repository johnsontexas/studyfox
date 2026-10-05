// Shapes of the data the website's modules produce (js/gen, js/content).
export type Test = 'SAT' | 'ACT';
export type Q = {
  id: string; uid: string; key: string; test: Test; section: string; domain: string; skill: string; difficulty: 1 | 2 | 3;
  type: 'mc' | 'spr'; passage: string; stem: string; figure: string; expl: string;
  choices?: string[]; answer?: number; accept?: number[]; answerDisplay?: string;
};
export type BankEntry = { no: number; id: string; section: string; domain: string; skill: string; difficulty: 1 | 2 | 3 };
export type Lesson = {
  id: string; title: string; mins: number; body: string;
  check?: { q: string; choices: string[]; answer: number; why: string };
  desmos?: unknown[]; practice?: { test: Test; section: string; skills?: string[] };
};
export type Course = { id: string; subject: string; icon: string; title: string; blurb: string; level: string; ap?: boolean; lessons: Lesson[] };
