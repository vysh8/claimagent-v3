import Link from "next/link";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside
        className="w-[196px] flex-shrink-0 flex flex-col gap-6 px-3.5 py-5"
        style={{ background: "var(--teal-deep)", color: "#dceaea" }}
      >
        <Link href="/claims" className="flex items-center gap-2">
          <div
            className="w-[26px] h-[26px] rounded-[6px] grid place-items-center text-white text-xs font-semibold"
            style={{ background: "var(--clay)" }}
          >
            TR
          </div>
          <span className="text-white font-semibold text-[14.5px] tracking-tight">TranReview</span>
        </Link>

        <nav className="flex flex-col gap-0.5">
          <Link
            href="/claims"
            className="flex items-center gap-2 px-2.5 py-2 rounded-[7px] text-[13px] font-medium"
            style={{ background: "rgba(255,255,255,.1)", color: "#fff" }}
          >
            Queue
          </Link>
          <span className="flex items-center gap-2 px-2.5 py-2 rounded-[7px] text-[13px]" style={{ color: "#6f918f" }}>
            Reports
          </span>
          <span className="flex items-center gap-2 px-2.5 py-2 rounded-[7px] text-[13px]" style={{ color: "#6f918f" }}>
            Settings
          </span>
        </nav>

        <div className="mt-auto flex flex-col gap-2.5">
          <Link href="/" className="text-[11px] font-medium" style={{ color: "#a9c7c6" }}>
            ← TranHealthcare
          </Link>
          <div className="text-[11px] leading-relaxed" style={{ color: "#7fa0a0" }}>
            Synthetic data only · No PHI
            <br />
            Prepay DRG validation · Sepsis
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0" style={{ background: "var(--paper)" }}>
        {children}
      </main>
    </div>
  );
}
