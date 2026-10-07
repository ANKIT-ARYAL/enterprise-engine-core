export default function FeaturedSection({ title = 'Featured' }: { title?: string }) {
  return (
    <div className="section-spacing universal-container">
      <h2 className="h2-title mb-8">{title}</h2>
      <div className="grid-autofit-cards">
        {/* Placeholder cards */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-[var(--radius)] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="h3-title">Feature {i}</h3>
            <p className="desc-text mt-2">Description for feature {i}.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
