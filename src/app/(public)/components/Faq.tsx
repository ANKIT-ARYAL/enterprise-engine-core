import { getCachedFaqs } from '@/lib/db/queries';

export default async function FaqSection({ 
  title = 'Frequently Asked Questions',
  subtitle
}: { 
  title?: string;
  subtitle?: string;
}) {
  const faqs = await getCachedFaqs();

  return (
    <div className="section-spacing universal-container">
      <div className="text-center max-w-3xl mx-auto mb-12">
        {subtitle && <span className="text-[color:var(--accent)] font-bold tracking-wider uppercase text-sm block mb-3">{subtitle}</span>}
        <h2 className="h2-title mb-4">{title}</h2>
      </div>

      <div className="space-y-4 w-full">
        {faqs.length === 0 ? (
          <p className="text-center text-[color:var(--text-muted)] italic">No FAQs available.</p>
        ) : (
          faqs.map((faq, i) => (
            <div key={faq.id} className="motion-target-card p-6 border border-[color:var(--card-border)] bg-[color:var(--bg-main)] rounded-[var(--card-radius)] shadow-sm hover:shadow-md transition-shadow">
              <h3 className="h3-title text-lg flex items-center gap-3">
                <span className="text-[color:var(--accent)] text-2xl font-black">Q.</span>
                {faq.question}
              </h3>
              <p className="desc-text mt-3 ml-8 text-[color:var(--text-muted)]">{faq.answer}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
