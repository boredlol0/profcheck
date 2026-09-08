import type { Metadata, Viewport } from "next";
import { Archivo, Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const serif = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const sans = Archivo({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const viewport: Viewport = {
  themeColor: "#131210",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: "ProfCheck: the anonymous professor ledger of SRM KTR",
  description:
    "Anonymous, student-run professor reviews for SRM Kattankulathur. Honest feedback on teaching, grading and attendance. Verified SRM emails. No names, no trace.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 26 26'><rect width='26' height='26' rx='4' fill='%23C6881F'/><path d='M6 13.5l4.5 4.5L20 8' stroke='%23221D12' stroke-width='3.2' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
