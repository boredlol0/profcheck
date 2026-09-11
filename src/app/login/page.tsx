import LoginFlow from "@/components/LoginFlow";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to ProfCheck with your SRM college email. One-time code, no passwords — your email never appears next to a review.",
  alternates: { canonical: "/login" },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginFlow />
    </Suspense>
  );
}
