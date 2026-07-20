import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const VALID_STATUSES = ["UPLOADED", "OCR_PROCESSING", "OCR_COMPLETE", "FAILED"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; chartId: string }> }
) {
  const { id: claimId, chartId } = await params;
  const body = await req.json().catch(() => null);

  if (!body || !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: `status must be one of ${VALID_STATUSES.join(", ")}` }, { status: 400 });
  }

  const chart = await prisma.medicalChart.findFirst({ where: { id: chartId, claimId } });
  if (!chart) return NextResponse.json({ error: "Chart not found" }, { status: 404 });

  const updated = await prisma.medicalChart.update({
    where: { id: chartId },
    data: { status: body.status },
  });

  return NextResponse.json(updated);
}
