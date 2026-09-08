"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, PenLine, ThumbsUp } from "lucide-react";
import { faculty } from "@/data/ledger";
import { Dots, GradeBox } from "@/components/bits";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { Composer, Toast, type ToastMsg } from "@/components/Composer";
import type { ComposePrefill } from "@/components/Ledger";

export default function ProfessorPage() {
  const params = useParams<{ id: string }>();
  const prof = faculty.find((f) => f.id === params.id);

  const [composerOpen, setComposerOpen] = useState(false);
  const [prefill, setPrefill] = useState<ComposePrefill>({});
  const [composerKey, setComposerKey] = useState(0);
  const [toast, setToast] = useState<ToastMsg>(null);
  const [voted, setVoted] = useState<Set<string>>(() => new Set());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((title: string, sub: string) => {
    setToast({ title, sub });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4800);
  }, []);

  const openComposer = useCallback((p: ComposePrefill = {}) => {
    setPrefill(p);
    setComposerKey((k) => k + 1);
    setComposerOpen(true);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  if (!prof) notFound();

  const vote = (revId: string) =>
    setVoted((prev) => {
      if (prev.has(revId)) return prev;
      const next = new Set(prev);
      next.add(revId);
      return next;
    });

  return (
    <>
      <Header onCompose={() => openComposer()} />
      <main className="flex-1">
        <section className="ledger">
          <div className="container-x">
            <Link href="/professors" className="link-btn" style={{ marginBottom: 26 }}>
              <ArrowLeft size={14} /> All professors
            </Link>

            <div className="slip" style={{ marginBottom: 10 }}>
              <div className="slip-head">
                <GradeBox grade={prof.grade} style={{ width: 60, height: 60, flexBasis: 60, fontSize: "1.5rem" }} />
                <span className="slip-id">
                  <span className="slip-name" style={{ fontSize: "1.7rem" }}>{prof.name}</span>
                  <span className="slip-meta">
                    {prof.dept} · {prof.course.toUpperCase()} · {prof.count} REVIEWS
                  </span>
                </span>
              </div>
              <div className="slip-stats mono">
                <span className="ss">
                  <span className="ss-l">DIFFICULTY</span>
                  <span className="ss-v">
                    <Dots n={prof.diff} />
                    <b>{prof.diff}/5</b>
                  </span>
                </span>
                <span className="ss">
                  <span className="ss-l">WOULD RETAKE</span>
                  <span className="ss-v">
                    <span className="bar">
                      <i style={{ width: `${prof.retake}%` }} />
                    </span>
                    <b>{prof.retake}%</b>
                  </span>
                </span>
              </div>
              <div className="rev-cta" style={{ padding: "18px 0 4px" }}>
                <button
                  className="link-btn"
                  onClick={() =>
                    openComposer({ name: prof.name, dept: prof.dept, course: prof.course })
                  }
                >
                  <PenLine size={14} /> Add your take on {prof.name.split(" ").pop()}
                </button>
              </div>
            </div>

            {prof.reviews.map((r) => {
              const isVoted = voted.has(r.id) || r.helpful >= 150;
              return (
                <div className="rev" key={r.id} style={{ paddingLeft: 24 }}>
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
                      onClick={() => vote(r.id)}
                    >
                      <ThumbsUp size={12} /> HELPFUL · {r.helpful + (voted.has(r.id) ? 1 : 0)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer
        onReport={() =>
          showToast(
            "Thanks — reported",
            "Reports from verified students get abusive reviews hidden fast. False flags are logged."
          )
        }
      />
      <Composer
        key={composerKey}
        open={composerOpen}
        prefill={prefill}
        onClose={() => setComposerOpen(false)}
        onToast={showToast}
      />
      <Toast msg={toast} />
    </>
  );
}
