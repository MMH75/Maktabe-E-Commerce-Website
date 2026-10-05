import Link from "next/link";
import { deleteOwnComment, postComment } from "@/app/products/[id]/actions";
import { getProductComments } from "@/lib/comments";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { formatDateTime } from "@/lib/orders";
import ActionButton from "./admin/ActionButton";
import CommentForm from "./CommentForm";

const URDU_SCRIPT = /[؀-ۿ]/;

/** Comments section under a book: list + form (form only for logged-in customers). */
export default async function ProductComments({ productId }: { productId: number }) {
  const [list, customer] = await Promise.all([getProductComments(productId), getCurrentCustomer()]);

  return (
    <section id="comments" className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-cream-deep bg-surface p-5 shadow-sm sm:p-8">
        <h2 className="font-heading text-2xl font-bold text-crimson">
          Comments <span className="text-lg font-semibold text-muted">({list.length})</span>
        </h2>

        <div className="mt-4">
          {customer ? (
            <>
              <p className="mb-2 text-sm text-muted">
                Commenting as <span className="font-semibold text-navy">{customer.name}</span>
              </p>
              <CommentForm action={postComment.bind(null, productId)} />
            </>
          ) : (
            <p className="rounded-xl bg-cream p-4 text-sm text-ink">
              <Link
                href={`/account/login?next=${encodeURIComponent(`/products/${productId}#comments`)}`}
                className="font-semibold text-navy underline hover:text-gold"
              >
                Log in
              </Link>{" "}
              or{" "}
              <Link
                href={`/account/register?next=${encodeURIComponent(`/products/${productId}#comments`)}`}
                className="font-semibold text-navy underline hover:text-gold"
              >
                create an account
              </Link>{" "}
              to leave a comment.
            </p>
          )}
        </div>

        {list.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No comments yet. Be the first to share your thoughts.</p>
        ) : (
          <ul className="mt-6 divide-y divide-cream-deep">
            {list.map((c) => {
              const urdu = URDU_SCRIPT.test(c.body);
              const mine = customer !== null && c.customerId === customer.id;
              return (
                <li key={c.id} className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm">
                      <span className="font-semibold text-navy">{c.authorName}</span>
                      <span className="ml-2 text-xs text-muted">{formatDateTime(c.createdAt)}</span>
                    </p>
                    {mine && (
                      <ActionButton
                        action={deleteOwnComment.bind(null, c.id)}
                        confirmMessage="Delete your comment?"
                        className="text-xs font-semibold text-muted hover:text-crimson"
                      >
                        Delete
                      </ActionButton>
                    )}
                  </div>
                  <p
                    dir="auto"
                    lang={urdu ? "ur" : undefined}
                    className={`mt-1 whitespace-pre-line text-ink/90 ${
                      urdu ? "font-urdu text-[0.95rem] leading-[2.3rem]" : "text-sm leading-relaxed"
                    }`}
                  >
                    {c.body}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
