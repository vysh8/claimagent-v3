import Link from "next/link";
import { prisma } from "@/lib/db";
import Header from "@/components/Header";

const RATE = { base: 7000, rw: { "871": 1.9425, "872": 1.0299 } as Record<string, number> };
const fmt = (n: number | null) => (n == null ? "—" : "$" + n.toLocaleString());
const payFor = (drg: string) => (RATE.rw[drg] ? Math.round(RATE.rw[drg] * RATE.base) : null);

const STATUS_LABEL: Record<string, string> = {
  NEW: "New",
  CHART_UPLOADED: "Chart uploaded",
  OCR_COMPLETE: "Ready for review",
  ANALYZED: "Analyzed",
  REVIEWED: "Reviewed",
};

export default async function ClaimsPage() {
  const claims = await prisma.claim.findMany({
    orderBy: { createdAt: "desc" },
    include: { diagnoses: true },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-6 max-w-5xl w-full mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="serif text-2xl font-semibold">Review queue</h1>
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              Claims routed after a prepay DRG sepsis edit fires.
            </p>
          </div>
          <Link href="/claims/new" className="btn btn-primary">
            + New claim
          </Link>
        </div>

        <div className="rounded-[14px] border overflow-hidden" style={{ borderColor: "var(--line)", background: "var(--card)" }}>
          {claims.length === 0 && (
            <div className="p-8 text-center text-sm" style={{ color: "var(--ink-faint)" }}>
              No claims yet. Create one to get started.
            </div>
          )}
          {claims.map((c) => (
            <Link
              key={c.id}
              href={`/claims/${c.id}`}
              className="flex items-center gap-4 px-5 py-4 border-b last:border-b-0 hover:bg-black/[0.02] transition"
              style={{ borderColor: "var(--line-soft)" }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="mono text-xs" style={{ color: "var(--ink-soft)" }}>
                    {c.claimNumber}
                  </span>
                  <span className="font-semibold text-sm truncate">{c.patientName}</span>
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>
                  <b style={{ color: "var(--ink-soft)" }}>DRG {c.drgBilled}</b> · {c.patientDemo} ·{" "}
                  {c.diagnoses.length} coded diagnos{c.diagnoses.length === 1 ? "is" : "es"}
                </div>
              </div>
              <span className="mono text-xs" style={{ color: "var(--ink-soft)" }}>
                {fmt(payFor(c.drgBilled))}
              </span>
              <span className="chip pending">{STATUS_LABEL[c.status] ?? c.status}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
