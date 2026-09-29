"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "All Books", href: "/all-books" },
  { label: "Read Online", href: "/read-online" },
  { label: "Our Websites", href: "/our-websites" },
  { label: "About Us", href: "/about-us" },
  { label: "Contact Us", href: "/contact-us" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { cartCount, wishlist, setCartOpen } = useStore();

  return (
    <header className="sticky top-0 z-40 shadow-sm">
      {/* Top strip */}
      <div className="relative border-b border-gold/30 bg-[#FFFFFF]">
        <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="relative z-10 flex h-full shrink-0 items-center">
            <Image
              src="/logo.png"
              alt="Maktaba Khuddam-ul-Quran logo"
              width={64}
              height={64}
              className="h-full w-auto object-contain"
              priority
            />
          </Link>

          <Link
            href="/"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <Image
              src="/name.png"
              alt="مکتبہ خدام القرآن"
              width={280}
              height={80}
              className="h-10 w-auto object-contain sm:h-12 md:h-14"
              priority
            />
          </Link>

          {/* Actions — right */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              aria-label="Wishlist"
              className="relative rounded-full p-2 text-emerald-deep transition hover:bg-cream"
            >
              <svg
                viewBox="0 0 24 24"
                fill={wishlist.length > 0 ? "#C9A24D" : "none"}
                stroke={wishlist.length > 0 ? "#C9A24D" : "currentColor"}
                strokeWidth="1.8"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.6c0 5.2-7.7 9.9-9 10.7-1.3-.8-9-5.5-9-10.7A4.9 4.9 0 0 1 7.9 3.7 5.1 5.1 0 0 1 12 5.8a5.1 5.1 0 0 1 4.1-2.1A4.9 4.9 0 0 1 21 8.6Z"
                />
              </svg>
              {wishlist.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-deep px-1 text-[10px] font-semibold text-cream">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              aria-label="Open cart"
              onClick={() => setCartOpen(true)}
              className="relative rounded-full p-2 text-emerald-deep transition hover:bg-cream"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.5 2M7 13h10l3-8H5.5M7 13 5.5 5M7 13l-1.2 4.8h13.4M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-emerald-deep">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Hamburger — mobile only */}
            <button
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-full p-2 text-emerald-deep transition hover:bg-cream md:hidden"
            >
              {menuOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                  <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation bar — desktop */}
      <nav className="hidden bg-emerald-deep md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-5 py-3 text-sm font-medium tracking-wide transition ${
                  active
                    ? "text-gold"
                    : "text-cream/90 hover:bg-forest hover:text-white"
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute inset-x-5 bottom-1.5 h-px bg-gold" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="bg-emerald-deep md:hidden">
          <div className="flex flex-col px-4 py-2">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`border-b border-forest/50 px-2 py-3 text-sm font-medium last:border-0 ${
                    active ? "text-gold" : "text-cream/90"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
