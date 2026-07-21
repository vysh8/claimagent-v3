import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { storeFile } from "@/lib/storage";
import { parseHocrWords } from "@/lib/hocr-parse";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; chartId: string }> }
) {
  const { id: claimId, chartId } = await params;

  const chart = await prisma.medicalChart.findFirst({ where: { id: chartId, claimId } });
  if (!chart) return NextResponse.json({ error: "Chart not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body.extractedText !== "string" || typeof body.hocr !== "string") {
    return NextResponse.json({ error: "extractedText and hocr are required" }, { status: 400 });
  }

  const { extractedText, hocr, pageNumber } = body;

  const hocrBlobUrl = await storeFile(
    `${chart.fileName}.page${pageNumber ?? 1}.hocr.html`,
    Buffer.from(hocr, "utf-8"),
    "text/html"
  );

  const hocrFile = await prisma.hocrFile.create({
    data: {
      chartId,
      blobUrl: hocrBlobUrl,
      extractedText,
      pageNumber: Number(pageNumber) || 1,
    },
  });

  const words = parseHocrWords(hocr);
  if (words.length > 0) {
    await prisma.hocrWord.createMany({
      data: words.map((w) => ({ ...w, hocrFileId: hocrFile.id })),
    });
  }

  await prisma.medicalChart.update({ where: { id: chartId }, data: { status: "OCR_COMPLETE" } });
  await prisma.claim.update({ where: { id: claimId }, data: { status: "OCR_COMPLETE" } });

  return NextResponse.json(hocrFile, { status: 201 });
}
