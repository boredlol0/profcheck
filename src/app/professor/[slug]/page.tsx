import type { Metadata } from "next";
import { notFound } from "next/navigation";
import styles from "./professor.module.css";
import { getProfessor, getRelated, getReviews, getUserVotes } from "@/lib/directory";
import { createClient } from "@/lib/supabase/server";
import { IconSprite } from "@/components/site/icons";
import { DirectoryFooter, DirectoryHeader } from "@/components/site/DirectoryChrome";
import { ProfileView } from "@/components/site/ProfileView";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const prof = await getProfessor(slug);
  if (!prof) return { title: "Professor not found — ProfCheck" };
  const title = `${prof.name} — ProfCheck`;
  const description =
    prof.ratings_count > 0 && prof.avg_overall != null
      ? `${prof.name}, ${prof.department ?? "SRM"} (${prof.campus}) — rated ${Number(prof.avg_overall).toFixed(1)}/5 across clarity, approachability, grading, and engagement by verified SRM students.`
      : `${prof.name}, ${prof.department ?? "SRM"} (${prof.campus}) — no ratings yet. Be the first verified SRM student to review on ProfCheck.`;
  return {
    title,
    description,
    alternates: { canonical: `/professor/${slug}` },
    openGraph: {
      title,
      description,
      url: `/professor/${slug}`,
      images: [{ url: "/og.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: ["/og.png"],
    },
  };
}

export default async function ProfessorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const prof = await getProfessor(slug);
  if (!prof) notFound();
  const [related, reviews] = await Promise.all([
    getRelated(slug, prof.department, 3),
    getReviews(slug),
  ]);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const voted = user
    ? await getUserVotes(
        reviews.map((r) => r.id),
        user.id
      )
    : new Set<string>();

  return (
    <div className={styles.page}>
      <IconSprite />
      <a className={`${styles["sr-only"]} ${styles.skip}`} href="#main">
        Skip to professor profile
      </a>
      <DirectoryHeader active="none" cta={{ label: "Rate this prof", href: "#reviews" }} />

      <main id="main">
        <ProfileView
          prof={prof}
          related={related}
          reviews={reviews}
          initialVoted={[...voted]}
          isLoggedIn={!!user}
        />
      </main>

      <DirectoryFooter
        extra={<a href="/#our-promise">Our promise</a>}
      />
    </div>
  );
}
