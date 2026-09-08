"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarChart2,
  Check,
  EyeOff,
  Scale,
  Shield,
  X,
} from "lucide-react";
import { STATS } from "@/data/ledger";
import { BrandMark, Reveal } from "./bits";
import { PenLine } from "lucide-react";

function StatNum({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const dur = 1200;
        const t0 = performance.now();
        const step = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          const e = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(target * e));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target]);

  return (
    <span ref={ref} className="stat-num">
      {val.toLocaleString("en-IN")}
    </span>
  );
}

export function Stats() {
  return (
    <section className="stats">
      {/* Tailwind grid fallback + .stats-in keeps the dashed dividers */}
      <div className="container-x stats-in">
        {STATS.map((s) => (
          <div className="stat" key={s.label}>
            <StatNum target={s.count} />
            <span className="stat-lab mono">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

const STEPS = [
  {
    no: "01",
    title: "Find your professor",
    body: "Search the ledger by name, department or subject. Every entry is tagged with the course, the semester and the batch that wrote it, so you always know exactly what you're reading.",
    tag: "NICKNAMES WORK TOO",
  },
  {
    no: "02",
    title: "Read the pattern",
    body: "One angry review is noise; a hundred is a signal. Grades, difficulty and re-take rates are aggregated across semesters and batches, not cherry-picked by whoever showed up angriest.",
    tag: "MIN. 5 REVIEWS PER GRADE",
  },
  {
    no: "03",
    title: "Add your take",
    body: "Five minutes, zero trace. Verify once with your SRM email, then your review goes live instantly for the next batch. Blunt is fine. Cruel gets reported.",
    tag: "LIVE INSTANTLY",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="how">
      <div className="container-x">
        <Reveal>
          <h2 className="sec-title">
            We learned the hard way, so you don&apos;t have to.
          </h2>
        </Reveal>
        <div className="steps">
          {STEPS.map((s, i) => (
            <Reveal key={s.no} delay={i * 80}>
              <div className="step">
                <span className="step-no">{s.no}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
                <span className="step-tag mono">{s.tag}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const ANON_ITEMS = [
  {
    icon: EyeOff,
    title: "Verified, still anonymous",
    body: "You confirm you're SRM with a college-email OTP so outsiders can't brigade the ledger. Your email is never stored with a review and never shown. The reviewer evaporates.",
  },
  {
    icon: Scale,
    title: "Published instantly, cleaned by reports",
    body: "Reviews go live the second you submit. Readers report slurs, doxxing and personal attacks, and reported reviews get hidden fast. Honest, brutal feedback about teaching always stays.",
  },
  {
    icon: Shield,
    title: "Rate the teaching, not the human",
    body: "Comments on appearance, family, accent or personal life are rejected on sight. We're a ledger, not a burn book.",
  },
  {
    icon: BarChart2,
    title: "Patterns over anecdotes",
    body: "A grade only appears once a professor has at least five reviews. One bad Monday has never tanked anyone's entry.",
  },
];

export function Anonymity() {
  return (
    <section id="anonymity" className="anon">
      <div className="container-x anon-grid">
        <div className="anon-left">
          <Reveal>
            <h2 className="sec-title">Anonymous by design, not by promise.</h2>
            <p className="sec-sub">
              Every feature here was chosen so the person reading a review can
              trust it, and the person writing it never has to look over
              their shoulder.
            </p>
          </Reveal>
          <Reveal delay={80}>
            <div className="store">
              <div className="srow">
                <Check size={15} />
                <span>
                  <b>KEPT:</b> review text · grade · dept · timestamp
                </span>
              </div>
                <div className="srow bad">
                  <X size={15} />
                  <span>
                    <b>DROPPED:</b> name · roll no · IP · device
                  </span>
                </div>
                <div className="srow">
                  <Check size={15} />
                  <span>
                    <b>EMAIL:</b> proves you&rsquo;re SRM, never linked to a review
                  </span>
                </div>
            </div>
          </Reveal>
        </div>
        <div>
          {ANON_ITEMS.map((a, i) => (
            <Reveal key={a.title} delay={i * 70}>
              <div className="anon-item">
                <span className="a-ico">
                  <a.icon size={18} />
                </span>
                <div>
                  <h3>{a.title}</h3>
                  <p>{a.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
          <Reveal delay={120}>
            <div className="reject">
              <div className="reject-slip">
                <p className="reject-meta">
                  SUBMISSION #12,481 · FLAGGED BY READERS
                </p>
                <p className="reject-text">
                  &ldquo;Decent classes, but honestly he&apos;s{" "}
                  <mark>too old for this job</mark> and{" "}
                  <mark>his accent is painful to listen to</mark> lol.&rdquo;
                </p>
              </div>
              <span className="stamp stamp-rej">REJECTED · PERSONAL REMARK</span>
              <p className="reject-cap">
                A REAL SUBMISSION, REPORTED BY READERS AND HIDDEN. THE
                AUTHOR RESUBMITTED JUST THE TEACHING PART — THAT ONE IS
                STILL LIVE.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function CtaBand({ onCompose }: { onCompose: () => void }) {
  return (
    <section className="cta-band">
      <svg className="wm" viewBox="0 0 100 100" aria-hidden="true">
        <path
          d="M18 54 L42 76 L82 26"
          fill="none"
          stroke="currentColor"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="container-x">
        <Reveal>
          <h2>
            Your juniors deserve better intel.
            <br />
            <em>Walk in knowing.</em>
          </h2>
          <p className="cta-sub">
            12,482 reviews started with one student deciding the next batch
            deserved better intel than a rumour from the hostel corridor.
          </p>
          <div className="cta-row">
            <button className="btn btn-gold" onClick={onCompose}>
              <PenLine size={15} /> Write the 12,483rd
            </button>
            <a className="btn btn-ghost-l" href="/professors">
              Browse the ledger
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer({ onReport }: { onReport: () => void }) {
  return (
    <footer className="site-foot">
      <div className="container-x foot-grid">
        <div className="foot-brand">
          <a className="brand" href="#top">
            <BrandMark className="brand-mark" />
            <span className="brand-word">
              Prof<em>Check</em>
            </span>
          </a>
          <p>
            The unofficial faculty ledger of SRM Kattankulathur. Built by the
            people paying the fees, for the people paying the fees.
          </p>
        </div>
        <nav className="foot-links">
          <h3>EXPLORE</h3>
          <a href="/#how">How it works</a>
          <a href="/professors">The ledger</a>
          <a href="/#anonymity">Anonymity &amp; reporting</a>
        </nav>
        <nav className="foot-links">
          <h3>THE FINE PRINT</h3>
          <a href="/#anonymity">Reporting policy</a>
          <a href="/#anonymity">What we store</a>
          <button onClick={onReport}>Report an entry</button>
        </nav>
      </div>
      <div className="container-x foot-bottom">
        <span>© 2025 PROFHECK STUDENT COLLECTIVE · KATTANKULATHUR, TN</span>
        <span>NOT AFFILIATED WITH SRM INSTITUTE OF SCIENCE AND TECHNOLOGY</span>
      </div>
    </footer>
  );
}
