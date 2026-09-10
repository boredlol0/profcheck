import { createClient } from "@/lib/supabase/server";
import { num, type ProfessorRow, type ReviewRow } from "@/lib/professor";

export type { ProfessorRow, ReviewRow };

function normalizeProfessor<R extends Record<string, unknown>>(row: R): R {
  return {
    ...row,
    avg_overall: num(row.avg_overall as number | string | null),
    avg_difficulty: num(row.avg_difficulty as number | string | null),
    avg_clarity: num(row.avg_clarity as number | string | null),
    avg_approachability: num(row.avg_approachability as number | string | null),
    avg_grading: num(row.avg_grading as number | string | null),
    avg_engagement: num(row.avg_engagement as number | string | null),
  };
}

const COLS =
  "srm_slug,name,department,college,campus,photo_url,profile_url,specialization,courses_taught,avg_overall,avg_difficulty,avg_clarity,avg_approachability,avg_grading,avg_engagement,ratings_count";

export async function getProfessors(): Promise<ProfessorRow[]> {
  const supabase = await createClient();
  // PostgREST caps a single response at 1000 rows — page through the whole table.
  const BATCH = 1000;
  const all: ProfessorRow[] = [];
  for (let from = 0; ; from += BATCH) {
    const { data, error } = await supabase
      .from("professors")
      .select(COLS)
      .eq("is_active", true)
      .order("name")
      .range(from, from + BATCH - 1);
    if (error) throw error;
    all.push(...((data ?? []) as ProfessorRow[]));
    if (!data || data.length < BATCH) break;
  }
  return all.map(normalizeProfessor);
}

export async function getProfessor(slug: string): Promise<ProfessorRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professors")
    .select(COLS)
    .eq("srm_slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizeProfessor(data as ProfessorRow & Record<string, unknown>) : null;
}

export async function getRelated(
  slug: string,
  department: string | null,
  limit = 3
): Promise<ProfessorRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("professors")
    .select("srm_slug,name,department")
    .eq("is_active", true)
    .neq("srm_slug", slug)
    .limit(limit);
  if (department) query = query.eq("department", department);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ProfessorRow[];
}

export { splitSpecialization } from "@/lib/professor";

export async function getReviews(professorSlug: string): Promise<ReviewRow[]> {
  const supabase = await createClient();
  const { data: prof } = await supabase
    .from("professors")
    .select("id")
    .eq("srm_slug", professorSlug)
    .maybeSingle();
  if (!prof) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id,clarity,approachability,grading,engagement,overall,course,body,helpful_count,created_at"
    )
    .eq("professor_id", (prof as { id: string }).id)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as ReviewRow[]).map((r) => ({
    ...r,
    clarity: Number(r.clarity),
    approachability: Number(r.approachability),
    grading: Number(r.grading),
    engagement: Number(r.engagement),
    overall: Number(r.overall),
    helpful_count: Number(r.helpful_count),
  }));
}

export async function getUserVotes(reviewIds: string[], userId: string): Promise<Set<string>> {
  if (!reviewIds.length) return new Set();
  const supabase = await createClient();
  const { data } = await supabase
    .from("helpful_votes")
    .select("review_id")
    .in("review_id", reviewIds)
    .eq("voter_hash", userId);
  return new Set((data ?? []).map((r) => r.review_id));
}

export type Spotlight = {
  prof: ProfessorRow | null;
  review: { body: string; course: string; professor_name: string } | null;
};

export async function getSpotlight(): Promise<Spotlight> {
  const supabase = await createClient();
  const { data: top } = await supabase
    .from("professors")
    .select(COLS)
    .eq("is_active", true)
    .gt("ratings_count", 0)
    .order("avg_overall", { ascending: false })
    .order("ratings_count", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { data: latest } = await supabase
    .from("reviews")
    .select("body,course,professors!inner(name)")
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const review = latest as unknown as {
    body: string;
    course: string;
    professors: { name: string };
  } | null;
  return {
    prof: top ? normalizeProfessor(top as ProfessorRow & Record<string, unknown>) : null,
    review: review
      ? { body: review.body, course: review.course, professor_name: review.professors.name }
      : null,
  };
}
