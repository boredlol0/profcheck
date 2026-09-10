"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icons";
import { createClient } from "@/lib/supabase/client";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

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

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menuOpen]);

  const logout = async () => {
    await createClient().auth.signOut();
    setEmail(null);
    router.refresh();
  };

  return (
    <header className="site-header">
      <div className="container nav flex h-[89px] items-center justify-between gap-6 max-[820px]:h-[74px] max-[620px]:h-[72px] max-[620px]:gap-2.5">
        <a className="logo inline-flex items-center gap-[9px] font-display text-[25px] font-extrabold tracking-[-1.5px] max-[820px]:text-[23px]" href="/" aria-label="ProfCheck home">
          <svg className="logo-symbol h-[37px] w-[33px] max-[620px]:h-8 max-[620px]:w-7" aria-hidden="true"><use href="#brand" /></svg>
          <span>profcheck<span className="logo-dot">.</span></span>
        </a>

        <nav className={`nav-links flex items-center gap-[33px] ml-[65px] max-[1100px]:ml-0 max-[1100px]:gap-[23px] max-[820px]:gap-[19px] max-[620px]:hidden max-[620px]:absolute max-[620px]:top-[72px] max-[620px]:left-0 max-[620px]:right-0 max-[620px]:flex-col max-[620px]:gap-6 max-[620px]:bg-[var(--paper)]${menuOpen ? " max-[620px]:flex" : ""}`} aria-label="Main navigation">
          <a href="/professors" className="text-[12px] max-[820px]:text-[11px] max-[620px]:text-sm" onClick={() => setMenuOpen(false)}>Find a professor</a>
          <a href="/#how-it-works" className="text-[12px] max-[820px]:text-[11px] max-[620px]:text-sm" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="/#our-promise" className="text-[12px] max-[820px]:text-[11px] max-[620px]:text-sm" onClick={() => setMenuOpen(false)}>Our promise</a>
        </nav>

        <div className="nav-actions flex items-center gap-5 max-[820px]:gap-2.5">
          <span className="campus flex items-center gap-[7px] text-[11px]"><span className="status-dot"></span> SRM, together.</span>
          {email ? (
            <>
              <span className="user-chip" title={email}>
                <Icon id="i-lock" /> {email.split("@")[0]}
              </span>
              <button className="link-button" onClick={logout}>Log out</button>
            </>
          ) : (
            <a className="link-button" href="/login">Sign in</a>
          )}
          <a className="button button-dark px-[19px] py-3 text-[12px] max-[820px]:px-[15px] max-[820px]:py-[11px] max-[620px]:px-[13px] max-[620px]:py-[11px] max-[620px]:text-[10px] max-[620px]:gap-1.5" href="/professors" onClick={() => setMenuOpen(false)}>
            Rate a professor
            <Icon id="i-arrow-up" className="icon max-[620px]:h-[14px]! max-[620px]:w-[14px]!" />
          </a>
          <button
            className="menu-toggle hidden max-[620px]:block"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Icon id="i-menu" />
          </button>
        </div>
      </div>
    </header>
  );
}
