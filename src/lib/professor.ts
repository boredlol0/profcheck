export type ProfessorRow = {
  srm_slug: string;
  name: string;
  department: string | null;
  college: string | null;
  campus: string;
  photo_url: string | null;
  profile_url: string;
  specialization: string | null;
  courses_taught: string[];
  avg_overall: number | null;
  avg_difficulty: number | null;
  avg_clarity: number | null;
  avg_approachability: number | null;
  avg_grading: number | null;
  avg_engagement: number | null;
  ratings_count: number;
};

export type ReviewRow = {
  id: string;
  clarity: number;
  approachability: number;
  grading: number;
  engagement: number;
  overall: number;
  course: string;
  body: string;
  helpful_count: number;
  created_at: string;
};

/** PostgREST returns NUMERIC columns as strings — coerce them for .toFixed/sort. */
export function num(v: number | string | null | undefined): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Lowercase, turn punctuation (dots, hyphens, apostrophes) into spaces. */
export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function termScore(words: string[], term: string): number {
  let best = -1;
  for (const w of words) {
    if (!w) continue;
    if (w === term) best = Math.max(best, 3);
    else if (w.startsWith(term)) best = Math.max(best, 2);
    else if (term.length >= 3 && w.includes(term)) best = Math.max(best, 1);
  }
  return best;
}

/**
 * Token search: every query term must match. Name matches weigh double so
 * "suresh" ranks Dr. Suresh E above a professor who merely teaches a subject
 * mentioning it. Returns -1 when any term misses, else a ranking score.
 */
export function rankMatch(name: string, rest: string, query: string): number {
  const terms = normalizeText(query).split(" ").filter(Boolean);
  if (!terms.length) return 0;
  const nameWords = normalizeText(name).split(" ");
  const restWords = normalizeText(rest).split(" ");
  let score = 0;
  for (const t of terms) {
    const best = Math.max(termScore(nameWords, t) * 2, termScore(restWords, t));
    if (best < 0) return -1;
    score += best;
  }
  return score;
}

export function splitSpecialization(spec: string | null, n = 2): string[] {
  if (!spec) return [];
  return spec
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 1)
    .slice(0, n);
}

const AVATAR_BGS = ["#e2eacb", "#e7dff0", "#f3dfc8", "#dfecef", "#f0dfe2", "#e8e7da"];

export function avatarBg(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return AVATAR_BGS[h % AVATAR_BGS.length];
}

export function initials(name: string): string {
  const parts = name.replace(/^(Dr|Prof|Mr|Mrs|Ms)\.?\s+/i, "").split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}
