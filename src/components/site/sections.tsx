"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icons";
import { useSite } from "./site-context";
import { num, splitSpecialization, type ProfessorRow } from "@/lib/professor";

export function Hero({
  spotlight,
}: {
  spotlight: {
    prof: ProfessorRow | null;
    review: { body: string; course: string; professor_name: string } | null;
  };
}) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    router.push(q ? `/professors?q=${encodeURIComponent(q)}` : "/professors");
  };

  const prof = spotlight.prof;
  const overall = prof ? num(prof.avg_overall) : null;
  const bars: [string, number | null][] = prof
    ? [
        ["Clarity", num(prof.avg_clarity)],
        ["Approachability", num(prof.avg_approachability)],
        ["Fair grading", num(prof.avg_grading)],
      ]
    : [];
  const tags = prof ? splitSpecialization(prof.specialization, 2) : [];
  const quote =
    spotlight.review?.body ?? "Your take could be the first one here.";

  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="container hero-grid grid grid-cols-1 min-[621px]:grid-cols-2 min-[821px]:grid-cols-[1.05fr_1fr] gap-[30px] items-center min-h-[574px] min-[1440px]:min-h-[600px] max-[1100px]:gap-[10px] max-[820px]:gap-0 max-[820px]:min-h-[470px]">
        <div className="hero-copy relative z-[2] pb-8 max-[820px]:pb-0 max-[620px]:text-center">
          <div className="hero-pill inline-flex items-center gap-[9px]">
            <Icon id="i-cap" />
            For SRM students. By design.
          </div>
          <h1 id="hero-heading">Less guessing.<br />Better <span className="headline-mark serif">classes.</span></h1>
          <p className="hero-description">The best campus advice isn’t in the brochure.<br />Find your professors. Read honest takes.<br />Walk into your next class a little wiser.</p>

          <form className="search-box" role="search" onSubmit={submit}>
            <Icon id="i-search" />
            <label className="sr-only" htmlFor="professor-search">Search professors or departments</label>
            <input
              id="professor-search"
              name="search"
              type="search"
              placeholder="Professor or department..."
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit">Find my prof</button>
          </form>
          <div className="hero-note">
            <Icon id="i-lock" />
            Your name stays out. Your perspective counts.
          </div>

          <div className="hero-community flex items-center gap-3 mt-[30px] max-[820px]:mt-[21px] max-[620px]:mt-5 max-[620px]:justify-center">
            <div className="mini-avatars flex" aria-hidden="true">
              <div className="mini-avatar">✦</div>
              <div className="mini-avatar">☺</div>
              <div className="mini-avatar">✳</div>
              <div className="mini-avatar">↗</div>
            </div>
            <p><strong>A little student-to-student wisdom.</strong><br />Made for the SRM community.</p>
          </div>
        </div>

        <div className="hero-art" aria-label="Live top-rated professor card from student reviews.">
          <div className="art-backdrop"></div>
          <div className="orbit"></div>
          <div className="back-card"></div>

          <div className="preview-card">
            <div className="preview-top"><span>The campus lowdown</span><span className="live-tag">Live rating</span></div>
            <div className="preview-person flex items-center gap-3">
              <div className="avatar"><svg aria-hidden="true"><use href="#avatar-a" /></svg></div>
              <div><h3>{prof?.name ?? "ProfCheck ledger"}</h3><p>{prof?.department ?? "SRM Kattankulathur"}</p></div>
            </div>
            <div className="preview-score flex items-center gap-[13px] pt-[21px] pb-[17px]">
              <div className="big-rating">{overall != null ? overall.toFixed(1) : "–"}<span>/ 5</span></div>
              <div><div className="stars" aria-label="Five decorative stars">★★★★★</div><div className="rating-caption">{overall != null ? "Top rated by students right now." : "No ratings yet — yours could be first."}</div></div>
            </div>
            <div className="preview-divider"></div>
            {bars.map(([label, value]) => (
              <div className="score-row" key={label}><span>{label}</span><div className="score-track"><i style={{ width: `${value != null ? (value / 5) * 100 : 0}%` }}></i></div><span>{value != null ? value.toFixed(1) : "–"}</span></div>
            ))}
            {tags.length > 0 && (
              <div className="preview-tags">{tags.map((t) => <span key={t}>{t}</span>)}</div>
            )}
          </div>

          <div className="floating-note anon-note">
            <Icon id="i-shield" />
            <div><strong>Your voice. Not your name.</strong><small>That’s the whole idea.</small></div>
          </div>
          <div className="floating-note review-note">
            <div className="stars" aria-hidden="true">★★★★★</div>
            <p>“{quote.length > 90 ? `${quote.slice(0, 90)}…` : quote}”</p>
            <small>
              {spotlight.review
                ? `Anonymous student · ${spotlight.review.course}`
                : "No reviews yet"}
            </small>
          </div>
          <svg className="art-spark" aria-hidden="true"><use href="#spark" /></svg>
          <svg className="art-spark small" aria-hidden="true"><use href="#spark" /></svg>
          <svg className="sketch-arrow" viewBox="0 0 50 75" fill="none" aria-hidden="true">
            <path d="M44 66C9 66 5 43 23 13M11 19l13-8 2 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="handwritten">good advice travels.</span>
        </div>
      </div>
    </section>
  );
}

export function CampusStrip() {
  return (
    <div className="campus-strip">
      <div className="container flex items-center justify-between gap-6 max-[620px]:grid max-[620px]:grid-cols-2 max-[620px]:gap-x-3 max-[620px]:gap-y-[17px]">
        <div className="strip-label">Big campus.<br />Better conversations.</div>
        <span className="strip-divider" aria-hidden="true"></span>
        <div className="strip-item flex items-center gap-2.5 text-[12px] font-[550] max-[820px]:text-[10px] max-[820px]:gap-1.5 max-[620px]:text-[9px] max-[620px]:gap-2"><Icon id="i-chat" />Real talk, not rumours</div>
        <div className="strip-item flex items-center gap-2.5 text-[12px] font-[550] max-[820px]:text-[10px] max-[820px]:gap-1.5 max-[620px]:text-[9px] max-[620px]:gap-2"><Icon id="i-shield" />Anonymous by intention</div>
        <div className="strip-item flex items-center gap-2.5 text-[12px] font-[550] max-[820px]:text-[10px] max-[820px]:gap-1.5 max-[620px]:text-[9px] max-[620px]:gap-2"><Icon id="i-heart" />A little help for your next semester</div>
      </div>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section className="how" id="how-it-works" aria-labelledby="how-heading">
      <div className="container">
        <div className="how-heading reveal">
          <div className="eyebrow">No complicated syllabus here</div>
          <h2 id="how-heading">A little insight. <span className="serif">A big difference.</span></h2>
          <p className="section-sub">Your next semester, with a little less uncertainty.</p>
        </div>
        <div className="steps grid min-[621px]:grid-cols-3 gap-[56px] mt-12 max-[1100px]:gap-7 max-[820px]:gap-5 max-[620px]:gap-[30px] max-[620px]:mt-[30px]">
          <article className="step reveal">
            <div className="step-visual visual-one relative flex items-center justify-center overflow-hidden h-[137px] rounded-[14px] mb-[25px] max-[620px]:h-[145px] max-[620px]:mb-[19px]" aria-hidden="true">
              <div className="mini-search"><Icon id="i-search" /> Find your next professor<span className="cursor"></span></div>
            </div>
            <h3><span className="step-number">01 /</span> Find your professor</h3>
            <p>A name, a department, a little curiosity. Start with the person behind your next class.</p>
          </article>
          <article className="step reveal">
            <div className="step-visual visual-two relative flex items-center justify-center overflow-hidden h-[137px] rounded-[14px] mb-[25px] max-[620px]:h-[145px] max-[620px]:mb-[19px]" aria-hidden="true">
              <div className="mini-rating"><span>The student perspective</span><div className="stars">★★★★★</div></div>
            </div>
            <h3><span className="step-number">02 /</span> Read between the ratings</h3>
            <p>Teaching style. Workload. Those little things that matter. Get context, not just a score.</p>
          </article>
          <article className="step reveal">
            <div className="step-visual visual-three relative flex items-center justify-center overflow-hidden h-[137px] rounded-[14px] mb-[25px] max-[620px]:h-[145px] max-[620px]:mb-[19px]" aria-hidden="true">
              <div className="mini-check"><div><Icon id="i-check" /></div><div><strong>Pass the wisdom on.</strong><small>One honest take goes a long way.</small></div></div>
            </div>
            <h3><span className="step-number">03 /</span> Leave it better</h3>
            <p>Been in that classroom? Share a thoughtful, anonymous review for the student coming after you.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

export function TrustPanel() {
  return (
    <section className="trust container" id="our-promise" aria-labelledby="promise-heading">
      <div className="trust-panel reveal grid items-center gap-[65px] rounded-[23px] px-[57px] py-[52px] text-[#f6f8ef] min-[621px]:grid-cols-[1.1fr_1fr] max-[1100px]:gap-10 max-[1100px]:p-[43px] max-[820px]:gap-[30px] max-[820px]:p-9 max-[620px]:grid-cols-1 max-[620px]:gap-8 max-[620px]:rounded-[18px] max-[620px]:px-[27px] max-[620px]:py-[31px]">
        <div className="trust-copy">
          <div className="eyebrow">An open conversation. A thoughtful space.</div>
          <h2 id="promise-heading">Honest opinions.<br /><span className="serif">Human intentions.</span></h2>
          <p>ProfCheck is designed to make campus conversations more useful. Not louder. Because good feedback helps everyone grow.</p>
          <TrustRulesLink />
        </div>
        <div className="trust-items flex flex-col gap-6 max-[620px]:gap-[23px] max-[620px]:border-t max-[620px]:border-[#ffffff12] max-[620px]:pt-[27px]">
          <div className="trust-item flex items-start gap-4">
            <div className="trust-icon"><Icon id="i-lock" /></div>
            <div><h3>Your perspective, without the spotlight.</h3><p>No name field in our review flow. Keep your feedback about the class, not your identity.</p></div>
          </div>
          <div className="trust-item flex items-start gap-4">
            <div className="trust-icon"><Icon id="i-chat" /></div>
            <div><h3>Keep it honest. Keep it kind.</h3><p>Specific experiences are helpful. Personal attacks, rumours, and identifying details aren’t.</p></div>
          </div>
          <div className="trust-item flex items-start gap-4">
            <div className="trust-icon"><Icon id="i-cap" /></div>
            <div><h3>One campus. Many perspectives.</h3><p>A rating is a starting point, not the whole story. Read with curiosity and decide for yourself.</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustRulesLink() {
  const { openInfo } = useSite();
  return (
    <button className="text-link" onClick={() => openInfo("guidelines")} style={{ background: "none", border: 0, padding: 0 }}>
      The community ground rules
      <Icon id="i-arrow" />
    </button>
  );
}

export function FinalCta() {
  return (
    <section className="final-cta container reveal relative text-center pt-3 pb-[83px] max-[620px]:pt-1.5 max-[620px]:pb-[55px]" aria-labelledby="cta-heading">
      <svg className="cta-spark" aria-hidden="true"><use href="#spark" /></svg>
      <div className="eyebrow muted">For the next person in your seat</div>
      <h2 id="cta-heading">Your two cents.<br />Someone’s <span className="serif">better semester.</span></h2>
      <p>Had a class worth talking about?<br />Turn your experience into someone else’s head start.</p>
      <a className="button button-dark" href="/professors">Rate a professor <Icon id="i-arrow-up" /></a>
      <span className="cta-note">Anonymous review flow. SRM email verification keeps outsiders out.</span>
    </section>
  );
}

export function SiteFooter() {
  const { openInfo } = useSite();
  return (
    <footer>
      <div className="container">
        <div className="footer-top flex items-center justify-between gap-[25px] max-[620px]:flex-col max-[620px]:items-start max-[620px]:gap-[23px]">
          <div className="footer-brand flex items-center gap-[22px]">
            <a className="logo inline-flex items-center gap-[9px] font-display text-[21px] font-extrabold tracking-[-1.5px]" href="/" aria-label="ProfCheck home"><svg className="logo-symbol h-[31px] w-[27px]" aria-hidden="true"><use href="#brand" /></svg><span>profcheck<span className="logo-dot">.</span></span></a>
            <p>A little clarity for campus life.</p>
          </div>
          <div className="footer-links flex items-center gap-[25px] text-[10px] text-[#777f6c] max-[620px]:flex-wrap max-[620px]:gap-5">
            <a href="/professors">Explore faculty</a>
            <button onClick={() => openInfo("guidelines")}>Community guidelines</button>
            <button onClick={() => openInfo("privacy")}>Privacy</button>
            <a href="/#how-it-works">How it works ↗</a>
          </div>
        </div>
        <div className="footer-bottom flex justify-between gap-5 mt-[25px] text-[9px] text-[#9a9f90] leading-[1.7] max-[620px]:flex-col max-[620px]:gap-[7px] max-[620px]:mt-[23px]">
          <span>© {new Date().getFullYear()} ProfCheck. An independent concept, not affiliated with SRM.</span>
          <span>Made with a little care. And a lot of campus spirit. ✳</span>
        </div>
      </div>
    </footer>
  );
}
