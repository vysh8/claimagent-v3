"use client";

import { createWorker } from "tesseract.js";

export type OcrPage = { pageNumber: number; text: string; hocr: string };

async function recognizeImageSource(
  worker: Awaited<ReturnType<typeof createWorker>>,
  source: string | Blob
): Promise<{ text: string; hocr: string }> {
  const result = await worker.recognize(source, {}, { text: true, hocr: true });
  return { text: result.data.text ?? "", hocr: result.data.hocr ?? "" };
}

async function pdfToPages(file: File): Promise<string[]> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const buf = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buf }).promise;
  const dataUrls: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    dataUrls.push(canvas.toDataURL("image/png"));
  }

  return dataUrls;
}

export async function runOcr(
  file: File,
  onProgress?: (info: { page: number; totalPages: number; status: string; progress: number }) => void
): Promise<OcrPage[]> {
  const worker = await createWorker("eng", 1, {
    logger: (m) => {
      if (onProgress) onProgress({ page: 0, totalPages: 0, status: m.status, progress: m.progress ?? 0 });
    },
  });

  try {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const sources: (string | Blob)[] = isPdf ? await pdfToPages(file) : [file];

    const pages: OcrPage[] = [];
    for (let i = 0; i < sources.length; i++) {
      onProgress?.({ page: i + 1, totalPages: sources.length, status: "recognizing", progress: 0 });
      const { text, hocr } = await recognizeImageSource(worker, sources[i]);
      pages.push({ pageNumber: i + 1, text, hocr });
    }

    return pages;
  } finally {
    await worker.terminate();
  }
}
