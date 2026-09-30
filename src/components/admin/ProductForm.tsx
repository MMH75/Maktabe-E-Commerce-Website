import type { Product } from "@/db/schema";
import type { FormResult } from "@/lib/admin-form";
import ActionForm from "./ActionForm";
import Field, { inputClass } from "./Field";
import ImageInput from "./ImageInput";

export default function ProductForm({
  action,
  product,
}: {
  action: (formData: FormData) => Promise<FormResult>;
  product?: Product;
}) {
  return (
    <div className="rounded-2xl border border-cream-deep bg-surface p-5 shadow-sm sm:p-8">
      <ActionForm
        action={action}
        submitLabel={product ? "Save changes" : "Add book"}
        cancelHref="/admin/products"
      >
        <Field label="Picture" htmlFor="image">
          <ImageInput currentUrl={product?.image} required={!product} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Title (English)" htmlFor="titleEn">
            <input id="titleEn" name="titleEn" required defaultValue={product?.titleEn} className={inputClass} />
          </Field>
          <Field label="Title (Urdu)" htmlFor="titleUr">
            <input
              id="titleUr"
              name="titleUr"
              required
              dir="rtl"
              lang="ur"
              defaultValue={product?.titleUr}
              className={`${inputClass} font-urdu leading-loose`}
            />
          </Field>
          <Field
            label="Slug"
            htmlFor="slug"
            hint="Unique short name for the book: lowercase letters, numbers and hyphens, e.g. bayan-ul-quran"
          >
            <input
              id="slug"
              name="slug"
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              defaultValue={product?.slug}
              className={inputClass}
            />
          </Field>
          <Field label="Author" htmlFor="author">
            <input id="author" name="author" required defaultValue={product?.author} className={inputClass} />
          </Field>
          <Field label="Price (Rs)" htmlFor="price">
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              step={1}
              required
              defaultValue={product?.price}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Description" htmlFor="description">
          <textarea
            id="description"
            name="description"
            required
            rows={6}
            defaultValue={product?.description}
            className={inputClass}
          />
        </Field>
      </ActionForm>
    </div>
  );
}
