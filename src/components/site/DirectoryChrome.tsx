"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../app/professors/professors.module.css";
import { Icon } from "./icons";
import { signOut, useAuth } from "./use-auth";

export function DirectoryHeader({
  active,
  cta,
}: {
  active: "directory" | "none";
  cta: { label: string; href?: string; onClick?: () => void };
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const email = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", close);
    const onClick = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest(`.${styles.nav}`)) setMenuOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("click", onClick);
    };
  }, [menuOpen]);

  const logout = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <header>
      <div className={`${styles.wrap} ${styles.nav}`}>
        <a className={styles.logo} href="/" aria-label="ProfCheck home">
          <svg aria-hidden="true"><use href="#brand" /></svg>
          <span>profcheck<span>.</span></span>
        </a>
        <nav
          className={`${styles["nav-links"]}${menuOpen ? ` ${styles.open}` : ""}`}
          aria-label="Main navigation"
        >
          <a
            href="/professors"
            className={active === "directory" ? styles.active : undefined}
            aria-current={active === "directory" ? "page" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            Find a professor
          </a>
          <a href="/#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="/#our-promise" onClick={() => setMenuOpen(false)}>Our promise</a>
        </nav>
        <div className={styles["nav-end"]}>
          <span className={styles["campus-note"]}><span className={styles.dot}></span> SRM, together.</span>
          {email ? (
            <>
              <span className={styles["campus-note"]} title={email}>{email.split("@")[0]}</span>
              <button className={styles["reset-button"]} onClick={logout}>Log out</button>
            </>
          ) : (
            <a className={styles["reset-button"]} href="/login">Sign in</a>
          )}
          {cta.href ? (
            <a className={`${styles.button} ${styles["button-dark"]}`} href={cta.href} onClick={() => setMenuOpen(false)}>
              {cta.label} <Icon id="arrow-up" className={styles.icon} />
            </a>
          ) : (
            <button
              className={`${styles.button} ${styles["button-dark"]}`}
              onClick={() => {
                setMenuOpen(false);
                cta.onClick?.();
              }}
            >
              {cta.label} <Icon id="arrow-up" className={styles.icon} />
            </button>
          )}
          <button
            className={styles["menu-button"]}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Icon id="menu" className={styles.icon} />
          </button>
        </div>
      </div>
    </header>
  );
}

export function DirectoryFooter({ extra }: { extra?: React.ReactNode }) {
  return (
    <footer>
      <div className={`${styles.wrap} ${styles["footer-inner"]}`}>
        <a className={styles.logo} href="/" aria-label="ProfCheck home">
          <svg aria-hidden="true"><use href="#brand" /></svg>
          <span>profcheck<span>.</span></span>
        </a>
        <p>© {new Date().getFullYear()} ProfCheck. An independent concept, not affiliated with SRM.</p>
        <div className={styles["footer-right"]}>
          {extra}
          <a href="#main">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
