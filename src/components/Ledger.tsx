"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PenLine, Search, ThumbsUp } from "lucide-react";
import { DEPT_CHIPS, faculty, gradeCls, type Faculty } from "@/data/ledger";
import { Dots, GradeBox, Reveal } from "./bits";

export type ComposePrefill = { name?: string; dept?: string; course?: string };

function Entry({
  f,
  open,
  onToggle,
  onAdd,
  voted,
  onVote,
}: {
  f: Faculty;
  open: boolean;
  onToggle: () => void;
  onAdd: (f: Faculty) => void;
  voted: Set<string>;
  onVote: (revId: string) => void;
}) {
  return (
    <article className={`entry${open ? " open" : ""}`} data-id={f.id}>
      <button
        className="entry-head"
        aria-expanded={open}
        onClick={onToggle}
      >
        <GradeBox grade={f.grade} style={{ gridArea: "gbox" }} />
        <span className="entry-info">
          <Link
            href={`/professor/${f.id}`}
            className="entry-name"
            onClick={(e) => e.stopPropagation()}
            style={{ textDecoration: "none" }}
          >
            {f.name}
          </Link>
          <span className="entry-meta mono">
            {f.dept} · {f.course.toUpperCase()} · {f.count} REVIEWS
          </span>
        </span>
        <span className="entry-metrics mono">
          <span className="metric">
            <span className="m-label">DIFFICULTY</span>
            <span className="m-value">
              <Dots n={f.diff} />
              {f.diff}/5
            </span>
          </span>
          <span className="metric">
            <span className="m-label">WOULD RETAKE</span>
            <span className="m-value">
              <span className="bar">
                <i style={{ width: `${f.retake}%` }} />
              </span>
              {f.retake}%
            </span>
          </span>
        </span>
        <span className="chev">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>
      <div className="entry-body">
        <div className="entry-body-in">
          {f.reviews.map((r) => {
            const isVoted = voted.has(r.id) || r.helpful >= 150;
            return (
              <div className="rev" key={r.id}>
                <p className="rev-text">&ldquo;{r.text}&rdquo;</p>
                <div className="rev-tags">
                  {r.tags.map((t) => (
                    <span key={t} className="tag mono">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="rev-foot mono">
                  <span>ANONYMOUS · {r.sem}</span>
                  <button
                    className={`helpful mono${isVoted ? " voted" : ""}`}
                    disabled={isVoted}
                    onClick={() => onVote(r.id)}
                  >
                    <ThumbsUp size={12} /> HELPFUL · {r.helpful + (voted.has(r.id) ? 1 : 0)}
                  </button>
                </div>
              </div>
            );
          })}
          <div className="rev-cta">
            <button className="link-btn" onClick={() => onAdd(f)}>
              <PenLine size={14} /> Add your take on {f.name.split(" ").pop()}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function Ledger({
  onCompose,
}: {
  onCompose: (prefill?: ComposePrefill) => void;
}) {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("ALL");
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(["cse-os"])
  );
  const [voted, setVoted] = useState<Set<string>>(() => new Set());

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return faculty.filter(
      (f) =>
        (dept === "ALL" || f.dept === dept) &&
        (!needle ||
          `${f.name} ${f.course} ${f.dept}`.toLowerCase().includes(needle))
    );
  }, [q, dept]);

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const vote = (revId: string) =>
    setVoted((prev) => {
      if (prev.has(revId)) return prev;
      const next = new Set(prev);
      next.add(revId);
      return next;
    });

  return (
    <section id="ledger" className="ledger">
      <div className="container-x">
        <Reveal>
          <h2 className="sec-title">Browse before you register.</h2>
          <p className="sec-sub">
            A live slice of the database. Search it, filter it, expand an
            entry. Everything below works right now.
          </p>
        </Reveal>

        <Reveal>
          <div className="ledger-bar">
            <div className="searchwrap">
              <Search size={15} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                type="text"
                placeholder="SEARCH PROFESSOR, SUBJECT, DEPT"
                aria-label="Search the ledger"
              />
            </div>
            <div className="chips">
              {DEPT_CHIPS.map((d) => (
                <button
                  key={d}
                  className={`chip${d === dept ? " on" : ""}`}
                  onClick={() => setDept(d)}
                >
                  {d}
                </button>
              ))}
            </div>
            <span className="ledger-count mono">
              {list.length} / {faculty.length} ENTRIES
            </span>
          </div>
        </Reveal>

        <div className="ledger-list">
          {list.length === 0 ? (
            <div className="empty">
              <Search size={26} />
              <h3>Nothing in the ledger for that yet.</h3>
              <p>
                Be the first. Your five minutes saves the next batch a
                semester.
              </p>
              <button
                className="btn btn-ghost"
                onClick={() => onCompose({ name: q.trim() })}
              >
                <PenLine size={15} /> Write the first review
              </button>
            </div>
          ) : (
            list.map((f) => (
              <Entry
                key={f.id}
                f={f}
                open={openIds.has(f.id)}
                onToggle={() => toggle(f.id)}
                onAdd={(fac) =>
                  onCompose({
                    name: fac.name,
                    dept: fac.dept,
                    course: fac.course,
                  })
                }
                voted={voted}
                onVote={vote}
              />
            ))
          )}
        </div>

        <Reveal className="ledger-note mono">
          <p className="ledger-note mono">
            2,485 PROFESSORS INDEXED FROM THE SRM DIRECTORY. MISSING
            SOMEONE?
            <button className="link-btn" onClick={() => onCompose()}>
              <PenLine size={14} /> Start an entry
            </button>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export { gradeCls };
