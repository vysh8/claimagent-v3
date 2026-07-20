import Link from "next/link";
import { prisma } from "@/lib/db";
import AppShell from "@/components/AppShell";

export const dynamic = "force-dynamic";

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

const DISPO_PILL: Record<string, { label: string; cls: string }> = {
  validate: { label: "Validated", cls: "validate" },
  recode: { label: "Recode", cls: "recode" },
  pend: { label: "Pend — query", cls: "pend" },
};

export default async function ClaimsPage() {
  const claims = await prisma.claim.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      diagnoses: true,
      analyses: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const analyzedCount = claims.filter((c) => c.analyses[0]).length;
  const pendedCount = claims.filter((c) => c.analyses[0]?.disposition === "pend").length;
  const recovered = claims.reduce((sum, c) => {
    const a = c.analyses[0];
    if (!a || a.disposition !== "recode") return sum;
    const payment = a.payment as { impact?: number };
    return sum + (payment.impact ?? 0);
  }, 0);

  return (
    <AppShell>
      <div className="flex items-center justify-between px-6 py-3.5 border-b" style={{ borderColor: "var(--line)", background: "var(--card)" }}>
        <div>
          <h1 className="text-base font-medium">Review queue</h1>
          <div className="text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>
            Prepay sepsis edits routed for validation
          </div>
        </div>
        <Link href="/claims/new" className="btn btn-primary">
          + New claim
        </Link>
      </div>

      <div className="px-6 py-5">
        <div className="grid grid-cols-4 gap-3 mb-5">
          <div className="rounded-[10px] p-3.5" style={{ background: "var(--card)", border: "0.5px solid var(--line)" }}>
            <div className="text-[11px] uppercase tracking-wide mb-1.5" style={{ color: "var(--ink-faint)" }}>
              Total claims
            </div>
            <div className="mono text-xl font-medium">{claims.length}</div>
          </div>
          <div className="rounded-[10px] p-3.5" style={{ background: "var(--card)", border: "0.5px solid var(--line)" }}>
            <div className="text-[11px] uppercase tracking-wide mb-1.5" style={{ color: "var(--ink-faint)" }}>
              Analyzed
            </div>
            <div className="mono text-xl font-medium">{analyzedCount}</div>
          </div>
          <div className="rounded-[10px] p-3.5" style={{ background: "var(--card)", border: "0.5px solid var(--line)" }}>
            <div className="text-[11px] uppercase tracking-wide mb-1.5" style={{ color: "var(--ink-faint)" }}>
              Pended for query
            </div>
            <div className="mono text-xl font-medium" style={{ color: pendedCount > 0 ? "var(--warn)" : undefined }}>
              {pendedCount}
            </div>
          </div>
          <div className="rounded-[10px] p-3.5" style={{ background: "var(--card)", border: "0.5px solid var(--line)" }}>
            <div className="text-[11px] uppercase tracking-wide mb-1.5" style={{ color: "var(--ink-faint)" }}>
              Recovered (recode)
            </div>
            <div className="mono text-xl font-medium">{fmt(recovered)}</div>
          </div>
        </div>

        <div className="rounded-[10px] overflow-hidden" style={{ border: "0.5px solid var(--line)", background: "var(--card)" }}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                {["Claim", "Patient", "Billed DRG", "Diagnoses", "Status", "Impact"].map((h, i) => (
                  <th
                    key={h}
                    className="text-left px-4 py-2.5 text-[11px] uppercase tracking-wide font-medium"
                    style={{ color: "var(--ink-faint)", borderBottom: "0.5px solid var(--line)", textAlign: i === 5 ? "right" : "left" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {claims.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-sm py-10" style={{ color: "var(--ink-faint)" }}>
                    No claims yet. Create one to get started.
                  </td>
                </tr>
              )}
              {claims.map((c) => {
                const a = c.analyses[0];
                const dispo = a ? DISPO_PILL[a.disposition] : null;
                const payment = a?.payment as { impact?: number } | undefined;
                return (
                  <tr key={c.id} className="hover:bg-black/[0.015] cursor-pointer">
                    <td className="px-4 py-3 mono text-xs" style={{ borderBottom: "0.5px solid var(--line-soft)" }}>
                      <Link href={`/claims/${c.id}`} className="block">
                        {c.claimNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3" style={{ borderBottom: "0.5px solid var(--line-soft)" }}>
                      <Link href={`/claims/${c.id}`} className="block font-medium">
                        {c.patientName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 mono" style={{ borderBottom: "0.5px solid var(--line-soft)" }}>
                      {c.drgBilled}
                    </td>
                    <td className="px-4 py-3" style={{ borderBottom: "0.5px solid var(--line-soft)" }}>
                      {c.diagnoses.length} coded
                    </td>
                    <td className="px-4 py-3" style={{ borderBottom: "0.5px solid var(--line-soft)" }}>
                      <span className={`chip ${dispo?.cls ?? "pending"}`}>{dispo?.label ?? STATUS_LABEL[c.status] ?? c.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right mono font-medium" style={{ borderBottom: "0.5px solid var(--line-soft)" }}>
                      {payment?.impact != null ? fmt(payment.impact) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
