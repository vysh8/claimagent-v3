import { mkdir, writeFile } from "fs/promises";
import path from "path";

// @vercel/blob authenticates either via BLOB_READ_WRITE_TOKEN or, when a store
// is connected to this project, automatically via Vercel's OIDC token + BLOB_STORE_ID.
const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN || !!process.env.BLOB_STORE_ID;
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function storeFile(
  fileName: string,
  data: Buffer,
  contentType: string
): Promise<string> {
  const key = `${Date.now()}-${Math.random().toString(36).slice(2)}-${fileName}`;

  if (USE_BLOB) {
    const { put } = await import("@vercel/blob");
    const blob = await put(key, data, { access: "public", contentType });
    return blob.url;
  }

  await mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(LOCAL_UPLOAD_DIR, key), data);
  return `/uploads/${key}`;
}
