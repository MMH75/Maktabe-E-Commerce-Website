// Helpers shared by the admin panel's server actions.

/** What an admin form action returns: nothing on success (it redirects), or an error. */
export type FormResult = { error: string } | undefined;

/** The file picked in the form's `image` input, or null if none was chosen. */
export function getUploadedImage(formData: FormData): File | null {
  const file = formData.get("image");
  return file instanceof File && file.size > 0 ? file : null;
}
