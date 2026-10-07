export default function BlogRollSection({ title = 'Latest Posts' }: { title?: string }) {
  return (
    <div className="section-spacing universal-container">
      <h2 className="h2-title mb-8">{title}</h2>
      <p className="desc-text">Blog posts will appear here.</p>
    </div>
  );
}
