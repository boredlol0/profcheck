"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icons";
import { useSite, type InfoKind } from "./site-context";
import { normalizeText } from "@/lib/professor";
import { createClient } from "@/lib/supabase/client";
import { submitReview } from "@/lib/actions";

function useDialog(openSignal: number | InfoKind | null) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (openSignal) {
      if (!dialog.open) dialog.showModal();
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

const RATING_LABELS = ["poor", "fair", "good", "very good", "excellent"];

const CATEGORIES = [
  "Teaching clarity",
  "Approachability",
  "Fair grading",
  "Engagement",
] as const;

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
    <fieldset className="rating-field">
      <legend>{label}</legend>
      <div className="star-inputs">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className={`star-option${n <= value ? " filled" : ""}`}>
            <input
              type="radio"
              name={`rating-${label}`}
              value={n}
              checked={value === n}
              aria-label={`${label}: ${n} out of 5, ${RATING_LABELS[n - 1]}`}
              onChange={() => onPick(n)}
            />
            <span aria-hidden="true">★</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

type ProfPick = { slug: string; name: string };

function RatingDialog() {
  const router = useRouter();
  const { ratingPrefill, ratingSignal } = useSite();
  const ref = useDialog(ratingSignal);
  const [profQuery, setProfQuery] = useState("");
  const [picked, setPicked] = useState<ProfPick | null>(null);
  const [options, setOptions] = useState<ProfPick[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
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
    if (ratingSignal > 0) {
      setProfQuery("");
      setPicked(ratingPrefill ? { slug: ratingPrefill, name: ratingPrefill } : null);
      setCourses([]);
      setCourse("");
      setScores({});
      setReview("");
      setError(null);
      setDone(false);
      let cancelled = false;
      createClient()
        .from("professors")
        .select("srm_slug,name")
        .eq("is_active", true)
        .order("name")
        .then(({ data }) => {
          if (!cancelled && data) {
            setOptions(data.map((r) => ({ slug: r.srm_slug, name: r.name })));
          }
        });
      return () => {
        cancelled = true;
      };
    }
  }, [ratingSignal, ratingPrefill]);

  const pickProfessor = (m: ProfPick) => {
    setPicked(m);
    setProfQuery("");
    setCourse("");
    setError(null);
    createClient()
      .from("professors")
      .select("courses_taught")
      .eq("srm_slug", m.slug)
      .maybeSingle()
      .then(({ data }) => {
        setCourses(data?.courses_taught ?? []);
      });
  };

  const matches =
    profQuery.trim().length < 2
      ? []
      : options
          .map((o) => {
            const words = normalizeText(o.name).split(" ");
            const terms = normalizeText(profQuery).split(" ").filter(Boolean);
            let score = 0;
            for (const t of terms) {
              const hit = words.some(
                (w) => w === t || w.startsWith(t) || (t.length >= 3 && w.includes(t))
              );
              if (!hit) return { o, score: -1 };
              score += words.some((w) => w === t || w.startsWith(t)) ? 2 : 1;
            }
            return { o, score };
          })
          .filter((r) => r.score >= 0)
          .sort((a, b) => b.score - a.score || a.o.name.localeCompare(b.o.name))
          .slice(0, 8)
          .map((r) => r.o);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!picked) {
      setError("Choose a professor first.");
      return;
    }
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
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (!data.session) {
          router.push("/login?next=/professors");
          ref.current?.close();
          return;
        }
        submitReview({
          slug: picked.slug,
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
      });
  };

  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      aria-labelledby="rating-title"
      style={{ width: "min(640px, calc(100% - 32px))" }}
    >
      <div className="dialog-header flex items-center justify-between gap-5 mb-[21px]">
        <span className="eyebrow">Pass the wisdom on</span>
        <button className="close-dialog" aria-label="Close rating form" onClick={close}>
          <Icon id="i-close" />
        </button>
      </div>
      {!done ? (
        <div>
          <h2 id="rating-title">
            Give the next student<br />a <span className="serif" style={{ fontStyle: "italic" }}>head start.</span>
          </h2>
          <p className="dialog-description">
            Thoughtful, anonymous, and verified SRM-only. Cruel never counts.
          </p>
          <form onSubmit={submit} noValidate>
            <div className="form-field">
              <label htmlFor="rating-professor">Choose a professor</label>
              {picked ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    background: "#eef1e6",
                    border: "1px solid #dfe5d5",
                    borderRadius: 9,
                    padding: "12px 14px",
                    fontSize: 12,
                    fontWeight: 650,
                  }}
                >
                  <strong>{picked.name}</strong>
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => {
                      setPicked(null);
                      setProfQuery("");
                      setError(null);
                    }}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <>
                  <input
                    id="rating-professor"
                    type="text"
                    placeholder="Type a name…"
                    autoComplete="off"
                    value={profQuery}
                    onChange={(e) => {
                      setProfQuery(e.target.value);
                      setError(null);
                    }}
                  />
                  {matches.length > 0 && (
                    <div role="listbox" aria-label="Matching professors" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                      {matches.map((m) => (
                        <button
                          key={m.slug}
                          type="button"
                          role="option"
                          aria-selected="false"
                          className="text-link"
                          onClick={() => {
                            pickProfessor(m);
                          }}
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
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
            <p className="field-help" aria-live="polite" style={{ marginTop: -8 }}>
              {overall != null
                ? `Overall ${overall.toFixed(1)} / 5 — averaged from your four ratings.`
                : "Rate all four — your overall is their average."}
            </p>
            {picked && (
              <div className="form-field">
                <label htmlFor="rating-course">Which course?</label>
                <select
                  id="rating-course"
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
                  {courses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
            )}
            <div className="form-field">
              <label htmlFor="review-text">What should a future student know?</label>
              <textarea
                id="review-text"
                placeholder="Think teaching style, helpful feedback, or how to prepare for class..."
                maxLength={600}
                required
                aria-describedby="review-help"
                value={review}
                onChange={(e) => {
                  setReview(e.target.value);
                  setError(null);
                }}
              />
              <div className="field-help" id="review-help">
                Up to 600 characters. Leave out names of students, contact details, and other identifying information.
              </div>
            </div>
            {error && <p className="field-error" role="alert">{error}</p>}
            <label className="checkbox-field flex items-start gap-[9px] text-[11px] text-[#7a826e] leading-[1.7] mb-[21px]">
              <input type="checkbox" required />
              <span>I’ve kept this constructive and free of personal or identifying details.</span>
            </label>
            <button className="button button-dark form-submit w-full" type="submit">
              Submit anonymously <Icon id="i-arrow" />
            </button>
            <p className="form-disclaimer">SRM email verification keeps outsiders out. Your name never appears.</p>
          </form>
        </div>
      ) : (
        <div className="success-state text-center px-0 py-[15px]">
          <div className="success-icon"><Icon id="i-check" /></div>
          <h2>That’s the <span className="serif" style={{ fontStyle: "italic" }}>spirit.</span></h2>
          <p>Your take is in. Some junior, registration week, will thank you silently.</p>
          <button className="button button-dark" onClick={close}>
            Back to exploring <Icon id="i-arrow" />
          </button>
        </div>
      )}
    </dialog>
  );
}

const INFO: Record<InfoKind, { title: string; body: React.ReactNode }> = {
  guidelines: {
    title: "Good feedback. Good intentions.",
    body: (
      <>
        <p className="dialog-description">A more useful campus conversation starts with a few simple ground rules.</p>
        <ol className="guideline-list">
          <li><strong>Speak from experience.</strong> Discuss a class you attended. Avoid rumours and second-hand claims.</li>
          <li><strong>Be specific and constructive.</strong> Teaching clarity, feedback, workload, and preparation tips help future students.</li>
          <li><strong>Respect the person.</strong> No harassment, slurs, threats, or comments about someone’s appearance or private life.</li>
          <li><strong>Protect everyone’s privacy.</strong> Don’t include student names, contact details, IDs, or identifying anecdotes.</li>
          <li><strong>Leave room for another perspective.</strong> Your experience matters, but it isn’t everyone’s experience.</li>
        </ol>
        <p className="field-help">Reviews go live instantly. Reported abuse gets hidden fast.</p>
      </>
    ),
  },
  privacy: {
    title: "Anonymous, for real.",
    body: (
      <>
        <p className="dialog-description">Here’s exactly what ProfCheck does — and doesn’t do.</p>
        <ul className="guideline-list">
          <li><strong>One verification, zero identity.</strong> Your SRM email proves you’re a student. It is never stored with a review or shown to anyone.</li>
          <li><strong>No names, roll numbers, or tracking.</strong> Reviews carry text, a grade, and a timestamp. Nothing else.</li>
          <li><strong>Reports, not surveillance.</strong> Readers flag abuse; flagged reviews get hidden. Nobody reads your browsing.</li>
          <li><strong>Independent concept.</strong> ProfCheck is student-run and not affiliated with SRMIST.</li>
        </ul>
        <p className="field-help">A live platform keeps its own security and privacy policies here as it grows.</p>
      </>
    ),
  },
};

function InfoDialog() {
  const { infoKind, closeInfo } = useSite();
  const ref = useDialog(infoKind);
  const info = infoKind ? INFO[infoKind] : null;
  const close = () => {
    ref.current?.close();
    closeInfo();
  };
  return (
    <dialog ref={ref} aria-labelledby="info-title">
      <div className="dialog-header flex items-center justify-between gap-5 mb-[21px]">
        <span className="eyebrow">A little clarity</span>
        <button className="close-dialog" aria-label="Close information" onClick={close}>
          <Icon id="i-close" />
        </button>
      </div>
      {info && (
        <>
          <h2 id="info-title">{info.title}</h2>
          <div>{info.body}</div>
          <button className="button button-dark form-submit w-full" style={{ marginTop: 8 }} onClick={close}>
            Got it <Icon id="i-arrow" />
          </button>
        </>
      )}
    </dialog>
  );
}

export function Dialogs() {
  return (
    <>
      <RatingDialog />
      <InfoDialog />
    </>
  );
}
