"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Lock, PenLine, RotateCw } from "lucide-react";
import { heroSlips } from "@/data/ledger";
import { Dots, GradeBox } from "./bits";

export function Hero({ onCompose }: { onCompose: () => void }) {
  const [idx, setIdx] = useState(0);
  const [swap, setSwap] = useState(false);
  const [anim, setAnim] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const cycle = useCallback(() => {
    setSwap(true);
    window.setTimeout(() => {
      setIdx((i) => (i + 1) % heroSlips.length);
      setSwap(false);
      setAnim(true);
      window.setTimeout(() => setAnim(false), 360);
    }, 190);
  }, []);

  useEffect(() => {
    timer.current = setInterval(cycle, 6500);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [cycle]);

  const pause = () => {
    if (timer.current) clearInterval(timer.current);
  };
  const resume = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(cycle, 6500);
  };

  const d = heroSlips[idx];

  return (
    <section className="hero" id="top">
      <div className="container-x hero-grid">
        <div className="max-w-xl">
          <h1 className="hero-title fade-load" style={{ animationDelay: ".12s" }}>
            Know your faculty before you <em>walk in.</em>
          </h1>
          <p className="hero-fn mono fade-load" style={{ animationDelay: ".2s" }}>
            * YOU CAN&rsquo;T CHOOSE THEM. YOU CAN KNOW THEM.
          </p>
          <p className="hero-sub fade-load" style={{ animationDelay: ".26s" }}>
            ProfCheck is an anonymous, student-run ledger of professor reviews.
            Honest takes on teaching, grading and attendance, written by the
            students who actually sat through the class.
          </p>
          <div className="hero-cta fade-load" style={{ animationDelay: ".34s" }}>
            <button className="btn btn-primary" onClick={onCompose}>
              <PenLine size={15} /> Write a review
            </button>
            <a className="btn btn-ghost" href="/professors">
              Browse the ledger
            </a>
          </div>
          <p
            className="hero-lock mono fade-load"
            style={{ animationDelay: ".42s" }}
          >
            <Lock size={13} /> SRM EMAIL TO WRITE · NO NAMES · NO TRACE
          </p>
        </div>

        <div
          className="hero-stack-wrap fade-load"
          style={{ animationDelay: ".2s" }}
        >
          <div
            className="stack"
            tabIndex={0}
            role="button"
            aria-label="Cycle through sample reviews"
            onClick={cycle}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                cycle();
              }
            }}
            onMouseEnter={pause}
            onMouseLeave={resume}
          >
            <div className="slip slip-back b2">
              <span className="fl big" />
              <span className="fl" style={{ width: "82%" }} />
              <span className="fl" style={{ width: "64%" }} />
            </div>
            <div className="slip slip-back b1">
              <span className="fl big" />
              <span className="fl" style={{ width: "88%" }} />
              <span className="fl" style={{ width: "52%" }} />
            </div>
            <span className="tape" />
            <div className={`slip slip-top${swap ? " swap" : ""}${anim ? " in" : ""}`}>
              <div className="slip-head">
                <GradeBox grade={d.grade} />
                <span className="slip-id">
                  <span className="slip-name">{d.name}</span>
                  <span className="slip-meta mono">{d.meta}</span>
                </span>
                <span className="stamp stamp-sm">VERIFIED</span>
              </div>
              <div className="slip-stats mono">
                <span className="ss">
                  <span className="ss-l">DIFFICULTY</span>
                  <span className="ss-v">
                    <Dots n={d.diff} />
                    <b>{d.diff}/5</b>
                  </span>
                </span>
                <span className="ss">
                  <span className="ss-l">WOULD RETAKE</span>
                  <span className="ss-v">
                    <span className="bar">
                      <i style={{ width: `${d.retake}%` }} />
                    </span>
                    <b>{d.retake}%</b>
                  </span>
                </span>
              </div>
              <p className="slip-quote">&ldquo;{d.quote}&rdquo;</p>
              <div className="slip-foot mono">
                <span>ANONYMOUS · {d.sem}</span>
                <span>HELPFUL · {d.helpful}</span>
              </div>
            </div>
          </div>
          <p className="stack-cap mono">
            <RotateCw size={12} /> LIVE FROM THE LEDGER · CLICK TO CYCLE
          </p>
        </div>
      </div>
    </section>
  );
}
