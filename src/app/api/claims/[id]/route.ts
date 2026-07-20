import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const claim = await prisma.claim.findUnique({
    where: { id },
    include: {
      diagnoses: true,
      charts: { include: { hocrFiles: true }, orderBy: { createdAt: "desc" } },
      analyses: { orderBy: { createdAt: "desc" } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!claim) return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  return NextResponse.json(claim);
}
