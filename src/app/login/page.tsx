"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./login.module.css";
import { IconSprite, Icon } from "@/components/site/icons";
import { createClient } from "@/lib/supabase/client";

const DOMAIN = "srmist.edu.in";
const OTP_LENGTH = 8;
const RESEND_SECONDS = 60;

type Step = "email" | "otp" | "success";

function LoginFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/professors";

  const [step, setStep] = useState<Step>("email");
  const [local, setLocal] = useState("");
  const [activeEmail, setActiveEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [messageOk, setMessageOk] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const cooldownUntil = useRef(0);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const otpRef = useRef<HTMLInputElement>(null);

  
  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session) router.replace(next);
      });
  }, [router, next]);

  useEffect(
    () => () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    },
    []
  );

  const say = (text = "", ok = false) => {
    setMessage(text);
    setMessageOk(ok);
  };

  const refreshCooldown = () => {
    const seconds = Math.max(
      0,
      Math.ceil((cooldownUntil.current - Date.now()) / 1000)
    );
    setCooldownLeft(seconds);
    if (seconds === 0 && cooldownTimer.current) {
      clearInterval(cooldownTimer.current);
      cooldownTimer.current = null;
    }
    return seconds;
  };

  const startCooldown = () => {
    cooldownUntil.current = Date.now() + RESEND_SECONDS * 1000;
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    refreshCooldown();
    cooldownTimer.current = setInterval(refreshCooldown, 1000);
  };

  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden) refreshCooldown();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showStep = (s: Step) => {
    setStep(s);
    say();
  };

  const validLocal = (value: string) =>
    /^[a-z0-9](?:[a-z0-9._+-]*[a-z0-9])?$/.test(value) &&
    !value.includes("..") &&
    value.length <= 64;

  const sendCode = async (email: string) => {
    const { error } = await createClient().auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) throw error;
  };

  const submitEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const value = local.trim().toLowerCase();
    setLocal(value);
    if (!validLocal(value)) {
      say("Enter only the part before @srmist.edu.in, for example xx1234.");
      return;
    }
    const email = `${value}@${DOMAIN}`;
    say();
    setBusy(true);
    try {
      await sendCode(email);
      setActiveEmail(email);
      setOtp("");
      startCooldown();
      showStep("otp");
      requestAnimationFrame(() => otpRef.current?.focus());
    } catch (error: unknown) {
      const status = (error as { status?: number })?.status;
      say(
        status === 429
          ? "A few too many requests. Please wait a minute before trying again."
          : "We couldn’t request a code. Check your address and connection, then try again."
      );
    } finally {
      setBusy(false);
      refreshCooldown();
    }
  };

  const pasteEmail = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData?.getData("text").trim().toLowerCase();
    if (pasted?.endsWith(`@${DOMAIN}`)) {
      event.preventDefault();
      setLocal(pasted.slice(0, -(DOMAIN.length + 1)));
      say();
    }
  };

  const cleanOtp = (value: string) => value.replace(/\D/g, "").slice(0, OTP_LENGTH);

  const resend = async () => {
    if (busy || refreshCooldown() > 0 || !activeEmail) return;
    say();
    setBusy(true);
    try {
      await sendCode(activeEmail);
      setOtp("");
      startCooldown();
      say("A new code was requested. Check your inbox and use the newest email.", true);
      otpRef.current?.focus();
    } catch (error: unknown) {
      const status = (error as { status?: number })?.status;
      say(
        status === 429
          ? "A few too many requests. Please wait a minute before trying again."
          : "We couldn’t request a code. Check your address and connection, then try again."
      );
      if (status === 429) startCooldown();
    } finally {
      setBusy(false);
      refreshCooldown();
    }
  };

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || !activeEmail) return;
    if (!new RegExp(`^[0-9]{${OTP_LENGTH}}$`).test(otp)) {
      say("Enter all 8 digits from your email.");
      otpRef.current?.focus();
      return;
    }
    say();
    setBusy(true);
    try {
      const { data, error } = await createClient().auth.verifyOtp({
        email: activeEmail,
        token: otp,
        type: "email",
      });
      if (error) throw error;
      if (!data.session) throw new Error("No authenticated session returned.");
      setOtp("");
      showStep("success");
      redirectTimer.current = setTimeout(() => {
        router.replace(next);
      }, 1600);
    } catch (error: unknown) {
      const status = (error as { status?: number })?.status;
      say(
        status === 429
          ? "Too many attempts. Please wait before trying again."
          : "That code couldn’t be verified. Check the latest email, or request a new code if it has expired."
      );
      otpRef.current?.focus();
      otpRef.current?.select();
    } finally {
      setBusy(false);
      refreshCooldown();
    }
  };

  const currentIndex = Math.min(otp.length, OTP_LENGTH - 1);

  return (
    <div className={styles.page}>
      <a className={`${styles["sr-only"]} ${styles.skip}`} href="#auth-main">Skip to sign in</a>

      <aside className={styles["story-panel"]} aria-label="About ProfCheck">
        <a className={styles.logo} href="/" aria-label="ProfCheck home">
          <svg aria-hidden="true"><use href="#brand" /></svg>
          <span>profcheck<span className={styles["logo-dot"]}>.</span></span>
        </a>

        <div className={styles["story-content"]}>
          <div className={`${styles.eyebrow} ${styles["story-eyebrow"]}`}>A little student-to-student wisdom</div>
          <h2 className={styles["story-title"]}>
            Your campus.<br />
            Your people.<br />
            Your <span className={styles.serif}>perspective.</span>
          </h2>
          <p className={styles["story-description"]}>
            The best advice usually comes from someone<br />
            who’s been in your seat. You’re in the right place.
          </p>

          <div className={styles.illustration} aria-label="Illustrated student review card">
            <div className={styles["illustration-ring"]}></div>
            <div className={styles["back-card"]}></div>
            <div className={styles["wisdom-card"]}>
              <div className={styles.eyebrow}>The student perspective</div>
              <div className={styles["card-stars"]} aria-hidden="true">★★★★★</div>
              <blockquote>“A little clarity before<br />a whole new semester.”</blockquote>
                        <div className={styles["card-author"]}>
                          <Icon id="lock" className={styles.icon} />
                          Anonymous reviews · SRM verified
                        </div>
            </div>
            <div className={styles["floating-chip"]}>
              <Icon id="shield" className={styles.icon} />
              <div>
                <strong>Good conversations start here.</strong>
                <small>A little honesty. A little care.</small>
              </div>
            </div>
            <svg className={styles["art-spark"]} aria-hidden="true"><use href="#spark" /></svg>
            <svg className={`${styles["art-spark"]} ${styles.small}`} aria-hidden="true"><use href="#spark" /></svg>
            <span className={styles.handwritten}>good advice travels.</span>
          </div>

          <div className={styles["story-bottom"]}>
            <div className={styles.community}>
              <div className={styles["mini-avatars"]} aria-hidden="true">
                <span>✦</span><span>☺</span><span>✳</span>
              </div>
              <p>
                <strong>Made for the SRM community.</strong>
                A little more prepared, together.
              </p>
            </div>
            <span>One campus.<br />Many perspectives.</span>
          </div>
        </div>

        <div className={styles["story-footer"]}>
          <span>Independent by design. Not affiliated with SRM.</span>
          <span>Made with a little care. ✳</span>
        </div>
      </aside>

      <main className={styles["auth-panel"]} id="auth-main">
        <div className={styles["auth-top"]}>
          <a className={`${styles.logo} ${styles["mobile-logo"]}`} href="/" aria-label="ProfCheck home">
            <svg aria-hidden="true"><use href="#brand" /></svg>
            <span>profcheck<span className={styles["logo-dot"]}>.</span></span>
          </a>
          <a className={styles["back-link"]} href="/professors">
            <Icon id="arrow" className={styles.icon} />
            Back to exploring
          </a>
        </div>

        <div className={styles["auth-body"]}>
          <div className={styles["step-indicator"]} aria-label="Authentication progress">
            <span className={step !== "email" || true ? styles.active : undefined} aria-hidden="true"></span>
            <span className={step !== "email" ? styles.active : undefined} aria-hidden="true"></span>
            <small>
              {step === "email" ? "Step 01 of 02" : step === "otp" ? "Step 02 of 02" : "You’re all set"}
            </small>
          </div>

          {step === "email" && (
            <section className={styles["step-panel"]} aria-labelledby="email-title">
              <div className={styles["step-icon"]}>
                <Icon id="mail" className={styles.icon} />
              </div>
              <div className={styles.eyebrow}>Your next semester starts here</div>
              <h1 id="email-title">
                A familiar email.<br />
                A fresh <span className={styles.serif}>perspective.</span>
              </h1>
              <p className={styles["auth-description"]}>
                Sign in with your SRM email. We’ll send you a one-time code. No passwords to remember.
              </p>

              <form onSubmit={submitEmail}>
                <label className={styles["field-label"]} htmlFor="email-local">
                  Your college email
                  <span>SRM community only</span>
                </label>
                <div className={styles["email-field"]}>
                  <Icon id="mail" className={styles.icon} />
                  <input
                    id="email-local"
                    name="username"
                    type="text"
                    placeholder="xx1234"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={64}
                    required
                    aria-describedby="email-help"
                    value={local}
                    disabled={busy}
                    onChange={(e) => {
                      setLocal(e.target.value);
                      say();
                    }}
                    onPaste={pasteEmail}
                  />
                  <span className={styles["email-domain"]}>@srmist.edu.in</span>
                </div>
                <p className={styles["field-help"]}>
                  <Icon id="info" className={styles.icon} />
                  Just the part before @. We’ve taken care of the rest.
                </p>
                <button className={styles["primary-button"]} type="submit" disabled={busy} aria-busy={busy}>
                  <span className={styles["button-spinner"]} aria-hidden="true"></span>
                  <span>{busy ? "Sending your code…" : "Send my code"}</span>
                  <Icon id="arrow" className={styles.icon} />
                </button>
                <p className={styles["under-button"]}>New here? Your account is created when you sign in.</p>
              </form>

              <div className={styles["privacy-note"]}>
                <Icon id="shield" className={styles.icon} />
                <div>
                  <strong>Campus access, without a public spotlight.</strong>
                  <p>
                    Your email is used to authenticate your account. It isn’t a public display name.
                    Anonymous reviews still require privacy protections in the app.
                  </p>
                </div>
              </div>
            </section>
          )}

          {step === "otp" && (
            <section className={styles["step-panel"]} aria-labelledby="otp-title">
              <div className={styles["step-icon"]}>
                <Icon id="key" className={styles.icon} />
              </div>
              <div className={styles.eyebrow}>One small step. You’re almost in.</div>
              <h1 id="otp-title" tabIndex={-1}>
                Check your inbox.<br />
                Find your <span className={styles.serif}>way in.</span>
              </h1>
              <p className={styles["auth-description"]}>
                Enter the 8-digit code from your email. Keep this tab open while you grab it.
              </p>

              <div className={styles["sent-address"]}>
                <div>
                  <Icon id="mail" className={styles.icon} />
                  <strong>{activeEmail}</strong>
                </div>
                <button
                  className={styles["edit-email"]}
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (busy) return;
                    say();
                    setOtp("");
                    showStep("email");
                  }}
                >
                  Edit
                </button>
              </div>

              <form onSubmit={verify}>
                <label className={styles["field-label"]} htmlFor="otp-input">
                  Your one-time code
                  <span>8 digits</span>
                </label>
                <div className={styles["otp-control"]}>
                  <input
                    className={styles["otp-input"]}
                    id="otp-input"
                    ref={otpRef}
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoCapitalize="none"
                    spellCheck={false}
                    minLength={OTP_LENGTH}
                    maxLength={OTP_LENGTH}
                    pattern="[0-9]{8}"
                    required
                    aria-describedby="otp-help"
                    value={otp}
                    disabled={busy}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH));
                      say();
                    }}
                  />
                  <div className={styles["otp-slots"]} aria-hidden="true">
                    {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                      <span
                        key={i}
                        className={`${styles["otp-slot"]}${otp[i] ? ` ${styles.filled}` : ""}${i === currentIndex ? ` ${styles.current}` : ""}`}
                      >
                        {otp[i] || ""}
                      </span>
                    ))}
                  </div>
                </div>
                <p className={styles["field-help"]}>
                  <Icon id="lock" className={styles.icon} />
                  This code is single-use. Never share it with anyone.
                </p>
                <button className={styles["primary-button"]} type="submit" disabled={busy} aria-busy={busy}>
                  <span className={styles["button-spinner"]} aria-hidden="true"></span>
                  <span>{busy ? "Checking your code…" : "Verify & step inside"}</span>
                  <Icon id="arrow" className={styles.icon} />
                </button>
              </form>

              <div className={styles["resend-row"]}>
                <span>Didn’t get the email?</span>
                <button type="button" disabled={busy || cooldownLeft > 0} onClick={resend}>
                  {cooldownLeft > 0 ? `Resend in ${cooldownLeft}s` : busy ? "Please wait…" : "Send a new code"}
                </button>
              </div>

              <div className={styles["inbox-tip"]}>
                <Icon id="info" className={styles.icon} />
                <p>
                  <strong>Taking the scenic route?</strong><br />
                  Check spam or junk. If you request another code, use the one from the newest email.
                </p>
              </div>
            </section>
          )}

          {step === "success" && (
            <section className={styles["step-panel"]} aria-labelledby="success-title">
              <div className={styles["success-mark"]}>
                <Icon id="check" className={styles.icon} />
              </div>
              <div className={styles.eyebrow}>A little more connected</div>
              <h1 id="success-title" tabIndex={-1}>
                You’re in.<br />
                Make yourself <span className={styles.serif}>at home.</span>
              </h1>
              <p className={styles["auth-description"]}>
                Your email is verified. A little campus wisdom is waiting on the other side.
              </p>
              <a
                className={styles["primary-button"]}
                href={next}
                onClick={() => {
                  if (redirectTimer.current) clearTimeout(redirectTimer.current);
                }}
              >
                Explore the professors
                <Icon id="arrow" className={styles.icon} />
              </a>
              <p className={styles["under-button"]}>Taking you there in a moment…</p>
            </section>
          )}

          <p className={`${styles.message}${messageOk ? ` ${styles["success-message"]}` : ""}`} role="status" aria-live="polite" aria-atomic="true">
            {message}
          </p>
        </div>

        <footer className={styles["auth-footer"]}>
          <span>© {new Date().getFullYear()} ProfCheck.<br />A little clarity for campus life.</span>
          <a href="/#our-promise">Our promise ↗</a>
        </footer>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <IconSprite />
      <Suspense>
        <LoginFlow />
      </Suspense>
    </>
  );
}
