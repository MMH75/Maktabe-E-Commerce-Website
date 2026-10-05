"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SORTS, type SortValue } from "@/lib/sorts";

/** Changes ?sort= in the address, keeping the rest (e.g. ?q= on search). */
export default function SortSelect({ value }: { value: SortValue }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      Sort by
      <select
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          if (e.target.value === "default") next.delete("sort");
          else next.set("sort", e.target.value);
          const query = next.toString();
          router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
        }}
        className="rounded-full border border-cream-deep bg-surface px-3 py-1.5 text-sm font-semibold text-navy outline-none focus:border-gold"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}
