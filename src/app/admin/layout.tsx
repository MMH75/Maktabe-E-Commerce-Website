import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Admin Panel — Maktaba Khuddam-ul-Quran",
  robots: { index: false, follow: false },
};

// Shared by the login page and the panel. The panel's header (nav + Log out)
// lives in (panel)/layout.tsx so it never shows on the login page.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="bg-cream/60">{children}</div>;
}
