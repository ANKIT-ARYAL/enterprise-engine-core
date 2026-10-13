import { notFound } from 'next/navigation';
import { getCachedPagePayload } from '@/lib/db/queries';
import FaqSection from '../components/Faq';
import Hero from '../components/Hero';
export default async function FAQPage() {
  const page = await getCachedPagePayload('faq');

  if (!page || !page.isPublished) {
    notFound();
  }

  // Extract the specific section data from the layout payload
  const heroData = page.sections.find((s) => s.type === 'HERO')?.content as Record<string, string> | undefined;
  const faqData = page.sections.find((s) => s.type === 'FAQ_ACCORDION')?.content as Record<string, string> | undefined;

  return (
    <main className="min-h-screen">
      {/* 
        DEVELOPER ZONE: 
        Just like the homepage, you explicitly control the layout here. 
        If a section exists in the CMS, you must manually import and render it here!
      */}

      {heroData && (
        <Hero 
          title={heroData.title}
          subtitle={heroData.subtitle}
          badge={heroData.badge}
        />
      )}

      {faqData && (
        <FaqSection 
          title={faqData.title}
          subtitle={faqData.subtitle}
        />
      )}
    </main>
  );
}
