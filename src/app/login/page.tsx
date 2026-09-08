"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Lock, MailCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { Composer, Toast, type ToastMsg } from "@/components/Composer";
import type { ComposePrefill } from "@/components/Ledger";
import { createClient } from "@/lib/supabase/client";

const RESEND_SECS = 60;

function OtpBoxes({
  value,
  onChange,
  disabled,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  disabled: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const setAt = (i: number, ch: string) => {
    const next = [...value];
    next[i] = ch.replace(/\D/g, "").slice(-1);
    onChange(next);
    if (next[i] && i < 5) refs.current[i + 1]?.focus();
  };

  return (
    <div className="otp-row" role="group" aria-label="6-digit code">
      {value.map((ch, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="otp-box mono"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={ch}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => setAt(i, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !value[i] && i > 0) {
              refs.current[i - 1]?.focus();
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const digits = e.clipboardData
              .getData("text")
              .replace(/\D/g, "")
              .slice(0, 6)
              .split("");
            if (!digits.length) return;
            const next = ["", "", "", "", "", ""];
            digits.forEach((d, j) => {
              next[j] = d;
            });
            onChange(next);
            refs.current[Math.min(digits.length, 5)]?.focus();
          }}
        />
      ))}
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/professors";

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Header composer wiring (page chrome parity)
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

  // Already signed in → bounce to destination.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace(next);
    });
  }, [router, next]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const local = email.trim().toLowerCase();
    if (!/^[^\s@]+$/.test(local)) {
      setError("ENTER YOUR COLLEGE MAIL ID.");
      return;
    }
    const addr = `${local}@srmist.edu.in`;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: addr,
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (error) {
      setError("COULDN'T SEND THE CODE. TRY AGAIN IN A MINUTE.");
      return;
    }
    setEmail(addr);
    setStep("code");
    setCooldown(RESEND_SECS);
  };

  const verify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const token = code.join("");
    if (token.length < 6) {
      setError("ENTER ALL 6 DIGITS.");
      return;
    }
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    setBusy(false);
    if (error) {
      setError("WRONG OR EXPIRED CODE. CHECK AND RETRY.");
      return;
    }
    router.replace(next);
  };

  return (
    <>
      <Header onCompose={() => openComposer()} />
      <main className="flex-1">
        <section className="ledger">
          <div className="container-x" style={{ maxWidth: 640 }}>
            <h2 className="sec-title">
              {step === "email" ? "Login." : "Check your inbox."}
            </h2>
            <p className="sec-sub">
              {step === "email" ? (
                <>Your email never appears next to a review.</>
              ) : (
                <>
                  Code sent to <b>{email}</b>.
                </>
              )}
            </p>

            <div className="slip" style={{ marginTop: 30 }}>
              {step === "email" ? (
                <form onSubmit={sendCode} noValidate>
                  <div className={`field${error ? " error" : ""}`}>
                    <label htmlFor="loginEmail">College email *</label>
                    <div className="email-row">
                      <input
                        type="text"
                        id="loginEmail"
                        placeholder="xx1234"
                        autoComplete="username"
                        value={email}
                        disabled={busy}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError(null);
                        }}
                      />
                      <span className="email-addon mono">@srmist.edu.in</span>
                    </div>
                    <p className="err">{error}</p>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={busy}
                  >
                    <MailCheck size={15} />
                    {busy ? "Sending code…" : "Send me the code"}
                  </button>
                </form>
              ) : (
                <form onSubmit={verify} noValidate>
                  <div className={`field${error ? " error" : ""}`}>
                    <label>6-digit code *</label>
                    <OtpBoxes
                      value={code}
                      onChange={(v) => {
                        setCode(v);
                        setError(null);
                      }}
                      disabled={busy}
                    />
                    <p className="err">{error}</p>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={busy}
                  >
                    <Lock size={15} />
                    {busy ? "Verifying…" : "Verify and enter"}
                  </button>
                  <div className="ta-foot">
                    <span className="ta-hint">
                      {cooldown > 0 ? (
                        <>RESEND AVAILABLE IN {cooldown}S</>
                      ) : (
                        <button
                          type="button"
                          className="link-btn"
                          disabled={busy}
                          onClick={() => sendCode()}
                        >
                          Resend the code
                        </button>
                      )}
                    </span>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => {
                        setStep("email");
                        setCode(["", "", "", "", "", ""]);
                        setError(null);
                      }}
                    >
                      <ArrowLeft size={14} /> Different email
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
