import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  anthropic,
  MODEL,
  ANALYZE_SYSTEM_PROMPT,
  buildAnalyzePrompt,
  payFor,
} from "@/lib/anthropic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: claimId } = await params;

  const claim = await prisma.claim.findUnique({
    where: { id: claimId },
    include: {
      diagnoses: true,
      charts: { include: { hocrFiles: { orderBy: { pageNumber: "asc" } } }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!claim) return NextResponse.json({ error: "Claim not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const customRecord: string | undefined = body?.customRecord;

  const latestChart = claim.charts[0];
  const extractedText =
    customRecord ??
    latestChart?.hocrFiles.map((h) => h.extractedText).join("\n\n") ??
    "";

  if (!extractedText.trim()) {
    return NextResponse.json(
      { error: "No medical record text available. Upload and OCR a chart, or supply customRecord." },
      { status: 400 }
    );
  }

  const userPrompt = buildAnalyzePrompt({
    name: claim.patientName,
    demo: claim.patientDemo,
    drgBilled: claim.drgBilled,
    drgBilledDesc: claim.drgBilledDesc,
    diagnoses: claim.diagnoses,
    record: extractedText,
  });

  let parsed: {
    steps: unknown;
    disposition: string;
    drgFinal: string;
    verdict: string;
    narrative: string;
    recommend: string;
    guidelines_applied: unknown;
  };

  try {
    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: ANALYZE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const raw = resp.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const clean = raw.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(clean);
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: "AI analysis failed", message: (err as Error).message }, { status: 502 });
  }

  const billedPay = payFor(claim.drgBilled);
  const finalPay = parsed.disposition === "pend" ? null : payFor(parsed.drgFinal);
  const swing = billedPay && finalPay ? billedPay - finalPay : billedPay ? billedPay - (payFor("872") ?? 0) : null;

  const payment = {
    billedDrg: claim.drgBilled,
    billedPay,
    finalDrg: parsed.drgFinal,
    finalPay,
    impact: parsed.disposition === "validate" ? 0 : swing,
    impactType: parsed.disposition === "validate" ? "zero" : parsed.disposition === "pend" ? "risk" : "pos",
  };

  const analysis = await prisma.analysisResult.create({
    data: {
      claimId,
      steps: parsed.steps as object,
      disposition: parsed.disposition,
      drgFinal: parsed.drgFinal,
      verdict: parsed.verdict,
      narrative: parsed.narrative,
      recommend: parsed.recommend,
      guidelinesApplied: parsed.guidelines_applied as object,
      payment,
    },
  });

  await prisma.claim.update({ where: { id: claimId }, data: { status: "ANALYZED" } });

  return NextResponse.json(analysis, { status: 201 });
}
