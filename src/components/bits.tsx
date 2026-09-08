"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gradeCls } from "@/data/ledger";

export function Dots({ n }: { n: number }) {
  return (
    <span className="dotset" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`dot${i < n ? " on" : ""}`} />
      ))}
    </span>
  );
}

export function GradeBox({
  grade,
  className = "",
  style,
}: {
  grade: string | null;
  className?: string;
  style?: React.CSSProperties;
}) {
  const cls = grade ? `g-${gradeCls(grade)}` : "g-none";
  return (
    <span className={`gbox ${cls} ${className}`} style={style}>
      {grade ?? "—"}
    </span>
  );
}

export function BrandMark({ className = "brand-mark" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 26 26" aria-hidden="true">
      <rect x="2" y="2" width="22" height="22" rx="3" />
      <path d="M7 13.5l4.5 4.5L19.5 8" />
    </svg>
  );
}

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (delay) el.style.transitionDelay = `${delay}ms`;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
