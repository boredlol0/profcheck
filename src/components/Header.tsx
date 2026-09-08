"use client";

import { useEffect, useState } from "react";
import { PenLine } from "lucide-react";
import { BrandMark } from "./bits";

export function Header({ onCompose }: { onCompose: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-head${scrolled ? " scrolled" : ""}`}>
      {/* Tailwind handles the flex row; .head-in keeps the 64px measure */}
      <div className="container-x head-in">
        <a className="brand" href="/" aria-label="ProfCheck home">
          <BrandMark />
          <span className="brand-word">
            Prof<em>Check</em>
          </span>
          <span className="brand-tag mono">SRM · KTR</span>
        </a>
        <nav className="site-nav">
          <a href="/#how">How it works</a>
          <a href="/professors">The ledger</a>
          <a href="/#anonymity">Anonymity</a>
        </nav>
        <a className="btn btn-ghost btn-sm" href="/login">
          Sign in
        </a>
        <button className="btn btn-primary btn-sm" onClick={onCompose}>
          <PenLine size={15} /> Write a review
        </button>
      </div>
    </header>
  );
}
