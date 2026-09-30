import Image from "next/image";
import Link from "next/link";
import ActionButton from "@/components/admin/ActionButton";
import AdminHeading from "@/components/admin/AdminHeading";
import { getAllPosters } from "@/lib/posters";
import { deletePoster, movePoster, setPosterActive } from "./actions";

export const dynamic = "force-dynamic";

const arrowClass =
  "rounded-full border border-cream-deep bg-surface p-1.5 text-navy transition hover:border-navy hover:bg-navy hover:text-white";

export default async function AdminPostersPage() {
  const posters = await getAllPosters();
  const shown = posters.filter((p) => p.isActive).length;

  return (
    <>
      <AdminHeading
        title="Hero Posters"
        subtitle={`${shown} of ${posters.length} poster${posters.length === 1 ? "" : "s"} shown on the home page, in this order`}
        action={{ href: "/admin/posters/new", label: "Add poster" }}
      />

      {posters.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted/40 bg-surface p-10 text-center text-muted">
          No posters yet. The hero section is hidden until you add one.
        </div>
      ) : (
        <ol className="space-y-3">
          {posters.map((p, i) => (
            <li
              key={p.id}
              className={`flex flex-col gap-4 rounded-2xl border bg-surface p-4 shadow-sm sm:flex-row sm:items-center ${
                p.isActive ? "border-cream-deep" : "border-dashed border-muted/40"
              }`}
            >
              {/* Order */}
              <div className="flex items-center gap-2 sm:flex-col">
                <ActionButton action={movePoster.bind(null, p.id, "up")} disabled={i === 0} title="Move up" className={arrowClass}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </ActionButton>
                <span className="w-6 text-center font-heading text-lg font-bold text-navy">{i + 1}</span>
                <ActionButton
                  action={movePoster.bind(null, p.id, "down")}
                  disabled={i === posters.length - 1}
                  title="Move down"
                  className={arrowClass}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </ActionButton>
              </div>

              {/* Preview */}
              <div
                className={`relative aspect-[2.3/1] w-full shrink-0 overflow-hidden rounded-lg bg-cream sm:w-64 ${
                  p.isActive ? "" : "opacity-50 grayscale"
                }`}
              >
                <Image src={p.imageUrl} alt={p.altText} fill sizes="256px" className="object-contain" />
              </div>

              {/* Details */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-navy">{p.altText || "(no description)"}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                      p.isActive ? "bg-gold/15 text-gold" : "bg-muted/15 text-muted"
                    }`}
                  >
                    {p.isActive ? "Shown" : "Hidden"}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-muted">
                  {p.linkUrl ? <>Links to {p.linkUrl}</> : "No link"}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 whitespace-nowrap">
                <ActionButton
                  action={setPosterActive.bind(null, p.id, !p.isActive)}
                  className="rounded-full border border-navy/20 px-3 py-1.5 text-xs font-semibold text-navy hover:border-navy"
                >
                  {p.isActive ? "Hide" : "Show"}
                </ActionButton>
                <Link
                  href={`/admin/posters/${p.id}/edit`}
                  className="rounded-full border border-navy/20 px-3 py-1.5 text-xs font-semibold text-navy hover:border-navy hover:bg-navy hover:text-white"
                >
                  Edit
                </Link>
                <ActionButton
                  action={deletePoster.bind(null, p.id)}
                  confirmMessage="Delete this poster? This cannot be undone."
                  className="rounded-full border border-crimson/30 px-3 py-1.5 text-xs font-semibold text-crimson hover:bg-crimson hover:text-white"
                >
                  Delete
                </ActionButton>
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
