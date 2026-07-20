import Link from "next/link";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 border-b sticky top-0 z-20 backdrop-blur"
      style={{ borderColor: "var(--line)", background: "rgba(251,250,246,.82)" }}>
      <Link href="/claims" className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-[9px] grid place-items-center text-white text-lg font-semibold"
          style={{
            background: "linear-gradient(150deg,var(--primary),var(--primary-deep))",
            boxShadow: "0 4px 12px -4px rgba(15,110,99,.5)",
          }}
        >
          CA
        </div>
        <div>
          <div className="serif text-xl font-semibold">
            <b>Claim</b>Agent
          </div>
          <div className="text-[11px] uppercase tracking-wide -mt-0.5" style={{ color: "var(--ink-faint)" }}>
            Prepay DRG Validation · Sepsis · v3
          </div>
        </div>
      </Link>
      <span
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-3 py-1.5 border"
        style={{ color: "var(--amber)", background: "var(--amber-bg)", borderColor: "#e7d6ad" }}
      >
        ● Synthetic data only · No PHI
      </span>
    </header>
  );
}
