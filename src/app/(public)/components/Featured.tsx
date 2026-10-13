export default function FeaturedSection({ 
  title = 'Featured',
  subtitle,
  description,
  imageUrl,
}: { 
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
}) {
  return (
    <div className="section-spacing universal-container">
      <div className="text-center max-w-3xl mx-auto mb-12">
        {subtitle && <span className="text-[color:var(--accent)] font-bold tracking-wider uppercase text-sm block mb-3">{subtitle}</span>}
        <h2 className="h2-title mb-4">{title}</h2>
        {description && <p className="desc-text text-lg">{description}</p>}
      </div>
      
      {imageUrl && (
        <div className="mb-12 rounded-[var(--card-radius)] overflow-hidden shadow-xl border border-[color:var(--card-border)] h-[40vh] relative">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Developer note: The layout of these specific feature cards is hardcoded here per specifications. The admin only controls the section headers above. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="motion-target-card p-8 rounded-[var(--card-radius)] bg-[color:var(--bg-main)] border border-[color:var(--card-border)] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mb-6 text-[color:var(--accent)] text-xl font-bold">
              {i}
            </div>
            <h3 className="h3-title text-xl mb-3">Feature {i}</h3>
            <p className="desc-text">This is a hardcoded description for feature {i}, designed directly in the TSX file.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
