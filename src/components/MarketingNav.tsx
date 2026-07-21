import Link from "next/link";

export default function MarketingNav() {
  return (
    <header
      className="flex items-center justify-between px-6 md:px-10 py-4 border-b sticky top-0 z-20 backdrop-blur"
      style={{ borderColor: "var(--line)", background: "rgba(243,246,245,.85)" }}
    >
      <Link href="/" className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-[7px] grid place-items-center text-white text-xs font-semibold"
          style={{ background: "var(--teal-deep)" }}
        >
          TH
        </div>
        <span className="font-semibold text-[15px] tracking-tight">TranHealthcare</span>
      </Link>
      <nav className="hidden sm:flex items-center gap-7 text-[13px] font-medium" style={{ color: "var(--ink-soft)" }}>
        <Link href="/#solutions">Solutions</Link>
        <Link href="/claims">Tran Review</Link>
      </nav>
    </header>
  );
}
