import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { anthropic, MODEL, CHAT_SYSTEM_PROMPT } from "@/lib/anthropic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: claimId } = await params;

  const claim = await prisma.claim.findUnique({
    where: { id: claimId },
    include: {
      diagnoses: true,
      analyses: { orderBy: { createdAt: "desc" }, take: 1 },
      charts: { include: { hocrFiles: true }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!claim) return NextResponse.json({ error: "Claim not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const message: string | undefined = body?.message;
  if (!message) return NextResponse.json({ error: "message is required" }, { status: 400 });

  const analysis = claim.analyses[0];
  const record = claim.charts[0]?.hocrFiles.map((h) => h.extractedText).join("\n\n") ?? "";

  const priorMessages = await prisma.chatMessage.findMany({
    where: { claimId },
    orderBy: { createdAt: "asc" },
  });

  const context = `CLAIM UNDER REVIEW:
Patient: ${claim.patientName} (${claim.patientDemo})
Billed DRG: ${claim.drgBilled} — ${claim.drgBilledDesc}
Coded diagnoses:
${claim.diagnoses.map((d) => "  " + d.code + " — " + d.desc + " [" + d.role + "]").join("\n")}

MEDICAL RECORD:
${record}

VALIDATION ANALYSIS RESULT:
${analysis ? JSON.stringify(analysis, null, 2) : "No analysis has been run yet."}`;

  const apiMessages = [
    { role: "user" as const, content: context + "\n\n---\nThe above is the context for this review. I will now ask follow-up questions." },
    { role: "assistant" as const, content: "I have the full claim, medical record, and validation analysis in front of me. What would you like to know?" },
    ...priorMessages.map((m) => ({ role: m.role.toLowerCase() as "user" | "assistant", content: m.content })),
    { role: "user" as const, content: message },
  ];

  await prisma.chatMessage.create({
    data: { claimId, analysisId: analysis?.id, role: "USER", content: message },
  });

  try {
    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1000,
      system: CHAT_SYSTEM_PROMPT,
      messages: apiMessages,
    });

    const reply = resp.content.map((b) => (b.type === "text" ? b.text : "")).join("");

    await prisma.chatMessage.create({
      data: { claimId, analysisId: analysis?.id, role: "ASSISTANT", content: reply },
    });

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({ error: "AI chat failed", message: (err as Error).message }, { status: 502 });
  }
}
