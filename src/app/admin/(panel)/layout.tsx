import type { ReactNode } from "react";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import { logout } from "../login/actions";

// Pages in this group are only reachable when logged in (see src/proxy.ts).
export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="bg-navy-soft">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <p className="eyebrow text-gold">Admin Panel</p>
            <AdminNav />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs font-semibold text-white/70 hover:text-white">
              View website →
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white hover:text-navy"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
    </>
  );
}
