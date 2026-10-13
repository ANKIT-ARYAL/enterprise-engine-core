import { notFound } from 'next/navigation';
import { getCachedPagePayload } from '@/lib/db/queries';
import Hero from '../components/Hero';

import BlogRoll from '../components/BlogRoll';


export default async function BlogsPage() {
  const page = await getCachedPagePayload('blogs');

  if (!page || !page.isPublished) {
    notFound();
  }

  // 1. Extract dynamic section data configured in /admin/pages/blogs
  const heroData = page.sections.find((s) => s.type === 'HERO')?.content as Record<string, string> | undefined;
  
  const blogData = page.sections.find((s) => s.type === 'BLOG_ROLL')?.content as Record<string, string> | undefined;
  

  return (
    <main className="min-h-screen">
      {/* 
        DESIGNER ZONE:
        The backend engine automatically created this route, wired all Prisma queries,
        and connected the admin builder. You only need to focus on styling & HTML!
      */}

      {heroData && (
        <Hero 
          badge={heroData.badge}
          title={heroData.title}
          subtitle={heroData.subtitle}
          primaryCtaText={heroData.primaryCtaText}
          primaryCtaLink={heroData.primaryCtaLink}
        />
      )}

      

      {blogData && (
        <BlogRoll 
          title={blogData.title}
        />
      )}

      
    </main>
  );
}
