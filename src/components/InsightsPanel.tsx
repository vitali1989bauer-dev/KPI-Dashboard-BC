const INSIGHTS = [
  {
    dim: 'Market Signals',
    body:
      'Long-tail customers are paying ~15% above the fair-value line while channel partners are leaving margin on the table — revenue hides both.',
  },
  {
    dim: 'Price Performance',
    body:
      'Realization dropped 3.2 pts in Q3 — €4.2M leakage concentrated in freight and rebates, while gross margin barely moved.',
  },
  {
    dim: 'Price Operations',
    body:
      'Override rate climbed to 12.4% with cycle time at 4.8 days — the price logic is being negotiated around, one quote at a time.',
  },
];

export default function InsightsPanel() {
  return (
    <section className="mt-16 mb-10 rounded-xl bg-neutral-900 p-8 text-white">
      <div className="flex items-center gap-3">
        <div className="h-5 w-1 bg-[#FF3246]" aria-hidden />
        <h2 className="text-base font-semibold tracking-tight">
          What this dashboard catches that revenue & margin don't
        </h2>
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {INSIGHTS.map((i) => (
          <div key={i.dim} className="rounded-lg bg-neutral-800/60 border border-neutral-700/50 p-5">
            <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#FF3246]">
              {i.dim}
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-neutral-200">{i.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
