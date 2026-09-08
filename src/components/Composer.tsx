"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Lock, X } from "lucide-react";
import {
  DEPTS_SEL,
  GRADES,
  TAGS,
  faculty,
  gradeCls,
} from "@/data/ledger";
import { Dots, GradeBox } from "./bits";
import type { ComposePrefill } from "./Ledger";

export type ToastMsg = { title: string; sub: string } | null;

export function Toast({ msg }: { msg: ToastMsg }) {
  return (
    <div
      className={`toast${msg ? " show" : ""}`}
      role="status"
      aria-live="polite"
    >
      <span className="t-ico">
        <BadgeCheck size={18} />
      </span>
      <div>
        <b>{msg?.title ?? ""}</b>
        <p>{msg?.sub ?? ""}</p>
      </div>
    </div>
  );
}

const SEMS = ["2025 · Odd", "2025 · Even", "2024 · Odd", "2024 · Even"];

export function Composer({
  open,
  prefill,
  onClose,
  onToast,
}: {
  open: boolean;
  prefill: ComposePrefill;
  onClose: () => void;
  onToast: (title: string, sub: string) => void;
}) {
  const [name, setName] = useState(prefill.name ?? "");
  const [dept, setDept] = useState(
    prefill.dept && DEPTS_SEL.includes(prefill.dept) ? prefill.dept : DEPTS_SEL[0]
  );
  const [course, setCourse] = useState(prefill.course ?? "");
  const [sem, setSem] = useState(SEMS[0]);
  const [grade, setGrade] = useState<string | null>(null);
  const [diff, setDiff] = useState(3);
  const [retake, setRetake] = useState<boolean | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [denyTag, setDenyTag] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; grade?: string; text?: string }>({});

  // Lock body scroll while the modal is open (no state writes here).
  useEffect(() => {
    if (!open) return;
    document.body.classList.add("locked");
    return () => document.body.classList.remove("locked");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const reset = () => {
    setName("");
    setDept(DEPTS_SEL[0]);
    setCourse("");
    setSem(SEMS[0]);
    setGrade(null);
    setDiff(3);
    setRetake(null);
    setTags([]);
    setText("");
    setSubmitted(false);
    setErrors({});
  };

  const close = () => {
    onClose();
    if (submitted) window.setTimeout(reset, 300);
  };

  const toggleTag = (t: string) => {
    setTags((prev) => {
      if (prev.includes(t)) return prev.filter((x) => x !== t);
      if (prev.length >= 3) {
        setDenyTag(t);
        window.setTimeout(() => setDenyTag(null), 380);
        return prev;
      }
      return [...prev, t];
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitted) {
      reset();
      return;
    }
    const errs: typeof errors = {};
    if (name.trim().length < 2)
      errs.name = "NAME YOUR PROFESSOR. INITIALS ARE FINE, “SIR” IS NOT.";
    if (!grade) errs.grade = "PICK AN OVERALL GRADE.";
    if (text.trim().length < 40)
      errs.text =
        "GIVE THE NEXT BATCH SOMETHING TO WORK WITH. 40 CHARACTERS MINIMUM.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitted(true);
    onToast(
      "Submitted anonymously",
      "It’s live for the next batch. And nowhere in that form was your name."
    );
  };

  const pvMeta = useMemo(
    () => `${dept || "DEPT"} · ${(course.trim() || "COURSE").toUpperCase()}`,
    [dept, course]
  );

  if (!open) return null;

  return (
    <div
      className={`overlay${open ? " show" : ""}`}
      aria-hidden={!open}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle">
        <div className="modal-head">
          <div>
            <h3 className="m-title" id="mTitle">
              File it in the ledger.
            </h3>
          </div>
          <button className="m-close" onClick={close} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={submit} noValidate>
            <div className="frow">
              <div className={`field${errors.name ? " error" : ""}`}>
                <label htmlFor="fName">Professor name *</label>
                <input
                  type="text"
                  id="fName"
                  list="profList"
                  placeholder="e.g. Dr. R. Chandrasekaran"
                  autoComplete="off"
                  value={name}
                  disabled={submitted}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((p) => ({ ...p, name: undefined }));
                  }}
                />
                <p className="err">{errors.name}</p>
              </div>
              <div className="field">
                <label htmlFor="fDept">Department</label>
                <select
                  id="fDept"
                  value={dept}
                  disabled={submitted}
                  onChange={(e) => setDept(e.target.value)}
                >
                  {DEPTS_SEL.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="frow">
              <div className="field">
                <label htmlFor="fCourse">Course / subject</label>
                <input
                  type="text"
                  id="fCourse"
                  placeholder="e.g. Operating Systems"
                  autoComplete="off"
                  value={course}
                  disabled={submitted}
                  onChange={(e) => setCourse(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="fSem">Semester attended</label>
                <select
                  id="fSem"
                  value={sem}
                  disabled={submitted}
                  onChange={(e) => setSem(e.target.value)}
                >
                  {SEMS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={`field${errors.grade ? " error" : ""}`}>
              <label>Overall grade *</label>
              <div className="gchips">
                {GRADES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`gchip${grade === g ? " on" : ""}`}
                    disabled={submitted}
                    onClick={() => {
                      setGrade(g);
                      setErrors((p) => ({ ...p, grade: undefined }));
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <p className="err">{errors.grade}</p>
            </div>

            <div className="field">
              <label>Difficulty</label>
              <div className="diff-ctl">
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={diff}
                  disabled={submitted}
                  aria-label="Difficulty, 1 to 5"
                  onChange={(e) => setDiff(+e.target.value)}
                />
                <Dots n={diff} />
                <b className="mono">{diff} / 5</b>
              </div>
            </div>

            <div className="field">
              <label>Would you take them again?</label>
              <div className="gchips">
                <button
                  type="button"
                  className={`ynbtn${retake === true ? " on" : ""}`}
                  disabled={submitted}
                  onClick={() => setRetake(true)}
                >
                  YES, WOULD
                </button>
                <button
                  type="button"
                  className={`ynbtn${retake === false ? " on" : ""}`}
                  disabled={submitted}
                  onClick={() => setRetake(false)}
                >
                  NO
                </button>
              </div>
            </div>

            <div className="field">
              <label>
                Tag them <span style={{ color: "var(--ink-3)" }}>(up to 3)</span>
              </label>
              <div className="tchips">
                {TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`tchip${tags.includes(t) ? " on" : ""}${denyTag === t ? " deny" : ""}`}
                    disabled={submitted}
                    onClick={() => toggleTag(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className={`field${errors.text ? " error" : ""}`}>
              <label htmlFor="fText">Your review *</label>
              <textarea
                id="fText"
                maxLength={600}
                placeholder="What should the next batch know? Teaching, grading, workload, internals. Specifics help."
                value={text}
                disabled={submitted}
                onChange={(e) => {
                  setText(e.target.value);
                  setErrors((p) => ({ ...p, text: undefined }));
                }}
              />
              <div className="ta-foot">
                <span className="ta-hint">
                  MINIMUM 40 CHARACTERS. SPECIFICS HELP THE NEXT STUDENT.
                </span>
                <span className="ta-count mono">{text.length} / 600</span>
              </div>
              <p className="err">{errors.text}</p>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={submitted && false}
            >
              {submitted ? "WRITE ANOTHER REVIEW" : "Submit anonymously"}
            </button>
            <p className="form-note mono">
              <Lock size={12} /> NO NAME, EMAIL OR IP IS STORED WITH THIS
              SUBMISSION.
            </p>
            <datalist id="profList">
              {faculty.map((f) => (
                <option key={f.id} value={f.name} />
              ))}
            </datalist>
          </form>

          <div className="cpreview">
            <p className="pv-label">LIVE PREVIEW</p>
            <div className="slip preview-slip">
              <div className="slip-head">
                <GradeBox grade={grade} />
                <span className="slip-id">
                  <span className="slip-name">
                    {name.trim() || "Professor name"}
                  </span>
                  <span className="slip-meta">{pvMeta}</span>
                </span>
              </div>
              <div className="slip-stats mono">
                <span className="ss">
                  <span className="ss-l">DIFFICULTY</span>
                  <span className="ss-v">
                    <Dots n={diff} />
                    <b>{diff}/5</b>
                  </span>
                </span>
                <span className="ss">
                  <span className="ss-l">WOULD RETAKE</span>
                  <span className="ss-v">
                    <b>{retake === null ? "—" : retake ? "YES" : "NO"}</b>
                  </span>
                </span>
              </div>
              {tags.length > 0 && (
                <div className="pv-tags">
                  {tags.map((t) => (
                    <span key={t} className="tag mono">
                      {t.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}
              <p className="slip-quote">
                {text.trim() ||
                  "Your review appears here, exactly as the next batch will read it. Specific, honest, blunt. Never personal."}
              </p>
              <div className="slip-foot mono">
                <span>ANONYMOUS · {sem.toUpperCase()}</span>
                <span>0 FOUND HELPFUL</span>
              </div>
              <div className={`stamp stamp-lg${submitted ? " show" : ""}`}>
                <span>LIVE</span>
                <span className="sm">VISIBLE TO EVERYONE</span>
              </div>
            </div>
            <p className="pv-note">
              UPDATES AS YOU TYPE. NOTHING IS SENT UNTIL YOU SUBMIT.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { gradeCls };
