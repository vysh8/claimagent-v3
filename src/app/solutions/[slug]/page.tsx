import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import { SOLUTIONS } from "@/lib/solutions";

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const solution = SOLUTIONS.find((s) => s.slug === slug);

  if (!solution) notFound();
  if (solution.status === "live") redirect(solution.href);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--paper)" }}>
      <MarketingNav />

      <main className="flex-1 px-6 md:px-10 py-14 max-w-3xl mx-auto w-full">
        <Link href="/#solutions" className="text-[13px] font-medium" style={{ color: "var(--teal-deep)" }}>
          ← All solutions
        </Link>

        <div className="flex items-center gap-3 mt-5 mb-3">
          <h1 className="text-3xl font-medium tracking-tight">{solution.name}</h1>
          <span className="chip pending">Coming soon</span>
        </div>
        <p className="text-base mb-8" style={{ color: "var(--ink-soft)" }}>
          {solution.tagline}
        </p>

        <div className="rounded-[14px] p-6 md:p-8 mb-8" style={{ background: "var(--card)", border: "0.5px solid var(--line)" }}>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--ink)" }}>
            {solution.description}
          </p>
          <div className="flex flex-col gap-4">
            {solution.detail.map((d, i) => (
              <div key={i} className="flex gap-3">
                <div
                  className="w-5 h-5 rounded-full grid place-items-center text-[11px] font-semibold flex-shrink-0 mt-0.5"
                  style={{ background: "var(--teal-pale)", color: "var(--teal-deep)" }}
                >
                  {i + 1}
                </div>
                <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                  {d}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-[14px] p-6 flex items-center justify-between gap-4 flex-wrap"
          style={{ background: "var(--teal-pale)" }}
        >
          <p className="text-sm" style={{ color: "var(--teal-deep)" }}>
            Want to see what's live today? TranReview is fully built and ready to try.
          </p>
          <Link href="/claims" className="btn btn-primary flex-shrink-0">
            Open TranReview →
          </Link>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
