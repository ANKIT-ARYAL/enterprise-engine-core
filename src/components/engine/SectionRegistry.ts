import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

const Skeleton = ({ className = 'h-96' }: { className?: string }) => (
  <div className={`w-full ${className} bg-slate-100 dark:bg-slate-900 animate-pulse rounded-[var(--radius)] universal-container my-4`} />
);

export const SectionRegistry: Record<string, ComponentType<any>> = {
  HERO: dynamic(() => import('@/components/sections/HeroSection'), {
    loading: () => <Skeleton className="h-[75vh]" />,
  }),
  FEATURED_GRID: dynamic(() => import('@/components/sections/FeaturedSection'), {
    loading: () => <Skeleton className="h-[500px]" />,
  }),
  PROMO_BANNER: dynamic(() => import('@/components/sections/PromoBannerSection'), {
    loading: () => <Skeleton className="h-64" />,
  }),
  FAQ_ACCORDION: dynamic(() => import('@/components/sections/FaqSection'), {
    loading: () => <Skeleton className="h-80" />,
  }),
  BLOG_ROLL: dynamic(() => import('@/components/sections/BlogRollSection'), {
    loading: () => <Skeleton className="h-96" />,
  }),
  RICH_TEXT_CONTENT: dynamic(() => import('@/components/sections/RichTextSection'), {
    loading: () => <Skeleton className="h-96" />,
  }),
};
