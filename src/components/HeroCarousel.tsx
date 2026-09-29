"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const SLIDES = [ //hero section picttures. the omre u add, the more will appear
  { src: "/poster1.png", alt: "Mukhtasar Bayan-ul-Quran promotion" },
  { src: "/poster2.png", alt: "Seerat-un-Nabi series promotion" },
  { src: "/poster3.png", alt: "Bayan-ul-Quran 4 volume set promotion" },
];

const AUTO_MS = 5000;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((i: number) => {
    setIndex(((i % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  const restart = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, AUTO_MS);
  }, []);

  useEffect(() => {
    restart();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [restart]);

  return (
    <section aria-label="Featured promotions" className="bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* Compact banner — capped at 320px tall so the books below stay in view */}
        <div className="relative overflow-hidden rounded-2xl border border-cream-deep bg-[#f5f2ea] shadow-sm">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {SLIDES.map((slide, i) => (
              <div
                key={slide.src}
                className="relative aspect-[2.3/1] max-h-[320px] w-full shrink-0"
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  sizes="(max-width: 1280px) 100vw, 1216px"
                  priority={i === 0}
                  className="object-contain"
                />
              </div>
            ))}
          </div>

          {/* Arrows */}
          <button
            aria-label="Previous slide"
            onClick={() => {
              go(index - 1);
              restart();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-navy shadow-md transition hover:bg-navy hover:text-white sm:left-5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            aria-label="Next slide"
            onClick={() => {
              go(index + 1);
              restart();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-navy shadow-md transition hover:bg-navy hover:text-white sm:right-5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => {
                  go(i);
                  restart();
                }}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-gold" : "w-2 bg-navy/25 hover:bg-navy/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
