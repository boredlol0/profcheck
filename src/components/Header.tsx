"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleUserRound, LogOut, PenLine } from "lucide-react";
import { BrandMark } from "./bits";
import { createClient } from "@/lib/supabase/client";

export function Header({ onCompose }: { onCompose: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await createClient().auth.signOut();
    setEmail(null);
    router.refresh();
  };

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
        {email ? (
          <>
            <span
              className="brand-tag mono"
              title={email}
              style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              <CircleUserRound size={13} style={{ verticalAlign: "-2px" }} />{" "}
              {email.split("@")[0]}
            </span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={logout}
              title="Log out"
            >
              <LogOut size={15} /> Log out
            </button>
          </>
        ) : (
          <a className="btn btn-ghost btn-sm" href="/login">
            Sign in
          </a>
        )}
        <button className="btn btn-primary btn-sm" onClick={onCompose}>
          <PenLine size={15} /> Write a review
        </button>
      </div>
    </header>
  );
}
