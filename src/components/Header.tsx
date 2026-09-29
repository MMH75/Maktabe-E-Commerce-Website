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

const ICON_BUTTON =
  "relative flex h-9 w-9 items-center justify-center rounded-full border sm:h-10 sm:w-10 border-white/40 text-white transition hover:border-gold hover:text-gold";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { cartCount, wishlist, setCartOpen } = useStore();

  return (
    <header className="sticky top-0 z-40 border-b border-gold/80 bg-navy shadow-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand — left */}
        <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          {/* Navy line-art emblem on a transparent background — recoloured to white for the dark header */}
          <Image
            src="/logo3.png"
            alt="Maktaba Khuddam-ul-Quran logo"
            width={48}
            height={48}
            className="h-10 w-10 shrink-0 object-contain brightness-0 invert sm:h-12 sm:w-12"
            priority
          />
          <span className="leading-tight">
            <span className="block max-w-[8.5rem] font-heading text-[15px] font-bold text-white sm:max-w-none sm:text-lg xl:text-xl">
              Maktaba Khuddam-ul-Quran
            </span>
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-gold sm:block">
              Official Book Store
            </span>
          </span>
        </Link>

        {/* Navigation — desktop */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-2.5 py-2 text-sm font-semibold transition xl:px-4 xl:text-[15px] ${
                  active
                    ? "bg-gold text-white"
                    : "text-white/85 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions — right */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button aria-label="Wishlist" className={ICON_BUTTON}>
            <svg
              viewBox="0 0 24 24"
              fill={wishlist.length > 0 ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.8"
              className={`h-5 w-5 ${wishlist.length > 0 ? "text-gold" : ""}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.6c0 5.2-7.7 9.9-9 10.7-1.3-.8-9-5.5-9-10.7A4.9 4.9 0 0 1 7.9 3.7 5.1 5.1 0 0 1 12 5.8a5.1 5.1 0 0 1 4.1-2.1A4.9 4.9 0 0 1 21 8.6Z"
              />
            </svg>
            {wishlist.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-white">
                {wishlist.length}
              </span>
            )}
          </button>

          <button
            aria-label="Open cart"
            onClick={() => setCartOpen(true)}
            className={ICON_BUTTON}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.5 2M7 13h10l3-8H5.5M7 13 5.5 5M7 13l-1.2 4.8h13.4M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>

          {/* Hamburger — below desktop */}
          <button
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className={`${ICON_BUTTON} lg:hidden`}
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile / tablet menu */}
      {menuOpen && (
        <nav className="border-t border-white/10 bg-navy lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-4 py-2.5 text-sm font-semibold ${
                    active ? "bg-gold text-white" : "text-white/85 hover:bg-navy-soft"
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
