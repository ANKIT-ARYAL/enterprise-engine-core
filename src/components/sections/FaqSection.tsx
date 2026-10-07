export default function FaqSection({ faqs = [] }: { faqs?: {q: string, a: string}[] }) {
  return (
    <div className="section-spacing universal-container">
      <h2 className="h2-title mb-8">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="p-4 border rounded-[var(--radius)]">
            <h3 className="h3-title text-lg">{faq.q}</h3>
            <p className="desc-text mt-2">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
