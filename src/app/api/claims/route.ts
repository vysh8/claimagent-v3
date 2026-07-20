import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { DiagnosisRole } from "@/generated/prisma/enums";

export async function GET() {
  const claims = await prisma.claim.findMany({
    orderBy: { createdAt: "desc" },
    include: { diagnoses: true },
  });
  return NextResponse.json(claims);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const { claimNumber, patientName, patientDemo, drgBilled, drgBilledDesc, charge, diagnoses } = body;

  if (!claimNumber || !patientName || !drgBilled || !Array.isArray(diagnoses) || diagnoses.length === 0) {
    return NextResponse.json(
      { error: "claimNumber, patientName, drgBilled, and at least one diagnosis are required" },
      { status: 400 }
    );
  }

  const existing = await prisma.claim.findUnique({ where: { claimNumber } });
  if (existing) {
    return NextResponse.json({ error: "A claim with this claim number already exists" }, { status: 409 });
  }

  const claim = await prisma.claim.create({
    data: {
      claimNumber,
      patientName,
      patientDemo: patientDemo ?? "",
      drgBilled,
      drgBilledDesc: drgBilledDesc ?? "",
      charge: Number(charge) || 0,
      diagnoses: {
        create: diagnoses.map((d: { code: string; desc: string; role: string }) => ({
          code: d.code,
          desc: d.desc,
          role: d.role as DiagnosisRole,
        })),
      },
    },
    include: { diagnoses: true },
  });

  return NextResponse.json(claim, { status: 201 });
}
