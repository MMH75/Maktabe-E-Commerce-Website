import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

// Uploaded images are stored on the server's disk in `<project>/uploads` and
// served by src/app/uploads/[file]/route.ts. To move to a storage service
// (Vercel Blob, Cloudinary, S3…), only this file needs to change.

export const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const PUBLIC_PREFIX = "/uploads/";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

// Only names we generated ourselves: <uuid>.<ext>
export const UPLOAD_NAME = /^[0-9a-f-]{36}\.(jpg|png|webp|gif|avif)$/;

/** Returns an error message, or null if the file is an acceptable image. */
export function validateImage(file: File): string | null {
  if (!IMAGE_TYPES[file.type]) return "Image must be JPG, PNG, WEBP, GIF or AVIF.";
  if (file.size > MAX_IMAGE_BYTES) return "Image must be 5 MB or smaller.";
  return null;
}

/** Saves an uploaded image and returns the URL to store in the database. */
export async function saveImage(file: File): Promise<string> {
  const name = `${randomUUID()}.${IMAGE_TYPES[file.type]}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return PUBLIC_PREFIX + name;
}

/**
 * Deletes an image previously returned by saveImage. URLs that point elsewhere
 * (e.g. the original images in /public) are left alone.
 */
export async function deleteImage(url: string): Promise<void> {
  if (!url.startsWith(PUBLIC_PREFIX)) return;
  const name = url.slice(PUBLIC_PREFIX.length);
  if (!UPLOAD_NAME.test(name)) return;
  try {
    await unlink(path.join(UPLOAD_DIR, name));
  } catch (err) {
    console.error("Failed to delete image", url, err);
  }
}

export async function readUpload(name: string): Promise<Buffer | null> {
  if (!UPLOAD_NAME.test(name)) return null;
  try {
    return await readFile(path.join(UPLOAD_DIR, name));
  } catch {
    return null;
  }
}
