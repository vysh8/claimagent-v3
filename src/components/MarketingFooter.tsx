export default function MarketingFooter() {
  return (
    <footer className="px-6 md:px-10 py-8 border-t mt-16" style={{ borderColor: "var(--line)" }}>
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-[13px] font-medium">TranHealthcare</div>
        <div className="text-[12px]" style={{ color: "var(--ink-faint)" }}>
          Synthetic data only · No PHI · Built for demonstration purposes
        </div>
      </div>
    </footer>
  );
}
