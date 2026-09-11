import { IconSprite } from "@/components/site/icons";
import { SiteProvider } from "@/components/site/site-context";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Dialogs } from "@/components/site/dialogs";
import {
  CampusStrip,
  FinalCta,
  Hero,
  HowItWorks,
  SiteFooter,
  TrustPanel,
} from "@/components/site/sections";
import { getSpotlight } from "@/lib/directory";

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://profcheck.app";

export default async function Home() {
  const spotlight = await getSpotlight();
  return (
    <SiteProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "ProfCheck",
            url: SITE_URL,
            description:
              "Anonymous, student-run professor ratings for SRM Kattankulathur.",
            potentialAction: {
              "@type": "SearchAction",
              target: `${SITE_URL}/professors?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
      <IconSprite />
      <a href="#main" className="sr-only">Skip to content</a>
      <SiteHeader />
      <main id="main">
        <Hero spotlight={spotlight} />
        <CampusStrip />
        <HowItWorks />
        <TrustPanel />
        <FinalCta />
      </main>
      <SiteFooter />
      <Dialogs />
    </SiteProvider>
  );
}
