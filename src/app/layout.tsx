import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Samhita Pathan — Where every shloka comes alive", template: "%s · Samhita Pathan" },
  description: "Listen, recite, understand, and remember Charaka Samhita—one carefully guided shloka at a time.",
  applicationName: "Samhita Pathan",
  keywords: ["Charaka Samhita", "Sanskrit", "Ayurveda education", "shloka", "recitation"],
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#fdfbf9" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to main content</a>{children}</body></html>;
}
