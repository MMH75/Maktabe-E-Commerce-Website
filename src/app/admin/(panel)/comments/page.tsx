import Link from "next/link";
import ActionButton from "@/components/admin/ActionButton";
import AdminHeading from "@/components/admin/AdminHeading";
import { getAllComments } from "@/lib/comments";
import { formatDateTime } from "@/lib/orders";
import { deleteComment, setCommentHidden } from "./actions";

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "visible", label: "Shown" },
  { value: "hidden", label: "Hidden" },
] as const;

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ show?: string }>;
}) {
  const { show: showParam } = await searchParams;
  const show = FILTERS.find((f) => f.value === showParam)?.value ?? "all";
  const rows = await getAllComments(show);

  return (
    <>
      <AdminHeading
        title="Comments"
        subtitle="Comments customers left under books. Hide a comment to remove it from the website without deleting it."
      />

      <nav aria-label="Filter comments" className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "all" ? "/admin/comments" : `/admin/comments?show=${f.value}`}
            aria-current={show === f.value ? "page" : undefined}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              show === f.value
                ? "border-gold bg-gold text-white"
                : "border-cream-deep bg-surface text-navy hover:border-gold hover:text-gold"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted/40 bg-surface p-10 text-center text-muted">
          No comments here yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map(({ comment: c, bookTitle }) => (
            <li
              key={c.id}
              className={`rounded-2xl border bg-surface p-4 shadow-sm ${
                c.isHidden ? "border-dashed border-muted/40 opacity-70" : "border-cream-deep"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold text-navy">{c.authorName}</span>
                    {c.customerId && (
                      <Link href={`/admin/customers/${c.customerId}`} className="ml-2 text-xs font-semibold text-gold hover:underline">
                        customer →
                      </Link>
                    )}
                    <span className="ml-2 text-xs text-muted">{formatDateTime(c.createdAt)}</span>
                    {c.isHidden && (
                      <span className="ml-2 rounded-full bg-muted/10 px-2 py-0.5 text-xs font-semibold text-muted">Hidden</span>
                    )}
                  </p>
                  <p className="text-xs text-muted">
                    on{" "}
                    <Link href={`/products/${c.productId}#comments`} className="font-semibold text-navy hover:text-gold">
                      {bookTitle}
                    </Link>
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <ActionButton
                    action={setCommentHidden.bind(null, c.id, !c.isHidden)}
                    className="rounded-full border border-navy/20 px-3 py-1.5 text-xs font-semibold text-navy hover:border-navy hover:bg-navy hover:text-white"
                  >
                    {c.isHidden ? "Show" : "Hide"}
                  </ActionButton>
                  <ActionButton
                    action={deleteComment.bind(null, c.id)}
                    confirmMessage="Delete this comment permanently?"
                    className="rounded-full border border-crimson/30 px-3 py-1.5 text-xs font-semibold text-crimson hover:bg-crimson hover:text-white"
                  >
                    Delete
                  </ActionButton>
                </div>
              </div>
              <p dir="auto" className="mt-2 whitespace-pre-line text-sm text-ink/90">
                {c.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
