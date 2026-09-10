import styles from "./professors.module.css";
import { getProfessors } from "@/lib/directory";
import { IconSprite, Icon } from "@/components/site/icons";
import { DirectoryFooter, DirectoryHeader } from "@/components/site/DirectoryChrome";
import { DirectoryClient } from "@/components/site/DirectoryClient";

export const dynamic = "force-dynamic";

export default async function ProfessorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const professors = await getProfessors();
  const { q } = await searchParams;

  const deptMap = new Map<string, number>();
  const campusSet = new Set<string>();
  for (const p of professors) {
    const key = p.department ?? "Other";
    deptMap.set(key, (deptMap.get(key) ?? 0) + 1);
    campusSet.add(p.campus);
  }
  const departments = [...deptMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
  const campuses = [...campusSet].sort();

  return (
    <div className={styles.page}>
      <IconSprite />
      <a className={`${styles["sr-only"]} ${styles.skip}`} href="#main">
        Skip to directory
      </a>
      <DirectoryHeader active="directory" cta={{ label: "Find your prof", href: "#directory" }} />

      <main id="main">
        <section className={`${styles.wrap} ${styles.intro}`} aria-labelledby="page-title">
          <div className={styles.breadcrumbs}>
            <a href="/">Home</a>
            <Icon id="chevron" className={styles.icon} />
            <span>Faculty directory</span>
          </div>
          <div className={styles["intro-heading"]}>
            <div>
              <div className={styles.eyebrow}>A little clarity before class</div>
              <h1 id="page-title">
                Find your kind of <span className={styles.serif}>professor.</span>
              </h1>
              <p>
                Different classrooms. Different teaching styles.
                <br />
                Find the perspective that helps you walk in prepared.
              </p>
            </div>
            <div className={styles["intro-stamp"]} aria-hidden="true">
              <svg>
                <use href="#spark" />
              </svg>
              <span>
                CAMPUS WISDOM
                <br />
                STARTS HERE
              </span>
            </div>
          </div>
        </section>

        <DirectoryClient
          professors={professors}
          departments={departments}
          campuses={campuses}
          initialQuery={q ?? ""}
        />
      </main>

      <DirectoryFooter extra={<a href="/#our-promise">Our promise</a>} />
    </div>
  );
}
