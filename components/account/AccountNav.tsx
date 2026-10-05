"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/account", label: "Profile", exact: true },
  { href: "/account/orders", label: "My Orders" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/wishlist", label: "Wishlist" },
];

export default function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="My account" className="flex flex-wrap gap-1 lg:flex-col">
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition lg:rounded-lg ${
              active ? "bg-gold text-white" : "text-navy hover:bg-cream"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
