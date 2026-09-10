"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type InfoKind = "guidelines" | "privacy";

type SiteState = {
  openRating: (profId?: string) => void;
  openInfo: (kind: InfoKind) => void;
  ratingPrefill: string;
  ratingSignal: number;
  infoKind: InfoKind | null;
  closeInfo: () => void;
};

const SiteContext = createContext<SiteState>({
  openRating: () => {},
  openInfo: () => {},
  ratingPrefill: "",
  ratingSignal: 0,
  infoKind: null,
  closeInfo: () => {},
});

export const useSite = () => useContext(SiteContext);

export function useReveal() {
  useEffect(() => {
    if (
      !("IntersectionObserver" in window) ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    document.documentElement.classList.add("js-motion");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [ratingPrefill, setRatingPrefill] = useState("");
  const [ratingSignal, setRatingSignal] = useState(0);
  const [infoKind, setInfoKind] = useState<InfoKind | null>(null);

  const openRating = useCallback((profId = "") => {
    setRatingPrefill(profId);
    setRatingSignal((n) => n + 1);
  }, []);

  const openInfo = useCallback((kind: InfoKind) => setInfoKind(kind), []);
  const closeInfo = useCallback(() => setInfoKind(null), []);

  useReveal();

  return (
    <SiteContext.Provider
      value={{ openRating, openInfo, ratingPrefill, ratingSignal, infoKind, closeInfo }}
    >
      {children}
    </SiteContext.Provider>
  );
}
