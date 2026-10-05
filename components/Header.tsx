"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";

type MenuItem = { name: string; slug: string };

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "All Books", href: "/all-books" },
  { label: "Read Online", href: "/read-online" },
  { label: "Our Websites", href: "/our-websites" },
  { label: "About Us", href: "/about-us" },
  { label: "Contact Us", href: "/contact-us" },
];

const ICON_BUTTON =
  "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/40 text-white transition hover:border-gold hover:text-gold";

const BADGE =
  "absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-white";

export default function Header({ categories, topics }: { categories: MenuItem[]; topics: MenuItem[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  // `trailingSlash` builds produce "/about-us/"; strip it to match NAV_LINKS
  const rawPathname = usePathname();
  const pathname = rawPathname.length > 1 ? rawPathname.replace(/\/+$/, "") : rawPathname;
  const { cartCount, wishlist, setCartOpen, customer } = useStore();

  const isActive = (href: string) =>
    href === "/all-books"
      ? pathname === "/all-books" || pathname.startsWith("/category/") || pathname.startsWith("/topic/")
      : pathname === href;

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const browseLinks = (onClick?: () => void) => (
    <>
      <Link href="/all-books" onClick={onClick} className="block rounded-lg px-3 py-2 text-sm font-semibold text-navy hover:bg-cream">
        All books
      </Link>
      {categories.length > 0 && (
        <>
          <p className="eyebrow px-3 pb-1 pt-3 text-muted">Categories</p>
          {categories.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} onClick={onClick} className="block rounded-lg px-3 py-1.5 text-sm text-ink hover:bg-cream hover:text-navy">
              {c.name}
            </Link>
          ))}
        </>
      )}
      {topics.length > 0 && (
        <>
          <p className="eyebrow px-3 pb-1 pt-3 text-muted">Topics</p>
          {topics.map((t) => (
            <Link key={t.slug} href={`/topic/${t.slug}`} onClick={onClick} className="block rounded-lg px-3 py-1.5 text-sm text-ink hover:bg-cream hover:text-navy">
              {t.name}
            </Link>
          ))}
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-gold/80 bg-navy shadow-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Brand — left */}
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
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
            <span className="block max-w-[8.5rem] font-heading text-[15px] font-bold text-white sm:max-w-none sm:text-lg lg:max-w-[9.5rem] lg:text-base xl:max-w-none xl:text-xl">
              Maktaba Khuddam-ul-Quran
            </span>
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-gold sm:block lg:hidden xl:block">
              Official Book Store
            </span>
          </span>
        </Link>

        {/* Navigation — desktop */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            const className = `rounded-full px-2.5 py-2 text-sm font-semibold transition xl:px-3 xl:text-[15px] ${
              active ? "bg-gold text-white" : "text-white/85 hover:text-white"
            }`;
            if (link.href !== "/all-books") {
              return (
                <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={className}>
                  {link.label}
                </Link>
              );
            }
            // "All Books" opens a list of categories and topics on hover / keyboard focus
            return (
              <div key={link.href} className="group relative">
                <Link href={link.href} aria-current={active ? "page" : undefined} aria-haspopup="true" className={`${className} inline-flex items-center gap-1`}>
                  {link.label}
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 opacity-70" aria-hidden>
                    <path d="M5.2 7.2a.75.75 0 0 1 1.06 0L10 10.94l3.74-3.74a.75.75 0 1 1 1.06 1.06l-4.27 4.27a.75.75 0 0 1-1.06 0L5.2 8.26a.75.75 0 0 1 0-1.06Z" />
                  </svg>
                </Link>
                <div className="invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <div className="max-h-[70vh] w-60 overflow-y-auto rounded-xl border border-cream-deep bg-surface p-2 shadow-xl">
                    {browseLinks()}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Actions — right */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            aria-label="Search books"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
            className={ICON_BUTTON}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[18px] w-[18px]">
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m20 20-3.5-3.5" />
            </svg>
          </button>

          <Link
            href={customer ? "/account" : "/account/login"}
            aria-label={customer ? `My account (${customer.name})` : "Log in"}
            title={customer ? `My account (${customer.name})` : "Log in / Sign up"}
            className={`${ICON_BUTTON} hidden sm:flex`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <circle cx="12" cy="8" r="4" />
              <path strokeLinecap="round" d="M4 21a8 8 0 0 1 16 0" />
            </svg>
            {customer && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-navy" />}
          </Link>

          <Link href="/wishlist" aria-label="Wishlist" className={`${ICON_BUTTON} hidden sm:flex`}>
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
            {wishlist.length > 0 && <span className={BADGE}>{wishlist.length}</span>}
          </Link>

          <button aria-label="Open cart" onClick={() => setCartOpen(true)} className={ICON_BUTTON}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.5 2M7 13h10l3-8H5.5M7 13 5.5 5M7 13l-1.2 4.8h13.4M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
              />
            </svg>
            {cartCount > 0 && <span className={BADGE}>{cartCount}</span>}
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

      {/* Search bar */}
      {searchOpen && (
        <div className="border-t border-white/10 bg-navy">
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get("q")?.toString().trim();
              if (!q) return;
              setSearchOpen(false);
              setMenuOpen(false);
              router.push(`/search?q=${encodeURIComponent(q)}`);
            }}
            className="mx-auto flex max-w-3xl gap-2 px-4 py-3 sm:px-6"
          >
            <input
              ref={searchRef}
              type="search"
              name="q"
              maxLength={100}
              placeholder="Search by title (English or Urdu) or author"
              aria-label="Search books"
              onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
              className="w-full rounded-full border border-white/20 bg-white px-5 py-2 text-sm text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/40"
            />
            <button type="submit" className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-navy">
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile / tablet menu */}
      {menuOpen && (
        <nav className="max-h-[calc(100vh-72px)] overflow-y-auto border-t border-white/10 bg-navy lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-full px-4 py-2.5 text-sm font-semibold ${
                      active ? "bg-gold text-white" : "text-white/85 hover:bg-navy-soft"
                    }`}
                  >
                    {link.label}
                  </Link>
                  {link.href === "/all-books" && (categories.length > 0 || topics.length > 0) && (
                    <div className="mx-4 my-1 rounded-xl bg-surface p-2">{browseLinks(() => setMenuOpen(false))}</div>
                  )}
                </div>
              );
            })}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-white/10 pt-3 sm:hidden">
              <Link
                href={customer ? "/account" : "/account/login"}
                onClick={() => setMenuOpen(false)}
                className="rounded-full border border-white/30 px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                {customer ? "My account" : "Log in / Sign up"}
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMenuOpen(false)}
                className="rounded-full border border-white/30 px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                Wishlist{wishlist.length > 0 ? ` (${wishlist.length})` : ""}
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
