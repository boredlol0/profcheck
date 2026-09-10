"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../app/professor/[slug]/professor.module.css";
import { Icon } from "./icons";
import {
  splitSpecialization,
  type ProfessorRow,
  type ReviewRow,
} from "@/lib/professor";
import { submitReview, toggleHelpful } from "@/lib/actions";
import { ProfPhoto } from "./DirectoryClient";

const SCORE_LABELS = ["Teaching clarity", "Approachability", "Fair grading", "Engagement"];
const RATING_WORDS = ["poor", "fair", "good", "very good", "excellent"];

const CATEGORIES = SCORE_LABELS;

function useDialog(openSignal: number) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (openSignal > 0 && !dialog.open) {
      dialog.showModal();
      document.body.classList.add("modal-open");
    }
    const onClose = () => {
      if (!document.querySelector("dialog[open]")) {
        document.body.classList.remove("modal-open");
      }
    };
    const onBackdrop = (event: MouseEvent) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        dialog.close();
      }
    };
    dialog.addEventListener("close", onClose);
    dialog.addEventListener("click", onBackdrop as EventListener);
    return () => {
      dialog.removeEventListener("close", onClose);
      dialog.removeEventListener("click", onBackdrop as EventListener);
    };
  }, [openSignal]);
  return ref;
}

function StarRow({
  label,
  value,
  onPick,
}: {
  label: string;
  value: number;
  onPick: (n: number) => void;
}) {
  return (
    <fieldset className={styles["rating-field"]}>
      <legend>{label}</legend>
      <div className={styles["star-options"]}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            className={`${styles["star-option"]}${n <= value ? ` ${styles.filled}` : ""}`}
          >
            <input
              type="radio"
              name={`rating-${label}`}
              value={n}
              checked={value === n}
              aria-label={`${label}: ${n} out of 5, ${RATING_WORDS[n - 1]}`}
              onChange={() => onPick(n)}
            />
            <span aria-hidden="true">★</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function RatingDialog({ prof, signal }: { prof: ProfessorRow; signal: number }) {
  const router = useRouter();
  const ref = useDialog(signal);
  const [course, setCourse] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [review, setReview] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const overall =
    CATEGORIES.every((c) => scores[c] > 0)
      ? CATEGORIES.reduce((sum, c) => sum + scores[c], 0) / CATEGORIES.length
      : null;

  useEffect(() => {
    if (signal > 0) {
      setCourse("");
      setScores({});
      setReview("");
      setError(null);
      setDone(false);
    }
  }, [signal]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const missing = CATEGORIES.find((c) => !scores[c]);
    if (missing) {
      setError(`Rate “${missing}” too.`);
      return;
    }
    if (!course) {
      setError("Choose a course (or Other).");
      return;
    }
    if (!review.trim()) {
      setError("Write a line or two for the next batch.");
      return;
    }
    setError(null);
    submitReview({
      slug: prof.srm_slug,
      scores: {
        clarity: scores["Teaching clarity"],
        approachability: scores["Approachability"],
        grading: scores["Fair grading"],
        engagement: scores["Engagement"],
      },
      course,
      body: review.trim(),
    }).then((res) => {
      if (!res.ok) {
        setError(res.error.toUpperCase());
        return;
      }
      setDone(true);
      router.refresh();
    });
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby="rating-title"
      style={{ width: "min(640px, calc(100% - 32px))" }}
    >
      <div className={styles["dialog-header"]}>
        <span className={styles.eyebrow}>A little student-to-student wisdom</span>
        <button
          className={styles["dialog-close"]}
          aria-label="Close review form"
          onClick={() => ref.current?.close()}
        >
          <Icon id="close" className={styles.icon} />
        </button>
      </div>
      {!done ? (
        <div>
          <h2 id="rating-title">
            Tell it <span className={styles.serif}>thoughtfully.</span>
          </h2>
          <p className={styles["dialog-description"]}>
            Specific experiences help. Personal details don’t. Verified SRM-only.
          </p>
          <div className={styles["rating-professor-label"]}>
            <Icon id="cap" className={styles.icon} />
            <span>{prof.name}</span>
          </div>
          <form onSubmit={submit} noValidate>
            {CATEGORIES.map((c) => (
              <StarRow
                key={c}
                label={c}
                value={scores[c] ?? 0}
                onPick={(n) => {
                  setScores((s) => ({ ...s, [c]: n }));
                  setError(null);
                }}
              />
            ))}
            <p className={styles["dialog-description"]} aria-live="polite" style={{ marginTop: -8 }}>
              {overall != null
                ? `Overall ${overall.toFixed(1)} / 5 — averaged from your four ratings.`
                : "Rate all four — your overall is their average."}
            </p>
            <div className={styles.field}>
              <label htmlFor="review-course">Which course?</label>
              <select
                id="review-course"
                value={course}
                required
                onChange={(e) => {
                  setCourse(e.target.value);
                  setError(null);
                }}
              >
                <option value="" disabled>
                  Select a course
                </option>
                {(prof.courses_taught ?? []).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="review-text">What should a future student know?</label>
              <textarea
                id="review-text"
                required
                maxLength={600}
                placeholder="Think teaching style, feedback, workload, or how to prepare for class..."
                aria-describedby="review-help review-character-count"
                value={review}
                onChange={(e) => {
                  setReview(e.target.value);
                  setError(null);
                }}
              />
              <small id="review-help">
                Up to 600 characters. Leave out student names, contact details, IDs, and identifying
                anecdotes.
              </small>
              <small id="review-character-count">{review.length} / 600 characters</small>
            </div>
            {error && (
              <p className={styles["dialog-description"]} role="alert" style={{ color: "#a4442f" }}>
                {error}
              </p>
            )}
            <label className={styles["check-field"]}>
              <input type="checkbox" required />
              <span>I’ve kept this constructive and free of personal or identifying details.</span>
            </label>
            <button className={`${styles.button} ${styles["button-dark"]} ${styles.full}`} type="submit">
              Submit anonymously <Icon id="arrow" className={styles.icon} />
            </button>
            <p className={styles["form-disclaimer"]}>
              SRM email verification keeps outsiders out. Your name never appears.
            </p>
          </form>
        </div>
      ) : (
        <div className={styles.success}>
          <div className={styles["success-badge"]}>
            <Icon id="check" className={styles.icon} />
          </div>
          <h2>
            That’s the <span className={styles.serif}>spirit.</span>
          </h2>
          <p>Your take is in. Some junior, registration week, will thank you silently.</p>
          <button
            className={`${styles.button} ${styles["button-dark"]}`}
            onClick={() => ref.current?.close()}
          >
            Back to the classroom <Icon id="arrow" className={styles.icon} />
          </button>
        </div>
      )}
    </dialog>
  );
}

function ShareDialog({ prof, signal }: { prof: ProfessorRow; signal: number }) {
  const ref = useDialog(signal);
  const [status, setStatus] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (signal > 0) {
      setUrl(window.location.href.split("#")[0]);
      setStatus("");
    }
  }, [signal]);

  const copy = async () => {
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error("unavailable");
      await navigator.clipboard.writeText(url);
      setStatus("Link copied. A little perspective, ready to travel.");
    } catch {
      setStatus("Copy unavailable here — long-press the link to copy it manually.");
    }
  };

  return (
    <dialog ref={ref} aria-labelledby="share-title">
      <div className={styles["dialog-header"]}>
        <span className={styles.eyebrow}>Good advice travels</span>
        <button
          className={styles["dialog-close"]}
          aria-label="Close share dialog"
          onClick={() => ref.current?.close()}
        >
          <Icon id="close" className={styles.icon} />
        </button>
      </div>
      <h2 id="share-title">
        Pass the <span className={styles.serif}>perspective.</span>
      </h2>
      <p className={styles["dialog-description"]}>Copy the link to {prof.name}’s profile.</p>
      <div className={styles["share-link"]}>
        <label className={styles["sr-only"]} htmlFor="share-url">
          Profile URL
        </label>
        <input id="share-url" type="text" readOnly value={url} onFocus={(e) => e.target.select()} />
        <button className={`${styles.button} ${styles["button-dark"]}`} onClick={copy}>
          Copy link
        </button>
      </div>
      <p id="share-status" role="status" aria-live="polite">
        {status}
      </p>
    </dialog>
  );
}

export function ProfileView({
  prof,
  related,
  reviews,
  initialVoted,
  isLoggedIn,
}: {
  prof: ProfessorRow;
  related: ProfessorRow[];
  reviews: ReviewRow[];
  initialVoted: string[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [ratingSignal, setRatingSignal] = useState(0);
  const [shareSignal, setShareSignal] = useState(0);
  const [activeSection, setActiveSection] = useState("overview");
  const [reviewFilter, setReviewFilter] = useState("all");
  const [reviewSort, setReviewSort] = useState("recent");
  const [voted, setVoted] = useState<Set<string>>(() => new Set(initialVoted));
  const [counts, setCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(reviews.map((r) => [r.id, r.helpful_count]))
  );

  useEffect(() => {
    let pending = false;
    const update = () => {
      const offset = matchMedia("(max-width:620px)").matches ? 160 : 190;
      let current = "overview";
      ["overview", "reviews", "courses"].forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= offset) current = id;
      });
      setActiveSection(current);
      pending = false;
    };
    const onScroll = () => {
      if (!pending) {
        pending = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const requireLogin = () => {
    router.push(`/login?next=/professor/${prof.srm_slug}`);
  };

  const openRating = () => {
    if (!isLoggedIn) {
      requireLogin();
      return;
    }
    setRatingSignal((n) => n + 1);
  };

  const onHelpful = (id: string) => {
    if (!isLoggedIn) {
      requireLogin();
      return;
    }
    toggleHelpful(id).then((res) => {
      if (!res.ok) return;
      setVoted((prev) => {
        const next = new Set(prev);
        if (res.voted) next.add(id);
        else next.delete(id);
        return next;
      });
      setCounts((prev) => ({ ...prev, [id]: res.count }));
    });
  };

  const vibe = splitSpecialization(prof.specialization, 4);
  const courses = prof.courses_taught ?? [];
  const rated = prof.ratings_count > 0 && prof.avg_overall != null;
  const avgByLabel: Record<string, number | null> = {
    "Teaching clarity": prof.avg_clarity,
    Approachability: prof.avg_approachability,
    "Fair grading": prof.avg_grading,
    Engagement: prof.avg_engagement,
  };

  const visibleReviews = reviews
    .filter((r) =>
      reviewFilter === "all"
        ? true
        : reviewFilter === "4.5"
          ? r.overall >= 4.5
          : r.overall >= 4.0
    )
    .sort((a, b) =>
      reviewSort === "rating"
        ? b.overall - a.overall || b.created_at.localeCompare(a.created_at)
        : b.created_at.localeCompare(a.created_at)
    );

  return (
    <>
      <div className={styles.wrap}>
        <div className={styles.topbar}>
          <div className={styles.breadcrumbs}>
            <a href="/">Home</a>
            <Icon id="chevron" className={styles.icon} />
            <a href="/professors">Professors</a>
            <Icon id="chevron" className={styles.icon} />
            <span>{prof.name.replace(/^Dr\.?\s+/i, "")}</span>
          </div>
          <span className={styles["source-chip"]}>
            <Icon id="info" className={styles.icon} /> SRM directory
          </span>
        </div>

        <section className={styles["profile-hero"]} aria-labelledby="professor-name">
          <div className={styles["hero-pattern"]}></div>
          <div className={styles["hero-main"]}>
            <div className={styles.person}>
              <div className={styles["hero-avatar-wrap"]}>
                <div className={styles["hero-avatar"]}>
                  <ProfPhoto p={prof} />
                </div>
                <span className={styles["avatar-spark"]} aria-hidden="true">
                  <svg>
                    <use href="#spark" />
                  </svg>
                </span>
              </div>
              <div>
                <div className={styles.eyebrow}>{prof.department ?? prof.campus}</div>
                <h1 id="professor-name">{prof.name}</h1>
                <p className={styles["person-department"]}>
                  {prof.department ?? "SRM Institute of Science and Technology"}
                </p>
                <div className={styles["person-meta"]}>
                  <span>
                    <Icon id="pin" className={styles.icon} />
                    {prof.campus}
                  </span>
                  <span>
                    <Icon id="cap" className={styles.icon} />
                    {prof.college ?? "SRM Kattankulathur"}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles["hero-actions"]}>
              <button className={`${styles.button} ${styles["button-dark"]}`} onClick={openRating}>
                Share your experience <Icon id="arrow-up" className={styles.icon} />
              </button>
              <button
                className={styles["icon-button"]}
                aria-label="Share professor profile"
                onClick={() => setShareSignal((n) => n + 1)}
              >
                <Icon id="share" className={styles.icon} />
              </button>
            </div>
          </div>
          <div className={styles["hero-bottom"]}>
            <p>“{prof.specialization ?? `Teaching at ${prof.department ?? "SRM"}.`}”</p>
            <span>
              <Icon id="book" className={styles.icon} /> A little context for your next class.
            </span>
          </div>
        </section>
      </div>

      <div className={styles["section-nav"]}>
        <div className={`${styles.wrap} ${styles["section-nav-inner"]}`}>
          <nav className={styles.tabs} aria-label="Profile sections">
            {[
              ["overview", "The overview", null],
              ["reviews", "Student voices", String(prof.ratings_count)],
              ["courses", "The courses", null],
            ].map(([id, label, count]) => (
              <a
                key={id}
                href={`#${id}`}
                className={activeSection === id ? styles.active : undefined}
                aria-current={activeSection === id ? "location" : undefined}
              >
                {label} {count != null && <span>{count}</span>}
              </a>
            ))}
          </nav>
          <span className={styles["section-nav-note"]}>
            <Icon id="info" className={styles.icon} /> Synced from SRM’s directory
          </span>
        </div>
      </div>

      <div className={`${styles.wrap} ${styles["profile-layout"]}`}>
        <div className={styles["content-column"]}>
          <section className={styles.overview} id="overview" aria-labelledby="overview-title">
            <div className={styles["section-heading"]}>
              <h2 id="overview-title">
                The classroom <span className={styles.serif}>at a glance.</span>
              </h2>
              <span className={styles.eyebrow}>Beyond the number</span>
            </div>
            <p className={styles["section-description"]}>
              A quick feel for the teaching. A starting point for your own perspective.
            </p>

            <div className={styles["rating-overview"]}>
              <div className={styles["overall-score"]}>
                <span className={styles.eyebrow}>Overall experience</span>
                <div className={styles["score-number"]}>
                  {rated ? prof.avg_overall!.toFixed(1) : "–"}
                  <small>/ 5</small>
                </div>
                <div className={styles.stars} aria-hidden="true">
                  ★★★★★
                </div>
                <p>
                  {rated ? (
                    <>
                      Based on {prof.ratings_count} student {prof.ratings_count === 1 ? "review" : "reviews"}.
                    </>
                  ) : (
                    <>
                      No ratings yet.
                      <br />
                      Yours could be the first.
                    </>
                  )}
                </p>
              </div>
              <div className={styles["score-details"]}>
                {SCORE_LABELS.map((label) => {
                  const avg = avgByLabel[label];
                  return (
                    <div className={styles["score-row"]} key={label}>
                      <span>{label}</span>
                      <div className={styles.track} aria-hidden="true">
                        <i
                          // @ts-expect-error CSS custom property for the bar fill
                          style={{ "--fill": `${avg != null ? (avg / 5) * 100 : 0}%` }}
                        ></i>
                      </div>
                      <strong>{avg != null ? avg.toFixed(1) : "–"}</strong>
                    </div>
                  );
                })}
              </div>
            </div>
            {vibe.length > 0 && (
              <>
                <h3 className={styles["vibe-heading"]}>The words that come up</h3>
                <div className={styles["vibe-tags"]}>
                  {vibe.map((t) => (
                    <span key={t}>
                      <span aria-hidden="true" style={{ padding: 0, border: 0, background: "none" }}>
                        ✦
                      </span>
                      {t}
                    </span>
                  ))}
                </div>
              </>
            )}
          </section>

          <section className={styles.reviews} id="reviews" aria-labelledby="reviews-title">
            <div className={styles["section-heading"]}>
              <h2 id="reviews-title">
                From the <span className={styles.serif}>classroom.</span>
              </h2>
              <span className={styles["review-count"]}>
                {prof.ratings_count} {prof.ratings_count === 1 ? "perspective" : "perspectives"}
              </span>
            </div>
            <p className={styles["section-description"]}>
              Different seats. Different experiences. Here’s a little of both.
            </p>
            {reviews.length > 0 ? (
              <>
                <div className={styles["review-controls"]}>
                  <div className={styles["review-filters"]} role="group" aria-label="Filter reviews">
                    {[
                      ["all", "All reviews"],
                      ["4.5", "4.5+"],
                      ["4.0", "4.0+"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        className={`${styles["review-filter"]}${reviewFilter === value ? ` ${styles.active}` : ""}`}
                        aria-pressed={reviewFilter === value}
                        onClick={() => setReviewFilter(value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <label className={styles["sr-only"]} htmlFor="review-sort">
                    Sort reviews
                  </label>
                  <select
                    className={styles["review-sort"]}
                    id="review-sort"
                    value={reviewSort}
                    onChange={(e) => setReviewSort(e.target.value)}
                  >
                    <option value="recent">Most recent</option>
                    <option value="rating">Highest rated</option>
                  </select>
                </div>
                <p id="review-status" role="status" aria-live="polite">
                  {reviewFilter === "all"
                    ? ""
                    : `${visibleReviews.length} ${visibleReviews.length === 1 ? "review" : "reviews"} at ${reviewFilter}+ overall.`}
                </p>
                <div>
                  {visibleReviews.map((r, i) => {
                    const marked = voted.has(r.id);
                    return (
                      <article
                        className={styles["review-card"]}
                        key={r.id}
                        style={{ animationDelay: `${Math.min(i, 10) * 35}ms` }}
                      >
                        <div className={styles["review-top"]}>
                          <div className={styles["review-author"]}>
                            <span className={styles["anonymous-avatar"]}>
                              <Icon id="person" className={styles.icon} />
                            </span>
                            <div>
                              <strong>Anonymous student</strong>
                              <small>
                                {r.course} ·{" "}
                                {new Date(r.created_at).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </small>
                            </div>
                          </div>
                          <div className={styles["review-score"]}>
                            <span aria-hidden="true">★</span>
                            <strong aria-label={`${Number(r.overall).toFixed(1)} out of 5`}>
                              {Number(r.overall).toFixed(1)}
                            </strong>
                          </div>
                        </div>
                        <p>{r.body}</p>
                        <div className={styles["review-tags"]}>
                          {(
                            [
                              ["Clarity", r.clarity],
                              ["Approachability", r.approachability],
                              ["Grading", r.grading],
                              ["Engagement", r.engagement],
                            ] as const
                          ).map(([label, v]) => (
                            <span key={label}>
                              {label} {v}
                            </span>
                          ))}
                        </div>
                        <div className={styles["review-footer"]}>
                          <button
                            className={styles["helpful-button"]}
                            aria-pressed={marked}
                            aria-label={marked ? "Undo helpful reaction" : "Mark this review helpful"}
                            onClick={() => onHelpful(r.id)}
                          >
                            <Icon id="thumb" className={styles.icon} />
                            <span>
                              {marked ? "Marked helpful" : "Helpful?"} · {counts[r.id] ?? 0}
                            </span>
                          </button>
                          <span>{counts[r.id] ?? 0} found this helpful</span>
                        </div>
                      </article>
                    );
                  })}
                </div>
                {visibleReviews.length === 0 && (
                  <div className={styles["no-reviews"]}>
                    No reviews match this filter. Try “All reviews”.
                  </div>
                )}
              </>
            ) : (
              <div className={styles["no-reviews"]}>
                No reviews yet for {prof.name.split(" ").slice(-1)}. Been in their class? Leave the
                first take.
                <div style={{ marginTop: 16 }}>
                  <button
                    className={`${styles.button} ${styles["button-dark"]}`}
                    onClick={openRating}
                  >
                    Write the first review <Icon id="arrow" className={styles.icon} />
                  </button>
                </div>
              </div>
            )}
          </section>

          <section id="courses" aria-labelledby="courses-title">
            <div className={styles["section-heading"]}>
              <h2 id="courses-title">
                On the <span className={styles.serif}>timetable.</span>
              </h2>
              <span className={styles.eyebrow}>
                {courses.length} subject{courses.length === 1 ? "" : "s"}
              </span>
            </div>
            <p className={styles["section-description"]}>
              Subjects {prof.name.split(" ").slice(-1)} teaches, via SRM’s directory.
            </p>
            {courses.length > 0 ? (
              <div className={styles["course-list"]}>
                {courses.map((c) => (
                  <article className={styles["course-row"]} key={c}>
                    <div className={styles["course-main"]}>
                      <span className={styles["course-icon"]}>
                        <Icon id="book" className={styles.icon} />
                      </span>
                      <div>
                        <h3>{c}</h3>
                        <p>{prof.department}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles["no-reviews"]}>
                SRM hasn’t listed subjects for this profile yet.
              </div>
            )}
            <p className={styles["courses-note"]}>
              Sourced from SRM’s public directory. Check official SRM sources for actual course
              allocations.
            </p>
          </section>
        </div>

        <aside className={styles["profile-sidebar"]} aria-label="Professor details and contribution">
          <div className={styles["rate-card"]}>
              <svg className={styles.spark} aria-hidden="true">
              <use href="#spark" />
            </svg>
            <div className={styles.eyebrow}>For the next person in your seat</div>
            <h2>
              Your experience.
              <br />
              Their <span className={styles.serif}>head start.</span>
            </h2>
            <p>Been in a class like this? Try leaving a thoughtful take for the student coming after you.</p>
            <button className={`${styles.button} ${styles["button-lime"]}`} onClick={openRating}>
              Rate this professor <Icon id="arrow-up" className={styles.icon} />
            </button>
            <small>
              <Icon id="lock" className={styles.icon} /> Anonymous. SRM email verified.
            </small>
          </div>

          <div className={styles["glance-card"]}>
            <div className={styles.eyebrow}>
              The little things <Icon id="info" className={styles.icon} />
            </div>
            <div className={styles["glance-row"]}>
              <span>Department</span>
              <strong>{prof.department?.replace(/^Department of /i, "") ?? "—"}</strong>
            </div>
            <div className={styles["glance-row"]}>
              <span>School</span>
              <strong>{prof.college ?? "—"}</strong>
            </div>
            <div className={styles["glance-row"]}>
              <span>Campus</span>
              <strong>{prof.campus.replace(" - Chennai", "")}</strong>
            </div>
            <p>Directory facts from SRM. Opinions come from students.</p>
          </div>

          <div className={styles["thought-card"]}>
            <Icon id="heart" className={styles.icon} />
            <h3>
              Honest doesn’t have<br />
              to mean unkind.
            </h3>
            <p>
              The most useful reviews talk about the learning, not the person. Be specific. Be fair.
              Leave room for another perspective.
            </p>
            <a href="/#our-promise">
              <button>Our community ground rules ↗</button>
            </a>
          </div>
        </aside>
      </div>

      <section className={styles.related} aria-labelledby="related-title">
        <div className={styles.wrap}>
          <div className={styles["section-heading"]}>
            <h2 id="related-title">
              A little more <span className={styles.serif}>exploring?</span>
            </h2>
            <a className={styles["text-link"]} href="/professors">
              All professors <Icon id="arrow" className={styles.icon} />
            </a>
          </div>
          {related.length > 0 ? (
            <div className={styles["related-grid"]}>
              {related.map((p) => (
                <article className={styles["related-card"]} key={p.srm_slug}>
                  <div className={styles["related-avatar"]}>
                    <ProfPhoto p={p} />
                  </div>
                  <div>
                    <h3>
                      <a href={`/professor/${p.srm_slug}`}>{p.name}</a>
                    </h3>
                    <p>{p.department?.replace(/^Department of /i, "") ?? p.campus}</p>
                  </div>
                  <strong aria-label={`Rating ${p.avg_overall != null ? p.avg_overall.toFixed(1) : "unrated"} out of 5`}>
                    {p.avg_overall != null ? p.avg_overall.toFixed(1) : "–"}
                  </strong>
                </article>
              ))}
            </div>
          ) : (
            <p className={styles["courses-note"]}>No nearby profiles to suggest yet.</p>
          )}
          <p className={styles["sync-note"]}>
            <Icon id="info" className={styles.icon} />
            Directory synced from SRM’s public faculty listings. Ratings and reviews come from students.
          </p>
        </div>
      </section>

      <RatingDialog prof={prof} signal={ratingSignal} />
      <ShareDialog prof={prof} signal={shareSignal} />
    </>
  );
}
