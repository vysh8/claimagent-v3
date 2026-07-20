import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { storeFile } from "@/lib/storage";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: claimId } = await params;

  const claim = await prisma.claim.findUnique({ where: { id: claimId } });
  if (!claim) return NextResponse.json({ error: "Claim not found" }, { status: 404 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const blobUrl = await storeFile(file.name, buffer, file.type || "application/octet-stream");

  const chart = await prisma.medicalChart.create({
    data: {
      claimId,
      fileName: file.name,
      fileType: file.type || "application/octet-stream",
      blobUrl,
      status: "UPLOADED",
    },
  });

  await prisma.claim.update({ where: { id: claimId }, data: { status: "CHART_UPLOADED" } });

  return NextResponse.json(chart, { status: 201 });
}
