import type { Metadata, Viewport } from "next";
import { DM_Sans, Instrument_Serif, Manrope } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "ProfCheck — Less guessing. Better classes.",
  description:
    "ProfCheck — an independent, anonymous professor rating concept for the SRM student community.",
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
      className={`${font.variable} ${display.variable} ${serif.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
