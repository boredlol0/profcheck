"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Ledger, type ComposePrefill } from "@/components/Ledger";
import { Footer } from "@/components/Sections";
import { Composer, Toast, type ToastMsg } from "@/components/Composer";

export default function ProfessorsPage() {
  const [composerOpen, setComposerOpen] = useState(false);
  const [prefill, setPrefill] = useState<ComposePrefill>({});
  const [composerKey, setComposerKey] = useState(0);
  const [toast, setToast] = useState<ToastMsg>(null);
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

  return (
    <>
      <Header onCompose={() => openComposer()} />
      <main className="flex-1">
        <Ledger onCompose={openComposer} />
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
