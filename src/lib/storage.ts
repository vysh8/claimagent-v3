import { mkdir, writeFile } from "fs/promises";
import path from "path";

const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;
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
