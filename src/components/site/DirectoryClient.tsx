"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "../../app/professors/professors.module.css";
import { Icon } from "./icons";
import { avatarBg, initials, rankMatch, splitSpecialization, type ProfessorRow } from "@/lib/professor";

export function ProfPhoto({ p, className }: { p: ProfessorRow; className?: string }) {
  
  
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        background: avatarBg(p.srm_slug),
        display: "grid",
        placeItems: "center",
        fontWeight: 800,
        fontSize: 20,
        color: "#4d5a40",
        fontFamily: "var(--display)",
      }}
    >
      {initials(p.name)}
    </div>
  );
}

const QUALITIES = ["✦ Makes it click", "✦ Above & beyond", "✦ Keeps it practical"];

type SortKey = "recommended" | "rating" | "name";

const PAGE_SIZE = 50;

export function DirectoryClient({
  professors,
  departments,
  campuses,
  initialQuery,
}: {
  professors: ProfessorRow[];
  departments: { name: string; count: number }[];
  campuses: string[];
  initialQuery: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [dept, setDept] = useState("all");
  const [campus, setCampus] = useState("all");
  const [minimum, setMinimum] = useState(0);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        event.key === "/" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !/INPUT|TEXTAREA|SELECT/.test(target.tagName) &&
        !target.isContentEditable
      ) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const list = useMemo(() => {
    const q = query.trim();
    const scored = professors
      .map((p) => ({
        p,
        score: rankMatch(
          p.name,
          `${p.department ?? ""} ${p.campus} ${(p.courses_taught ?? []).join(" ")} ${p.specialization ?? ""}`,
          q
        ),
      }))
      .filter(
        (r) =>
          r.score >= 0 &&
          (dept === "all" || (r.p.department ?? "Other") === dept) &&
          (campus === "all" || r.p.campus === campus) &&
          (r.p.avg_overall ?? 0) >= minimum
      );
    scored.sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name));
    const results = scored.map((r) => r.p);
    if (sort === "rating")
      results.sort((a, b) => (b.avg_overall ?? -1) - (a.avg_overall ?? -1));
    if (sort === "name") results.sort((a, b) => a.name.localeCompare(b.name));
    return results;
  }, [professors, query, dept, campus, minimum, sort]);

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = list.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const goToPage = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
    scrollToDirectory();
  };

  const pageNumbers = useMemo(() => {
    const pages = new Set([1, totalPages, safePage - 1, safePage, safePage + 1]);
    return [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  }, [safePage, totalPages]);

  const reset = () => {
    setQuery("");
    setDept("all");
    setCampus("all");
    setMinimum(0);
    setSort("recommended");
    setPage(1);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setPage(1);
  }, [query, dept, campus, minimum, sort]);

  const scrollToDirectory = () => {
    document.getElementById("directory")?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  return (
    <>
      <div className={`${styles.wrap} ${styles["search-region"]}`}>
        <form
          className={styles["main-search"]}
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            scrollToDirectory();
          }}
        >
          <Icon id="search" className={styles.icon} />
          <label className={styles["sr-only"]} htmlFor="search-input">
            Search professors, departments, or subjects
          </label>
          <input
            id="search-input"
            ref={searchRef}
            type="search"
            placeholder="A name, department, or subject..."
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className={styles["search-shortcut"]} aria-hidden="true">/</span>
          <button type="submit">Find my prof</button>
        </form>
        <div className={styles["campus-select"]}>
          <Icon id="pin" className={styles.icon} />
          <label className={styles["sr-only"]} htmlFor="campus-filter">
            Filter by campus
          </label>
          <select id="campus-filter" value={campus} onChange={(e) => setCampus(e.target.value)}>
            <option value="all">All SRM campuses</option>
            {campuses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <button
          className={styles["mobile-filter-toggle"]}
          aria-expanded={sidebarOpen}
          aria-controls="filter-sidebar"
          onClick={() => setSidebarOpen((o) => !o)}
        >
          <Icon id="filter" className={styles.icon} /> Filters
        </button>
      </div>

      <div className={`${styles.wrap} ${styles["directory-layout"]}`} id="directory">
        <aside
          className={`${styles.sidebar}${sidebarOpen ? ` ${styles.open}` : ""}`}
          id="filter-sidebar"
          aria-label="Directory filters"
        >
          <div className={styles["sidebar-heading"]}>
            <h2>Make it your own</h2>
            <button className={styles["reset-button"]} onClick={reset}>
              Reset all
            </button>
          </div>
          <div className={styles["filter-section"]}>
            <span className={styles["filter-label"]}>Department</span>
            <div className={styles["department-list"]} role="group" aria-label="Filter by department">
              <button
                className={`${styles["department-button"]}${dept === "all" ? ` ${styles.active}` : ""}`}
                aria-pressed={dept === "all"}
                onClick={() => setDept("all")}
              >
                <span>All departments</span>
                <span>{professors.length}</span>
              </button>
              {departments.map((d) => (
                <button
                  key={d.name}
                  className={`${styles["department-button"]}${dept === d.name ? ` ${styles.active}` : ""}`}
                  aria-pressed={dept === d.name}
                  onClick={() => setDept(d.name)}
                >
                  <span>{d.name.replace(/^Department of /i, "")}</span>
                  <span>{d.count}</span>
                </button>
              ))}
            </div>
          </div>
          <fieldset className={styles["filter-section"]}>
            <legend className={styles["filter-label"]}>Overall rating</legend>
            <label className={styles["radio-option"]}>
              <input type="radio" name="minimum-rating" checked={minimum === 0} onChange={() => setMinimum(0)} /> All
              ratings
            </label>
            <label className={styles["radio-option"]}>
              <input type="radio" name="minimum-rating" checked={minimum === 4.5} onChange={() => setMinimum(4.5)} />{" "}
              4.5 and above <span style={{ color: "#9eac8b" }}>✦</span>
            </label>
            <label className={styles["radio-option"]}>
              <input type="radio" name="minimum-rating" checked={minimum === 4} onChange={() => setMinimum(4)} /> 4.0
              and above
            </label>
          </fieldset>
          <div className={styles["sidebar-note"]}>
            <Icon id="heart" className={styles.icon} />
            <h3>
              A rating is a start.<br />
              Not the <span className={styles.serif}>whole story.</span>
            </h3>
            <p>
              Read a few perspectives. Look for what matters to you. Every classroom experience is a little
              different.
            </p>
          </div>
        </aside>

        <section aria-label="Professor results">
          <div className={styles["directory-banner"]}>
            <div>
              <div className={styles.eyebrow}>From one student to another</div>
              <h2>
                Good advice <span className={styles.serif}>travels.</span>
              </h2>
              <p>
                {professors.length.toLocaleString("en-IN")} professors synced from the SRM directory. Find yours.
              </p>
            </div>
            <div className={styles["banner-art"]} aria-hidden="true">
              <div className={styles["paper-card"]}>
                <div className={styles.stars}>★★★★★</div>
                <div className={styles["paper-line"]}></div>
                <div className={styles["paper-line"]}></div>
                <div className={styles["paper-line"]}></div>
              </div>
              <svg className={styles.spark}>
                <use href="#spark" />
              </svg>
              <Icon id="check" className={styles.icon} />
            </div>
          </div>

          <div className={styles["results-toolbar"]}>
            <p className={styles["results-count"]} role="status" aria-live="polite">
              <strong>
                {list.length} {list.length === 1 ? "professor" : "professors"}
              </strong>{" "}
              to get to know
            </p>
            <div className={styles["toolbar-actions"]}>
              <div className={styles["sort-wrap"]}>
                <label htmlFor="sort-select">Sort by</label>
                <select
                  id="sort-select"
                  aria-label="Sort professors"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                >
                  <option value="recommended">Featured</option>
                  <option value="rating">Highest rated</option>
                  <option value="name">Name: A–Z</option>
                </select>
              </div>
              <div className={styles["view-toggle"]} role="group" aria-label="Display style">
                <button
                  className={view === "grid" ? styles.active : undefined}
                  aria-label="Grid view"
                  aria-pressed={view === "grid"}
                  onClick={() => setView("grid")}
                >
                  <Icon id="grid" className={styles.icon} />
                </button>
                <button
                  className={view === "list" ? styles.active : undefined}
                  aria-label="List view"
                  aria-pressed={view === "list"}
                  onClick={() => setView("list")}
                >
                  <Icon id="list" className={styles.icon} />
                </button>
              </div>
            </div>
          </div>

          {query.trim() && (
            <div className={styles["active-search"]}>
              <span>Looking for</span>
              <button aria-label="Clear search" onClick={() => setQuery("")}>
                <span>{query.trim()}</span>
                <Icon id="close" className={styles.icon} />
              </button>
            </div>
          )}

            {list.length > 0 ? (
              <div className={`${styles["professor-grid"]}${view === "list" ? ` ${styles.list}` : ""}`}>
                {visible.map((p, i) => {
                const tags =
                  splitSpecialization(p.specialization, 2).length > 0
                    ? splitSpecialization(p.specialization, 2)
                    : (p.courses_taught ?? []).slice(0, 2);
                return (
                  <article
                    className={styles["professor-card"]}
                    key={p.srm_slug}
                    style={{
                      animationDelay: `${Math.min(i, 20) * 35}ms`,
                      // @ts-expect-error CSS custom properties for the quality badge
                      "--tag-bg": "#eff5e6",
                      "--tag-color": "#789354",
                      "--tag-line": "#e1eacd",
                    }}
                  >
                    <div className={styles["card-body"]}>
                      <div className={styles["card-top"]}>
                        <ProfPhoto p={p} className={styles.avatar} />
                        <span className={styles.quality}>{QUALITIES[i % QUALITIES.length]}</span>
                      </div>
                      <h3>
                        <a href={`/professor/${p.srm_slug}`}>{p.name}</a>
                      </h3>
                      <p className={styles.department}>{p.department ?? "SRM Kattankulathur"}</p>
                      <div className={styles["rating-line"]}>
                        <strong>{p.avg_overall != null ? p.avg_overall.toFixed(1) : "–"}</strong>
                        <div>
                          <div className={styles.stars} aria-hidden="true">
                            ★★★★★
                          </div>
                          <small>
                            {p.ratings_count > 0
                              ? `Overall rating / 5 · ${p.ratings_count} reviews`
                              : "No ratings yet — be the first"}
                          </small>
                        </div>
                      </div>
                      {tags.length > 0 && (
                        <div className={styles["card-tags"]}>
                          {tags.map((t) => (
                            <span key={t}>{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={styles["card-footer"]}>
                      <span className={styles["card-campus"]}>
                        <Icon id="pin" className={styles.icon} />
                        {p.campus.replace(" - Chennai", "")}
                      </span>
                      <span className={styles["profile-link"]} aria-hidden="true">
                        Meet this prof <Icon id="arrow-up" className={styles.icon} />
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles["empty-state"]}>
              <Icon id="search" className={styles.icon} />
              <h3>
                No matches. <span className={styles.serif}>Fresh start?</span>
              </h3>
              <p>Try a different name or subject, or loosen your filters to explore the directory.</p>
              <button className={`${styles.button} ${styles["button-dark"]}`} onClick={reset}>
                Reset the filters <Icon id="arrow" className={styles.icon} />
              </button>
            </div>
          )}

            <div className={styles["directory-bottom"]}>
              <p>
                {list.length
                  ? `Showing ${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, list.length)} of ${list.length.toLocaleString("en-IN")} professors.`
                  : "No professors match these filters."}
              </p>
              <span>
                <Icon id="check" className={styles.icon} /> A little more prepared.
              </span>
            </div>
            {totalPages > 1 && (
              <nav className={styles.pagination} aria-label="Directory pages">
                <button
                  className={styles["page-btn"]}
                  disabled={safePage <= 1}
                  onClick={() => goToPage(safePage - 1)}
                  aria-label="Previous page"
                >
                  ← Prev
                </button>
                {pageNumbers.map((p, idx, arr) => (
                  <span key={p} style={{ display: "contents" }}>
                    {idx > 0 && p - arr[idx - 1] > 1 && (
                      <span className={styles["page-gap"]} aria-hidden="true">
                        …
                      </span>
                    )}
                    <button
                      className={`${styles["page-btn"]}${p === safePage ? ` ${styles.active}` : ""}`}
                      aria-current={p === safePage ? "page" : undefined}
                      onClick={() => goToPage(p)}
                    >
                      {p}
                    </button>
                  </span>
                ))}
                <button
                  className={styles["page-btn"]}
                  disabled={safePage >= totalPages}
                  onClick={() => goToPage(safePage + 1)}
                  aria-label="Next page"
                >
                  Next →
                </button>
              </nav>
            )}
          <p className={styles["sync-disclosure"]}>
            <Icon id="info" className={styles.icon} />
            Directory synced from SRM’s public faculty listings. Ratings and reviews come from students.
          </p>
        </section>
      </div>

      <section className={`${styles.wrap} ${styles["bottom-callout"]}`} aria-labelledby="callout-title">
        <div>
          <div className={styles.eyebrow}>For the next person in your seat</div>
          <h2 id="callout-title">
            Been there? <span className={styles.serif}>Pass it on.</span>
          </h2>
          <p>Open a professor’s profile and try sharing a little classroom wisdom.</p>
        </div>
        <a className={styles.button} href="#directory">
          Find a professor to rate <Icon id="arrow-up" className={styles.icon} />
        </a>
      </section>
    </>
  );
}
