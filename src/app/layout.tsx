import type { Metadata, Viewport } from "next";
import { DM_Sans, Instrument_Serif, Manrope, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const font = DM_Sans({
  variable: "--font",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const display = Manrope({
  variable: "--display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const serif = Instrument_Serif({
  variable: "--serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const viewport: Viewport = {
  themeColor: "#f7f8f2",
  colorScheme: "light",
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://profcheck.app";

const TITLE = "ProfCheck — Less guessing. Better classes.";
const DESCRIPTION =
  "Anonymous, student-run professor ratings for SRM Kattankulathur. Know your faculty before you walk in — verified SRM emails, no names, no trace.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — ProfCheck",
  },
  description: DESCRIPTION,
  keywords: [
    "SRM professor reviews",
    "SRM faculty ratings",
    "ProfCheck",
    "SRM Kattankulathur",
    "anonymous professor rating",
    "SRMIST",
  ],
  authors: [{ name: "ProfCheck Student Collective" }],
  creator: "ProfCheck Student Collective",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    type: "website",
    siteName: "ProfCheck",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "ProfCheck — anonymous professor ratings for SRM students",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 38 42'><path fill='%23d4f67a' stroke='%2323271e' stroke-width='1.5' d='m19 2 5 5 7 1 1 7 4 6-4 6-1 7-7 1-5 5-5-5-7-1-1-7-4-6 4-6 1-7 7-1Z'/><path d='m11 21 5 5 11-11' fill='none' stroke='%2323271e' stroke-width='2.7' stroke-linecap='round' stroke-linejoin='round'/></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(font.variable, display.variable, serif.variable, "font-sans", geist.variable)}
    >
      <body>{children}</body>
    </html>
  );
}
