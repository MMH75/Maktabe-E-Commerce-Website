import type { Category } from "@/db/schema";
import type { FormResult } from "@/lib/admin-form";
import ActionForm from "./ActionForm";
import Field, { inputClass } from "./Field";

export default function CategoryForm({
  action,
  category,
}: {
  action: (formData: FormData) => Promise<FormResult>;
  category?: Category;
}) {
  return (
    <div className="max-w-2xl rounded-2xl border border-cream-deep bg-surface p-5 shadow-sm sm:p-8">
      <ActionForm
        action={action}
        submitLabel={category ? "Save changes" : "Add category"}
        cancelHref="/admin/categories"
      >
        <Field
          label="Type"
          htmlFor="kind"
          hint="Category = kind of book (e.g. Tafseer, Booklets). Topic = subject it covers (e.g. Prayer, Family)."
        >
          <select id="kind" name="kind" defaultValue={category?.kind ?? "category"} className={inputClass}>
            <option value="category">Category</option>
            <option value="topic">Topic</option>
          </select>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name (English)" htmlFor="name">
            <input
              id="name"
              name="name"
              required
              maxLength={80}
              defaultValue={category?.name}
              className={inputClass}
            />
          </Field>
          <Field label="Name (Urdu)" htmlFor="nameUr" hint="Optional">
            <input
              id="nameUr"
              name="nameUr"
              dir="rtl"
              lang="ur"
              maxLength={80}
              defaultValue={category?.nameUr ?? ""}
              className={`${inputClass} font-urdu leading-loose`}
            />
          </Field>
        </div>

        <Field
          label="Slug"
          htmlFor="slug"
          hint="Short name used in the web address, e.g. seerat-un-nabi. Leave empty to make it from the English name."
        >
          <input
            id="slug"
            name="slug"
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            defaultValue={category?.slug}
            className={inputClass}
          />
        </Field>
      </ActionForm>
    </div>
  );
}
