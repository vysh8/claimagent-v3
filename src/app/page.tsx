import Link from "next/link";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import { SOLUTIONS } from "@/lib/solutions";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--paper)" }}>
      <MarketingNav />

      <main className="flex-1">
        <section className="px-6 md:px-10 pt-16 pb-14 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2.5 mb-8">
            <div
              className="w-8 h-8 rounded-[9px] grid place-items-center text-white text-xs font-semibold"
              style={{ background: "var(--teal-deep)" }}
            >
              TH
            </div>
            <span className="font-semibold text-[16px] tracking-tight">TranHealthcare</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-balance mb-5">
            Payer operations, fully agentic.
          </h1>
          <p className="text-base md:text-lg mb-9 max-w-2xl mx-auto" style={{ color: "var(--ink-soft)" }}>
            TranHealthcare builds citation-backed AI agents for the clinical and financial reviews payers run every
            day — grounded in the same coding guidelines and medical policy your teams already trust, with every
            decision traceable back to the source.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/claims" className="btn btn-primary">
              Explore TranReview →
            </Link>
            <Link href="#solutions" className="btn btn-ghost">
              See all solutions
            </Link>
          </div>
        </section>

        <section id="solutions" className="px-6 md:px-10 pb-20 max-w-5xl mx-auto">
          <h2 className="text-xs uppercase tracking-wide font-semibold mb-5" style={{ color: "var(--ink-faint)" }}>
            Solutions
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {SOLUTIONS.map((s) => (
              <Link
                key={s.slug}
                href={s.href}
                className="rounded-[14px] p-6 flex flex-col gap-3 transition hover:-translate-y-0.5"
                style={{ background: "var(--card)", border: "0.5px solid var(--line)" }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-medium">{s.name}</h3>
                  {s.status === "live" ? (
                    <span className="chip validate">Live</span>
                  ) : (
                    <span className="chip pending">Coming soon</span>
                  )}
                </div>
                <p className="text-[13px]" style={{ color: "var(--ink-soft)" }}>
                  {s.tagline}
                </p>
                <span className="text-[13px] font-medium mt-1" style={{ color: "var(--teal-deep)" }}>
                  {s.status === "live" ? "Open the product →" : "See what's coming →"}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="px-6 md:px-10 pb-20 max-w-5xl mx-auto">
          <div
            className="rounded-[14px] p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-10"
            style={{ background: "var(--teal-deep)", color: "#e4eeee" }}
          >
            <div className="flex-1">
              <div className="text-[11px] uppercase tracking-wide font-semibold mb-2 opacity-80">
                Live today
              </div>
              <h3 className="text-xl md:text-2xl font-medium mb-2 text-white">TranReview</h3>
              <p className="text-sm opacity-90 max-w-xl">
                Upload a medical chart, watch OCR extract the record, and get a citation-backed DRG validation in
                under a minute — with dollar impact computed from verified CMS rate tables, not guessed by the model.
              </p>
            </div>
            <Link
              href="/claims"
              className="btn self-start md:self-center flex-shrink-0"
              style={{ background: "var(--clay)", color: "#fff" }}
            >
              Open TranReview →
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
