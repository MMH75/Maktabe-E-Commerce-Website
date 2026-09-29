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
    <section
      aria-label="Featured promotions"
      className="relative w-full overflow-hidden bg-emerald-deep"
    >
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            className="relative h-[420px] w-full shrink-0 sm:h-[500px] lg:h-[620px]"
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="100vw"
              priority={i === 0}
              className="object-contain bg-[#f5f2ea] p-2 sm:p-4"
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
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-emerald-deep/60 p-2 text-cream backdrop-blur transition hover:bg-emerald-deep sm:left-5"
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
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-emerald-deep/60 p-2 text-cream backdrop-blur transition hover:bg-emerald-deep sm:right-5"
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
              i === index ? "w-6 bg-gold" : "w-2 bg-cream/60 hover:bg-cream"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
