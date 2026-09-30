"use client";

import { useEffect, useState, type ChangeEvent } from "react";

/** File picker that previews the chosen image (or the current one when editing). */
export default function ImageInput({
  currentUrl,
  required,
  wide,
}: {
  currentUrl?: string;
  required?: boolean;
  wide?: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  const shown = preview ?? currentUrl;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-cream-deep bg-cream ${
          wide ? "aspect-[2.3/1] w-full sm:w-72" : "aspect-square w-36"
        }`}
      >
        {shown ? (
          // Plain <img>: blob: previews can't go through next/image
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="Preview" className="h-full w-full object-contain" />
        ) : (
          <span className="px-3 text-center text-xs text-muted">No image chosen</span>
        )}
      </div>
      <div className="text-sm">
        <input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          required={required}
          onChange={onChange}
          className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-navy file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-gold"
        />
        <p className="mt-2 text-xs text-muted">
          JPG, PNG, WEBP, GIF or AVIF, up to 5 MB.
          {currentUrl && " Leave empty to keep the current image."}
        </p>
      </div>
    </div>
  );
}
