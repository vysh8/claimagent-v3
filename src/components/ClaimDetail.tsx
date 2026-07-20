"use client";

import { useEffect, useRef, useState } from "react";
import { runOcr } from "@/lib/ocr-client";

type Diagnosis = { id: string; code: string; desc: string; role: "PDX" | "MCC" | "CC" };
type HocrFile = { id: string; extractedText: string; pageNumber: number; blobUrl: string | null };
type Chart = { id: string; fileName: string; fileType: string; status: string; hocrFiles: HocrFile[] };
type AnalysisStep = { s: "pass" | "fail" | "warn"; t: string; d: string; e: string; cite: string };
type Analysis = {
  id: string;
  steps: AnalysisStep[];
  disposition: "validate" | "recode" | "pend";
  drgFinal: string;
  verdict: string;
  narrative: string;
  recommend: string;
  guidelinesApplied: string[];
  payment: {
    billedPay: number | null;
    finalPay: number | null;
    impact: number | null;
    impactType: "zero" | "risk" | "pos";
  };
};
type ChatMessage = { id: string; role: "USER" | "ASSISTANT"; content: string };
type Claim = {
  id: string;
  claimNumber: string;
  patientName: string;
  patientDemo: string;
  drgBilled: string;
  drgBilledDesc: string;
  charge: number;
  diagnoses: Diagnosis[];
  charts: Chart[];
  analyses: Analysis[];
  messages: ChatMessage[];
};

const RATE = { base: 7000, rw: { "871": 1.9425, "872": 1.0299 } as Record<string, number> };
const fmt = (n: number | null | undefined) => (n == null ? "—" : "$" + n.toLocaleString());
const payFor = (drg: string) => (RATE.rw[drg] ? Math.round(RATE.rw[drg] * RATE.base) : null);
const ICONS: Record<string, string> = { pass: "✓", fail: "✕", warn: "⚠" };
const DISPO_LABEL: Record<string, string> = { validate: "Validated", recode: "Recode-down", pend: "Pend — query" };

export default function ClaimDetail({ initialClaim }: { initialClaim: Claim }) {
  const [claim, setClaim] = useState<Claim>(initialClaim);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrStatus, setOcrStatus] = useState("");
  const [ocrError, setOcrError] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>(initialClaim.messages);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const latestChart = claim.charts[0];
  const record = latestChart?.hocrFiles.map((h) => h.extractedText).join("\n\n") ?? "";
  const analysis = claim.analyses[0];
  const billedPay = payFor(claim.drgBilled);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  async function refreshClaim() {
    const res = await fetch(`/api/claims/${claim.id}`);
    if (res.ok) setClaim(await res.json());
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setOcrBusy(true);
    setOcrError(false);
    setOcrStatus("Uploading chart…");

    try {
      const form = new FormData();
      form.append("file", file);
      const chartRes = await fetch(`/api/claims/${claim.id}/charts`, { method: "POST", body: form });
      if (!chartRes.ok) {
        const body = await chartRes.json().catch(() => ({}));
        throw new Error(body.error || `Chart upload failed (${chartRes.status})`);
      }
      const chart = await chartRes.json();

      const pages = await runOcr(file, (info) => {
        setOcrStatus(
          info.totalPages > 1
            ? `OCR page ${info.page}/${info.totalPages} — ${info.status} (${Math.round(info.progress * 100)}%)`
            : `${info.status} (${Math.round(info.progress * 100)}%)`
        );
      });

      for (const page of pages) {
        const hocrRes = await fetch(`/api/claims/${claim.id}/charts/${chart.id}/hocr`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ extractedText: page.text, hocr: page.hocr, pageNumber: page.pageNumber }),
        });
        if (!hocrRes.ok) {
          const body = await hocrRes.json().catch(() => ({}));
          throw new Error(body.error || `Failed to save OCR output for page ${page.pageNumber} (${hocrRes.status})`);
        }
      }

      setOcrStatus("OCR complete");
      await refreshClaim();
    } catch (err) {
      console.error("Chart upload/OCR failed:", err);
      setOcrError(true);
      setOcrStatus(`Error: ${(err as Error).message}`);
    } finally {
      setOcrBusy(false);
    }
  }

  async function runAgent() {
    setAnalyzing(true);
    setVisibleSteps(0);
    try {
      const res = await fetch(`/api/claims/${claim.id}/analyze`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Analysis failed");
      }
      await refreshClaim();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setAnalyzing(false);
    }
  }

  useEffect(() => {
    if (!analysis) return;
    setVisibleSteps(0);
    const total = analysis.steps.length;
    const timer = setInterval(() => {
      setVisibleSteps((n) => {
        if (n >= total) {
          clearInterval(timer);
          return n;
        }
        return n + 1;
      });
    }, 250);
    return () => clearInterval(timer);
  }, [analysis?.id]);

  async function sendChat() {
    const text = chatInput.trim();
    if (!text || sendingChat) return;
    setChatInput("");
    setSendingChat(true);
    setLocalMessages((m) => [...m, { id: `local-${Date.now()}`, role: "USER", content: text }]);

    try {
      const res = await fetch(`/api/claims/${claim.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setLocalMessages((m) => [
        ...m,
        { id: `local-${Date.now()}-r`, role: "ASSISTANT", content: data.reply || data.error || "No response" },
      ]);
    } catch (err) {
      setLocalMessages((m) => [...m, { id: `local-${Date.now()}-e`, role: "ASSISTANT", content: `Error: ${(err as Error).message}` }]);
    } finally {
      setSendingChat(false);
    }
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="serif text-2xl font-semibold">{claim.patientName}</h1>
        <div className="text-sm" style={{ color: "var(--ink-soft)" }}>
          Claim <span className="mono">{claim.claimNumber}</span> · {claim.patientDemo} · billed charge{" "}
          <span className="mono">{fmt(claim.charge)}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <div className="flex flex-col gap-3.5">
          {/* Claim as submitted */}
          <div className="rounded-[14px] border overflow-hidden" style={{ borderColor: "var(--line)", background: "var(--card)" }}>
            <div className="px-4 py-3 border-b text-xs uppercase tracking-wide font-semibold" style={{ borderColor: "var(--line-soft)", color: "var(--ink-soft)" }}>
              📄 Claim as submitted
            </div>
            <div className="p-4">
              <div
                className="flex items-center gap-3 rounded-[9px] p-3.5 mb-3.5 text-white"
                style={{ background: "linear-gradient(135deg,#11302c,#0a4d45)" }}
              >
                <div>
                  <div className="text-[10px] uppercase tracking-wide opacity-70">Billed DRG</div>
                  <div className="mono text-xl font-semibold">{claim.drgBilled}</div>
                </div>
                <div className="flex-1 text-xs opacity-90">{claim.drgBilledDesc}</div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wide opacity-70">Pays</div>
                  <div className="mono text-base font-semibold">{fmt(billedPay)}</div>
                </div>
              </div>

              {claim.diagnoses.map((d) => (
                <div key={d.id} className="flex items-center gap-2 py-1.5 border-b border-dashed last:border-b-0 text-sm" style={{ borderColor: "var(--line-soft)" }}>
                  <span className="dx-code">{d.code}</span>
                  <span className="flex-1">{d.desc}</span>
                  <span className={`dx-role role-${d.role.toLowerCase()}`}>{d.role}</span>
                </div>
              ))}
              <div className="mt-2.5 text-[11px]" style={{ color: "var(--ink-faint)" }}>
                RW {RATE.rw[claim.drgBilled] ?? "—"} × ${RATE.base.toLocaleString()} base · FY2026 V43.0
              </div>
            </div>
          </div>

          {/* Medical chart / record */}
          <div className="rounded-[14px] border overflow-hidden" style={{ borderColor: "var(--line)", background: "var(--card)" }}>
            <div className="px-4 py-3 border-b flex items-center justify-between text-xs uppercase tracking-wide font-semibold" style={{ borderColor: "var(--line-soft)", color: "var(--ink-soft)" }}>
              <span>🩺 Medical chart</span>
              <button className="btn-ghost btn-sm" disabled={ocrBusy} onClick={() => fileInputRef.current?.click()}>
                {latestChart ? "Upload new chart" : "Upload chart"}
              </button>
              <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleFileSelected} />
            </div>
            <div className="p-4">
              {(ocrBusy || ocrError) && ocrStatus && (
                <div
                  className="text-xs mb-3 flex items-center gap-2"
                  style={{ color: ocrError ? "var(--rose)" : "var(--ink-soft)" }}
                >
                  {ocrBusy && <span className="spinner" />} {ocrStatus}
                </div>
              )}
              {!latestChart && !ocrBusy && (
                <div className="text-center text-sm py-8" style={{ color: "var(--ink-faint)" }}>
                  No chart uploaded yet. Upload a PDF or image — OCR runs in your browser and the extracted text plus the
                  HOCR file are stored against this claim.
                </div>
              )}
              {latestChart && (
                <>
                  <div className="text-xs mb-2 flex items-center gap-2" style={{ color: "var(--ink-faint)" }}>
                    <span className="mono">{latestChart.fileName}</span>
                    <span className="chip pending">{latestChart.status.replace("_", " ").toLowerCase()}</span>
                  </div>
                  <div className="mono text-xs whitespace-pre-wrap p-3 rounded-lg max-h-80 overflow-y-auto" style={{ color: "var(--ink-soft)", background: "rgba(28,32,36,.02)" }}>
                    {record || "(no extracted text yet)"}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div>
          {/* Agent analysis */}
          <div className="rounded-[14px] border overflow-hidden" style={{ borderColor: "var(--line)", background: "var(--card)" }}>
            <div className="px-4 py-3 border-b text-xs uppercase tracking-wide font-semibold" style={{ borderColor: "var(--line-soft)", color: "var(--ink-soft)" }}>
              🤖 Agent analysis
            </div>
            <div className="p-4 border-b" style={{ borderColor: "var(--line-soft)" }}>
              <button className="btn btn-primary" disabled={analyzing || !record} onClick={runAgent}>
                {analyzing ? (
                  <>
                    <span className="spinner" /> Running…
                  </>
                ) : analysis ? (
                  "▶ Re-run agent"
                ) : (
                  "▶ Run agent"
                )}
              </button>
              {!record && (
                <div className="text-xs mt-2" style={{ color: "var(--ink-faint)" }}>
                  Upload a medical chart first so the agent has a record to review.
                </div>
              )}
              {!analysis && record && !analyzing && (
                <div className="text-sm mt-3" style={{ color: "var(--ink-faint)" }}>
                  Claude will analyze the medical record against each coded diagnosis using Sepsis-3, ICD-10-CM Official
                  Guidelines, AHA Coding Clinic, and UHDDS reporting criteria — then return a citation-backed
                  disposition.
                </div>
              )}
            </div>

            <div className="px-4">
              {analysis &&
                analysis.steps.slice(0, visibleSteps).map((s, i) => (
                  <div className="step" key={i}>
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`step-dot dot-${s.s}`}>{ICONS[s.s]}</div>
                      {i < analysis.steps.length - 1 && <div className="step-line" />}
                    </div>
                    <div className="pb-1">
                      <div className="step-title">{s.t}</div>
                      <div className="step-detail">{s.d}</div>
                      {s.cite && <div className="step-cite">📖 {s.cite}</div>}
                      {s.e && <div className="evidence">{s.e}</div>}
                    </div>
                  </div>
                ))}

              {analysis && visibleSteps >= analysis.steps.length && (
                <div className={`dispo ${analysis.disposition}`}>
                  <div className="dispo-label">{DISPO_LABEL[analysis.disposition]}</div>
                  <div className="dispo-verdict">{analysis.verdict}</div>
                  <div className="fin">
                    <div className="fin-box">
                      <div className="fin-lbl">Billed</div>
                      <div className="fin-amt">{fmt(analysis.payment.billedPay)}</div>
                    </div>
                    <div className="fin-box">
                      <div className="fin-lbl">{analysis.disposition === "pend" ? "Pending" : "Should pay"}</div>
                      <div className="fin-amt">{fmt(analysis.payment.finalPay)}</div>
                    </div>
                    <div className="fin-box">
                      <div className="fin-lbl">
                        {analysis.disposition === "validate" ? "Adjustment" : analysis.disposition === "pend" ? "At risk" : "Recovered"}
                      </div>
                      <div
                        className="fin-amt"
                        style={{
                          color:
                            analysis.payment.impactType === "zero"
                              ? "var(--emerald)"
                              : analysis.payment.impactType === "risk"
                              ? "var(--amber)"
                              : "var(--rose)",
                        }}
                      >
                        {analysis.payment.impact === 0 ? "$0" : (analysis.disposition === "pend" ? "≥ " : "") + fmt(analysis.payment.impact)}
                      </div>
                    </div>
                  </div>
                  <div className="narrative">
                    <span className="nh">Clinical finding</span>
                    <div dangerouslySetInnerHTML={{ __html: analysis.narrative }} />
                    <div className="mt-2">
                      <span className="nh">Recommended action</span>
                      {analysis.recommend}
                    </div>
                  </div>
                  {analysis.guidelinesApplied?.length > 0 && (
                    <div className="guidelines-list">
                      <b>Guidelines applied:</b> {analysis.guidelinesApplied.join(" · ")}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="h-3" />
          </div>

          {/* Chat */}
          {analysis && (
            <div className="mt-3.5 rounded-[14px] border overflow-hidden" style={{ borderColor: "var(--line)", background: "var(--card)" }}>
              <div className="px-4 py-2.5 border-b text-xs uppercase tracking-wide font-semibold" style={{ borderColor: "var(--line-soft)", color: "var(--ink-soft)" }}>
                💬 Follow-up questions
              </div>
              <div className="px-4 py-3 max-h-72 overflow-y-auto">
                {localMessages.length === 0 && (
                  <div className="text-center text-xs py-4" style={{ color: "var(--ink-faint)" }}>
                    Ask any question about this analysis — coding logic, guideline rationale, documentation gaps, or
                    what-if scenarios.
                  </div>
                )}
                {localMessages.map((m) => (
                  <div key={m.id} className={`chat-msg ${m.role === "USER" ? "user" : "agent"} flex gap-2.5 mb-3`}>
                    <div className="avatar">{m.role === "USER" ? "You" : "CA"}</div>
                    <div className="text-sm pt-0.5 flex-1" style={{ color: m.role === "USER" ? "var(--ink)" : "var(--ink-soft)" }}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {sendingChat && (
                  <div className="text-xs italic flex items-center gap-2" style={{ color: "var(--ink-faint)" }}>
                    <span className="spinner" /> Thinking…
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2 px-4 py-2.5 border-t" style={{ borderColor: "var(--line-soft)" }}>
                <input
                  className="flex-1 rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--line)", background: "var(--card)" }}
                  placeholder="Ask about this analysis…"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChat()}
                  disabled={sendingChat}
                />
                <button className="btn btn-primary" style={{ padding: "8px 14px" }} onClick={sendChat} disabled={sendingChat}>
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-3.5 border-t text-[11px]" style={{ borderColor: "var(--line)", color: "var(--ink-faint)" }}>
        <b>Rate basis (FY2026 / V43.0):</b> DRG 871 RW 1.9425 (verified CMS); DRG 872 RW 1.0299 (verified CMS FY2024); base
        $7,000 blended IPPS rate. Validation logic grounded in ICD-10-CM Official Guidelines §I.C.1.d, AHA Coding
        Clinic, UHDDS, and Sepsis-3 (Singer et al., JAMA 2016). This tool surfaces a recommendation for a human
        auditor and does not auto-adjudicate.
      </div>
    </div>
  );
}
