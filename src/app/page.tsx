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

export default async function Home() {
  const spotlight = await getSpotlight();
  return (
    <SiteProvider>
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
