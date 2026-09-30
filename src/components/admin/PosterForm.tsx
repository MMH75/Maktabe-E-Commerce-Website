import type { Poster } from "@/db/schema";
import type { FormResult } from "@/lib/admin-form";
import ActionForm from "./ActionForm";
import Field, { inputClass } from "./Field";
import ImageInput from "./ImageInput";

export default function PosterForm({
  action,
  poster,
}: {
  action: (formData: FormData) => Promise<FormResult>;
  poster?: Poster;
}) {
  return (
    <div className="rounded-2xl border border-cream-deep bg-surface p-5 shadow-sm sm:p-8">
      <ActionForm
        action={action}
        submitLabel={poster ? "Save changes" : "Add poster"}
        cancelHref="/admin/posters"
      >
        <Field label="Poster image" htmlFor="image" hint="Best shape is wide, about 2.3 : 1 (e.g. 1840 × 800 px).">
          <ImageInput currentUrl={poster?.imageUrl} required={!poster} wide />
        </Field>

        <Field
          label="Description (alt text)"
          htmlFor="altText"
          hint="Short description of the poster, read out by screen readers. e.g. Seerat-un-Nabi series promotion"
        >
          <input id="altText" name="altText" required defaultValue={poster?.altText} className={inputClass} />
        </Field>

        <Field
          label="Link (optional)"
          htmlFor="linkUrl"
          hint="Page to open when the poster is clicked, e.g. /products/3 or /all-books. Leave empty for no link."
        >
          <input id="linkUrl" name="linkUrl" defaultValue={poster?.linkUrl ?? ""} className={inputClass} />
        </Field>

        <label className="flex items-center gap-2 text-sm font-semibold text-navy">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={poster?.isActive ?? true}
            className="h-4 w-4 accent-[var(--mk-gold)]"
          />
          Show on the home page
        </label>
      </ActionForm>
    </div>
  );
}
