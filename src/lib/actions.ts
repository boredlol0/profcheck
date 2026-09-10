"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const CATEGORIES = ["clarity", "approachability", "grading", "engagement"] as const;
type Category = (typeof CATEGORIES)[number];

export type ReviewInput = {
  slug: string;
  scores: Record<Category, number>;
  course: string;
  body: string;
};

export async function submitReview(
  input: ReviewInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in with your SRM email first." };

  for (const c of CATEGORIES) {
    const v = input.scores[c];
    if (!Number.isInteger(v) || v < 1 || v > 5) {
      return { ok: false, error: `Rate “${c}” with 1–5 stars.` };
    }
  }
  const course = input.course.trim().slice(0, 120);
  const body = input.body.trim().slice(0, 600);
  if (!course) return { ok: false, error: "Choose a course (or Other)." };
  if (!body) return { ok: false, error: "Write a line or two for the next batch." };

  const { data: prof, error: profError } = await supabase
    .from("professors")
    .select("id")
    .eq("srm_slug", input.slug)
    .eq("is_active", true)
    .single();
  if (profError || !prof) return { ok: false, error: "Professor not found." };

  const { error } = await supabase.from("reviews").upsert(
    {
      professor_id: prof.id,
      author_hash: user.id,
      clarity: input.scores.clarity,
      approachability: input.scores.approachability,
      grading: input.scores.grading,
      engagement: input.scores.engagement,
      course,
      body,
      is_hidden: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "professor_id,author_hash" }
  );
  if (error) return { ok: false, error: "Couldn’t save your review. Try again." };

  revalidatePath(`/professor/${input.slug}`);
  revalidatePath("/professors");
  return { ok: true };
}

export async function toggleHelpful(
  reviewId: string
): Promise<{ ok: true; voted: boolean; count: number } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to mark reviews helpful." };

  const { data: existing } = await supabase
    .from("helpful_votes")
    .select("review_id")
    .eq("review_id", reviewId)
    .eq("voter_hash", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("helpful_votes")
      .delete()
      .eq("review_id", reviewId)
      .eq("voter_hash", user.id);
  } else {
    const { error } = await supabase
      .from("helpful_votes")
      .insert({ review_id: reviewId, voter_hash: user.id });
    if (error) return { ok: false, error: "Couldn’t save your vote." };
  }

  const { data: review } = await supabase
    .from("reviews")
    .select("helpful_count, professor_id, professors!inner(srm_slug)")
    .eq("id", reviewId)
    .single();

  const slug = (
    review as unknown as { professors: { srm_slug: string } } | null
  )?.professors?.srm_slug;
  if (slug) revalidatePath(`/professor/${slug}`);

  return {
    ok: true,
    voted: !existing,
    count: (review as unknown as { helpful_count: number } | null)?.helpful_count ?? 0,
  };
}
