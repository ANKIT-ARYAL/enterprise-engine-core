import { notFound } from "next/navigation";
import { getCachedPagePayload } from "@/lib/db/queries";
import Hero from "../components/Hero";

import FeaturedSection from "../components/Featured";
import { FadeUp, SlideRight } from "@/components/engine/MotionViewport";

export default async function AboutUsPage() {
  const page = await getCachedPagePayload("about-us");

  if (!page || !page.isPublished) {
    notFound();
  }

  // 1. Extract dynamic section data configured in /admin/pages/about-us
  const heroData = page.sections.find((s) => s.type === "HERO")?.content as
    | Record<string, string>
    | undefined;

  const featuredData = page.sections.find((s) => s.type === "FEATURED_GRID")
    ?.content as Record<string, string> | undefined;

  return (
    <main className="min-h-screen">
      {/* 
        DESIGNER ZONE:
        The backend engine automatically created this route, wired all Prisma queries,
        and connected the admin builder. You only need to focus on styling & HTML!
      */}

      {heroData && (
        <FadeUp>
          <Hero
            badge={heroData.badge}
            title={heroData.title}
            subtitle={heroData.subtitle}
            primaryCtaText={heroData.primaryCtaText}
            primaryCtaLink={heroData.primaryCtaLink}
          />
        </FadeUp>
      )}

      {featuredData && (
        <SlideRight>
          <FeaturedSection
            title={featuredData.title}
            subtitle={featuredData.subtitle}
            description={featuredData.description}
            imageUrl={featuredData.imageUrl}
          />
        </SlideRight>
      )}
    </main>
  );
}
