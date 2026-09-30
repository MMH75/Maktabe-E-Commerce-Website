import Image from "next/image";
import Link from "next/link";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "About",
    links: [
      { label: "Our Story", href: "/about-us" },
      { label: "Dr Israr Ahmed (RA)", href: "/#about-dr-israr" },
      { label: "Tanzeem-e-Islami", href: "/about-us" },
    ],
  },
  {
    heading: "Quick Links",
    links: [
      { label: "All Books", href: "/all-books" },
      { label: "Read Online", href: "/read-online" },
      { label: "Our Websites", href: "/our-websites" },
    ],
  },
  {
    heading: "Contact",
    links: [
      { label: "0301 111 53 48", href: "/contact-us" },
      { label: "www.maktaba.com.pk", href: "/contact-us" },
      { label: "Lahore, Pakistan", href: "/contact-us" },
    ],
  },
  {
    heading: "Social",
    links: [
      { label: "YouTube", href: "#" },
      { label: "Facebook", href: "#" },
      { label: "WhatsApp", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t-2 border-gold bg-navy text-cream">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-surface p-1.5">
                <Image
                  src="/logo.png"
                  alt="Maktaba Khuddam-ul-Quran logo"
                  width={48}
                  height={48}
                  className="h-10 w-10 object-contain"
                />
              </div>
              <div>
                <p className="font-heading text-lg font-semibold">
                  Maktaba Khuddam-ul-Quran
                </p>
                <p className="font-urdu text-sm text-cream/80" dir="rtl">
                  مکتبہ خدام القرآن
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/70">
              Publishing and distributing the works of Dr. Israr Ahmed (RA) —
              serving the Quran and its readers with authentic Islamic
              literature since decades.
            </p>
            <div className="mt-4 h-px w-24 bg-gold/60" />
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold">
                {col.heading}
              </h3>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-cream/75 transition hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-navy-soft pt-6 sm:flex-row">
          <p className="text-xs text-cream/60">
            © {new Date().getFullYear()} Maktaba Khuddam-ul-Quran, Lahore. All
            rights reserved.
          </p>
          <p className="text-xs text-cream/60">
            Free home delivery in Pakistan · Cash on delivery
          </p>
        </div>
      </div>
    </footer>
  );
}
