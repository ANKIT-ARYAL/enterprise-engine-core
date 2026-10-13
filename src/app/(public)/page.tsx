import { notFound } from 'next/navigation';
import { getCachedPagePayload } from '@/lib/db/queries';
import Hero from './components/Hero';
import FeaturedSection from './components/Featured';
import FaqSection from './components/Faq';
import BlogRoll from './components/BlogRoll';
import RichText from './components/RichText';
import { FadeUp, SlideRight, Fade } from '@/components/engine/MotionViewport';

export default async function HomePage() {
  // 1. Fetch the data from the CMS
  const page = await getCachedPagePayload('home');

  if (!page || !page.isPublished) {
    notFound();
  }

  // 2. Extract specific section data from the payload
  const heroData = page.sections.find((s) => s.type === 'HERO')?.content as Record<string, string> | undefined;
  const featuredData = page.sections.find((s) => s.type === 'FEATURED_GRID')?.content as Record<string, string> | undefined;
  const faqData = page.sections.find((s) => s.type === 'FAQ_ACCORDION')?.content as Record<string, string> | undefined;
  const blogData = page.sections.find((s) => s.type === 'BLOG_ROLL')?.content as Record<string, string> | undefined;
  const richTextData = page.sections.find((s) => s.type === 'RICH_TEXT_CONTENT')?.content as Record<string, string> | undefined;

  return (
    <main className="min-h-screen">
      {/* 
        DEVELOPER ZONE: 
        You have full control here. The CMS provides the data, but the physical 
        imports and mapping are hardcoded here per your instructions so you can 
        manually override layout structure if needed!
      */}

      {heroData && (
        <FadeUp><Hero 
          badge={heroData.badge}
          title={heroData.title}
          subtitle={heroData.subtitle}
          primaryCtaText={heroData.primaryCtaText}
          primaryCtaLink={heroData.primaryCtaLink}
          secondaryCtaText={heroData.secondaryCtaText}
          secondaryCtaLink={heroData.secondaryCtaLink}
          imageUrl={heroData.imageUrl}
          layout={heroData.layout as "left" | "center" | undefined}
        /></FadeUp>
      )}

      {featuredData && (
        <SlideRight><FeaturedSection 
          title={featuredData.title}
          subtitle={featuredData.subtitle}
          description={featuredData.description}
          imageUrl={featuredData.imageUrl}
        /></SlideRight>
      )}

      {faqData && (
        <Fade><FaqSection 
          title={faqData.title}
          subtitle={faqData.subtitle}
        /></Fade>
      )}

      {blogData && (
        <BlogRoll 
          title={blogData.title}
        />
      )}

      {richTextData && (
        <RichText 
          content={richTextData.content}
        />
      )}
      
    </main>
  );
}
