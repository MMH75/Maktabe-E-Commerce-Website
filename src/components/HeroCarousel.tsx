"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type HeroSlide = {
  id: number;
  src: string;
  alt: string;
  href: string | null;
};

const AUTO_MS = 5000;

// Slides come from the `posters` table (see src/lib/posters.ts)
export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const count = slides.length;

  const go = useCallback(
    (i: number) => {
      setIndex(((i % count) + count) % count);
    },
    [count],
  );

  const restart = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    if (count < 2) return;
    timer.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, AUTO_MS);
  }, [count]);

  useEffect(() => {
    restart();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [restart]);

  if (count === 0) return null;

  return (
    <section aria-label="Featured promotions" className="bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* Compact banner — capped at 320px tall so the books below stay in view */}
        <div className="relative overflow-hidden rounded-2xl border border-cream-deep bg-[#f5f2ea] shadow-sm">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {slides.map((slide, i) => {
              const image = (
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  sizes="(max-width: 1280px) 100vw, 1216px"
                  priority={i === 0}
                  className="object-contain"
                />
              );
              return (
                <div
                  key={slide.id}
                  className="relative aspect-[2.3/1] max-h-[320px] w-full shrink-0"
                >
                  {slide.href ? (
                    <Link href={slide.href} tabIndex={i === index ? 0 : -1}>
                      {image}
                    </Link>
                  ) : (
                    image
                  )}
                </div>
              );
            })}
          </div>

          {count > 1 && (
            <>
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
                {slides.map((_, i) => (
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
            </>
          )}
        </div>
      </div>
    </section>
  );
}
