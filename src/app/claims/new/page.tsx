"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

type DiagRow = { code: string; desc: string; role: "PDX" | "MCC" | "CC" };

const emptyRow = (): DiagRow => ({ code: "", desc: "", role: "MCC" });

export default function NewClaimPage() {
  const router = useRouter();
  const [claimNumber, setClaimNumber] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientDemo, setPatientDemo] = useState("");
  const [drgBilled, setDrgBilled] = useState("871");
  const [drgBilledDesc, setDrgBilledDesc] = useState("Sepsis w/o MV >96h — WITH MCC");
  const [charge, setCharge] = useState("");
  const [diagnoses, setDiagnoses] = useState<DiagRow[]>([
    { code: "", desc: "", role: "PDX" },
    emptyRow(),
  ]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateRow(i: number, patch: Partial<DiagRow>) {
    setDiagnoses((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const cleanDiagnoses = diagnoses.filter((d) => d.code.trim() && d.desc.trim());

    const res = await fetch("/api/claims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        claimNumber,
        patientName,
        patientDemo,
        drgBilled,
        drgBilledDesc,
        charge: Number(charge) || 0,
        diagnoses: cleanDiagnoses,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to create claim");
      return;
    }

    const claim = await res.json();
    router.push(`/claims/${claim.id}`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-6 max-w-2xl w-full mx-auto">
        <h1 className="serif text-2xl font-semibold mb-1">New claim</h1>
        <p className="text-sm mb-6" style={{ color: "var(--ink-soft)" }}>
          Enter the claim as submitted. Upload the medical chart on the next screen to run OCR and the review agent.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Claim number">
              <input required value={claimNumber} onChange={(e) => setClaimNumber(e.target.value)} className="input" placeholder="CLM-SEP-0301" />
            </Field>
            <Field label="Billed charge ($)">
              <input required type="number" value={charge} onChange={(e) => setCharge(e.target.value)} className="input" placeholder="42000" />
            </Field>
            <Field label="Patient name">
              <input required value={patientName} onChange={(e) => setPatientName(e.target.value)} className="input" placeholder="J. Doe" />
            </Field>
            <Field label="Demographics">
              <input value={patientDemo} onChange={(e) => setPatientDemo(e.target.value)} className="input" placeholder="70 F · 5-day LOS · POS 21" />
            </Field>
            <Field label="Billed DRG">
              <select value={drgBilled} onChange={(e) => setDrgBilled(e.target.value)} className="input">
                <option value="871">871 — Sepsis w/ MCC</option>
                <option value="872">872 — Sepsis w/o MCC</option>
              </select>
            </Field>
            <Field label="Billed DRG description">
              <input value={drgBilledDesc} onChange={(e) => setDrgBilledDesc(e.target.value)} className="input" />
            </Field>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--ink-soft)" }}>
                Coded diagnoses
              </label>
              <button type="button" className="btn-ghost btn-sm" onClick={() => setDiagnoses((r) => [...r, emptyRow()])}>
                + Add row
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {diagnoses.map((d, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="input flex-shrink-0 w-28 mono"
                    placeholder="A41.9"
                    value={d.code}
                    onChange={(e) => updateRow(i, { code: e.target.value })}
                  />
                  <input
                    className="input flex-1"
                    placeholder="Sepsis, unspecified organism"
                    value={d.desc}
                    onChange={(e) => updateRow(i, { desc: e.target.value })}
                  />
                  <select
                    className="input flex-shrink-0 w-24"
                    value={d.role}
                    onChange={(e) => updateRow(i, { role: e.target.value as DiagRow["role"] })}
                  >
                    <option value="PDX">PDX</option>
                    <option value="MCC">MCC</option>
                    <option value="CC">CC</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm" style={{ color: "var(--rose)" }}>{error}</p>}

          <button type="submit" disabled={submitting} className="btn btn-primary self-start mt-2">
            {submitting ? "Creating…" : "Create claim"}
          </button>
        </form>
      </main>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid var(--line);
          background: var(--card);
          border-radius: 8px;
          padding: 8px 11px;
          font-size: 13px;
          font-family: inherit;
        }
        .input:focus {
          outline: none;
          border-color: var(--primary);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--ink-soft)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
