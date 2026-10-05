import type { Category, Product } from "@/db/schema";
import type { FormResult } from "@/lib/admin-form";
import ActionForm from "./ActionForm";
import Field, { inputClass } from "./Field";
import ImageInput from "./ImageInput";

export default function ProductForm({
  action,
  product,
  categories,
  selectedCategoryIds = [],
}: {
  action: (formData: FormData) => Promise<FormResult>;
  product?: Product;
  categories: Category[];
  selectedCategoryIds?: number[];
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
          <Field
            label="Sale price (Rs)"
            htmlFor="salePrice"
            hint="Optional. Must be lower than the price. Leave empty when the book is not on sale."
          >
            <input
              id="salePrice"
              name="salePrice"
              type="number"
              min={0}
              step={1}
              defaultValue={product?.salePrice ?? ""}
              className={inputClass}
            />
          </Field>
          <Field
            label="Stock"
            htmlFor="stock"
            hint="Copies available. At 0 the book shows as “Out of stock” and cannot be added to the cart."
          >
            <input
              id="stock"
              name="stock"
              type="number"
              min={0}
              step={1}
              required
              defaultValue={product?.stock ?? 0}
              className={inputClass}
            />
          </Field>
        </div>

        <fieldset className="rounded-xl border border-cream-deep p-4 sm:p-5">
          <legend className="px-2 text-sm font-semibold text-navy">
            Book details <span className="font-normal text-muted">(optional — shown on the book page)</span>
          </legend>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Number of pages" htmlFor="pages">
              <input
                id="pages"
                name="pages"
                type="number"
                min={1}
                step={1}
                defaultValue={product?.pages ?? ""}
                className={inputClass}
              />
            </Field>
            <Field label="Paper quality" htmlFor="paperQuality" hint="e.g. 65 gram matte">
              <input
                id="paperQuality"
                name="paperQuality"
                maxLength={100}
                defaultValue={product?.paperQuality ?? ""}
                className={inputClass}
              />
            </Field>
            <Field label="Weight (grams)" htmlFor="weight" hint="e.g. 1800 for 1.8 kg">
              <input
                id="weight"
                name="weight"
                type="number"
                min={1}
                step={1}
                defaultValue={product?.weight ?? ""}
                className={inputClass}
              />
            </Field>
          </div>
        </fieldset>

        {(["category", "topic"] as const).map((kind) => {
          const options = categories.filter((c) => c.kind === kind);
          const label = kind === "category" ? "Categories" : "Topics";
          return (
            <fieldset key={kind} className="rounded-xl border border-cream-deep p-4 sm:p-5">
              <legend className="px-2 text-sm font-semibold text-navy">
                {label} <span className="font-normal text-muted">(optional — tick all that apply)</span>
              </legend>
              {options.length === 0 ? (
                <p className="text-sm text-muted">
                  No {label.toLowerCase()} yet. Add them under “Categories” in the menu above.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {options.map((c) => (
                    <label
                      key={c.id}
                      className="flex cursor-pointer items-center gap-2 rounded-full border border-cream-deep px-3 py-1.5 text-sm text-ink transition hover:border-gold has-[:checked]:border-gold has-[:checked]:bg-gold/10 has-[:checked]:font-semibold has-[:checked]:text-navy"
                    >
                      <input
                        type="checkbox"
                        name="categoryIds"
                        value={c.id}
                        defaultChecked={selectedCategoryIds.includes(c.id)}
                        className="h-4 w-4 accent-[var(--mk-gold)]"
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              )}
            </fieldset>
          );
        })}

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
