export type Review = {
  id: string;
  sem: string;
  helpful: number;
  tags: string[];
  text: string;
};

export type Faculty = {
  id: string;
  name: string;
  dept: string;
  course: string;
  grade: string;
  diff: number;
  retake: number;
  count: number;
  reviews: Review[];
};

export type HeroSlip = {
  grade: string;
  name: string;
  meta: string;
  diff: number;
  retake: number;
  helpful: number;
  sem: string;
  quote: string;
};

export const faculty: Faculty[] = [
  {
    id: "cse-os",
    name: "Dr. R. Chandrasekaran",
    dept: "CSE",
    course: "Operating Systems",
    grade: "A–",
    diff: 3,
    retake: 87,
    count: 312,
    reviews: [
      {
        id: "cse-os-0",
        sem: "2025 · ODD",
        helpful: 168,
        tags: ["CLEAR EXPLANATIONS", "FAIR GRADING", "STRICT ATTENDANCE"],
        text: "Explains CPU scheduling better than the textbook does. Attendance is strict, but every quiz is announced a week ahead. Nothing cheap about the evaluation.",
      },
      {
        id: "cse-os-1",
        sem: "2024 · ODD",
        helpful: 94,
        tags: ["CHILL LABS", "PREDICTABLE EXAMS"],
        text: "Lab evals are chill if your record is complete. Viva questions come almost verbatim from the slides. Read them twice and you’re safe.",
      },
    ],
  },
  {
    id: "cse-dbms",
    name: "Prof. S. Meenakshi",
    dept: "CSE",
    course: "Database Management Systems",
    grade: "B+",
    diff: 4,
    retake: 62,
    count: 198,
    reviews: [
      {
        id: "cse-dbms-0",
        sem: "2024 · EVEN",
        helpful: 77,
        tags: ["FAST-PACED", "HEAVY SLIDES"],
        text: "Knows DBMS cold, but the slides move at 300 km/h. Sit in the first three rows or you’re basically decoration.",
      },
      {
        id: "cse-dbms-1",
        sem: "2025 · EVEN",
        helpful: 61,
        tags: ["HEAVY WORKLOAD", "MARK-GIVING"],
        text: "The group project is 40% of the mark, so pick teammates who actually show up. Assignments are long but generous once submitted.",
      },
    ],
  },
  {
    id: "ece-sig",
    name: "Dr. S. Venkatesh",
    dept: "ECE",
    course: "Signals & Systems",
    grade: "A",
    diff: 4,
    retake: 91,
    count: 266,
    reviews: [
      {
        id: "ece-sig-0",
        sem: "2025 · ODD",
        helpful: 143,
        tags: ["CONCEPT-FIRST", "DOUBT-FRIENDLY"],
        text: "Derives everything from first principles and still finishes the syllabus early. Ask doubts in class. He stayed back an hour after ours ended.",
      },
      {
        id: "ece-sig-1",
        sem: "2024 · ODD",
        helpful: 118,
        tags: ["FAIR GRADING"],
        text: "Strict about derivations in internals, so memorise the steps, not just results. Fair, transparent, zero surprises in the end-sem.",
      },
    ],
  },
  {
    id: "eee-pe",
    name: "Dr. Kavitha M.",
    dept: "EEE",
    course: "Power Electronics",
    grade: "B",
    diff: 5,
    retake: 44,
    count: 143,
    reviews: [
      {
        id: "eee-pe-0",
        sem: "2024 · EVEN",
        helpful: 89,
        tags: ["HEAVY SYLLABUS", "TOUGH GRADING"],
        text: "Brilliant command of the subject, brutal pace. Miss one class and the next one feels like a different course entirely. Take notes religiously.",
      },
      {
        id: "eee-pe-1",
        sem: "2025 · EVEN",
        helpful: 52,
        tags: ["HIGH DIFFICULTY"],
        text: "If you can keep up, she’s genuinely one of the best in EEE. Most can’t keep up. Choose your semester load wisely.",
      },
    ],
  },
  {
    id: "me-thermo",
    name: "Prof. S. Rajendran",
    dept: "MECH",
    course: "Thermodynamics",
    grade: "A+",
    diff: 3,
    retake: 93,
    count: 288,
    reviews: [
      {
        id: "me-thermo-0",
        sem: "2025 · ODD",
        helpful: 204,
        tags: ["BEST NOTES", "PREDICTABLE EXAMS"],
        text: "Makes entropy feel obvious. Drawing practice every single class, and the end-sem was the most predictable paper of my entire degree.",
      },
      {
        id: "me-thermo-1",
        sem: "2024 · ODD",
        helpful: 132,
        tags: ["DOUBT-FRIENDLY"],
        text: "Treats doubts like a conversation, not an interrogation. Rare in Mech. Tutorials mirror the exam paper almost exactly.",
      },
    ],
  },
  {
    id: "mat-dm",
    name: "Dr. Vasanthi R.",
    dept: "MAT",
    course: "Discrete Mathematics",
    grade: "B–",
    diff: 3,
    retake: 58,
    count: 121,
    reviews: [
      {
        id: "mat-dm-0",
        sem: "2024 · EVEN",
        helpful: 64,
        tags: ["PUNCTUAL", "COMPREHENSIVE"],
        text: "Sincere, punctual, covers the full syllabus without cutting corners. The accent takes about a week to tune into. Survive week one and you’re fine.",
      },
      {
        id: "mat-dm-1",
        sem: "2025 · EVEN",
        helpful: 47,
        tags: ["PREDICTABLE EXAMS"],
        text: "Refer her solved-problem sheets for internals; the paper lifts directly from them. Slow start, strong finish.",
      },
    ],
  },
  {
    id: "che-eng",
    name: "Dr. Prakash V.",
    dept: "CHE",
    course: "Engineering Chemistry",
    grade: "B+",
    diff: 1,
    retake: 71,
    count: 97,
    reviews: [
      {
        id: "che-eng-0",
        sem: "2024 · ODD",
        helpful: 122,
        tags: ["LIGHT WORKLOAD", "ATTENDANCE-ONLY"],
        text: "The easiest A of first year. Show up, sign the sheet, skim the night before. That’s the entire strategy.",
      },
      {
        id: "che-eng-1",
        sem: "2025 · ODD",
        helpful: 88,
        tags: ["RELAXED PACE"],
        text: "He knows nobody’s here for chemistry and doesn’t pretend otherwise. Respect for the honesty.",
      },
    ],
  },
  {
    id: "mba-fm",
    name: "Prof. Fathima Begum",
    dept: "MBA",
    course: "Financial Management",
    grade: "A",
    diff: 3,
    retake: 84,
    count: 176,
    reviews: [
      {
        id: "mba-fm-0",
        sem: "2025 · EVEN",
        helpful: 97,
        tags: ["CASE-DRIVEN", "COLD CALLS"],
        text: "Case-study driven, zero fluff. She cold-calls, so read before class. The fear is educational and the takeaway is real.",
      },
      {
        id: "mba-fm-1",
        sem: "2024 · EVEN",
        helpful: 84,
        tags: ["INDUSTRY INSIGHT"],
        text: "Brings actual examples from her consulting years. The FM concepts I learned here are the ones I use at my internship.",
      },
    ],
  },
];

export const heroSlips: HeroSlip[] = [
  {
    grade: "A–",
    name: "Dr. R. Chandrasekaran",
    meta: "CSE · OPERATING SYSTEMS",
    diff: 3,
    retake: 87,
    helpful: 168,
    sem: "2025 · ODD",
    quote:
      "Explains CPU scheduling better than the textbook. Attendance is strict, but every quiz is announced a week ahead.",
  },
  {
    grade: "A+",
    name: "Prof. S. Rajendran",
    meta: "MECH · THERMODYNAMICS",
    diff: 3,
    retake: 93,
    helpful: 204,
    sem: "2025 · ODD",
    quote:
      "Makes entropy feel obvious. The end-sem was the most predictable paper of my entire degree.",
  },
  {
    grade: "A",
    name: "Dr. S. Venkatesh",
    meta: "ECE · SIGNALS & SYSTEMS",
    diff: 4,
    retake: 91,
    helpful: 143,
    sem: "2025 · ODD",
    quote:
      "Derives everything from first principles and still finishes early. Stays back an hour for doubts.",
  },
  {
    grade: "A",
    name: "Prof. Fathima Begum",
    meta: "MBA · FINANCIAL MANAGEMENT",
    diff: 3,
    retake: 84,
    helpful: 97,
    sem: "2025 · EVEN",
    quote:
      "Case-study driven, zero fluff. She cold-calls. The fear is educational and the takeaway is real.",
  },
];

export const DEPT_CHIPS = ["ALL", "CSE", "ECE", "EEE", "MECH", "MAT", "CHE", "MBA"];

export const GRADES = ["A+", "A", "A–", "B+", "B", "B–", "C+"];

export const TAGS = [
  "Clear explanations",
  "Tough grading",
  "Fair grading",
  "Heavy slides",
  "Strict attendance",
  "Chill labs",
  "Best notes",
  "Light workload",
  "Pop quizzes",
  "Doubt-friendly",
];

export const DEPTS_SEL = [
  "CSE",
  "IT",
  "ECE",
  "EEE",
  "MECH",
  "CIVIL",
  "MAT",
  "PHY",
  "CHE",
  "BIO",
  "MBA",
  "MCA",
];

export const STATS = [
  { count: 12482, label: "REVIEWS FILED" },
  { count: 861, label: "FACULTY COVERED" },
  { count: 38, label: "DEPARTMENTS" },
  { count: 5, label: "MIN. REVIEWS PER GRADE" },
];

export function gradeCls(g: string): string {
  if (g.startsWith("A")) return "A";
  if (g.startsWith("B")) return "B";
  return "C";
}
