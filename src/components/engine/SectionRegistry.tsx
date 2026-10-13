import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

const Skeleton = ({ className = 'h-96' }: { className?: string }) => (
  <div className={`w-full ${className} bg-slate-100 dark:bg-slate-900 animate-pulse rounded-[var(--radius)] universal-container my-4`} />
);

export const SectionRegistry: Record<string, ComponentType<Record<string, unknown>>> = {
  HERO: dynamic(() => import('@/app/(public)/components/Hero'), {
    loading: () => <Skeleton className="h-[75vh]" />,
  }),
  FEATURED_GRID: dynamic(() => import('@/app/(public)/components/Featured'), {
    loading: () => <Skeleton className="h-[500px]" />,
  }),
  PROMO_BANNER: dynamic(() => import('@/app/(public)/components/PromoBanner'), {
    loading: () => <Skeleton className="h-64" />,
  }),
  FAQ_ACCORDION: dynamic(() => import('@/app/(public)/components/Faq'), {
    loading: () => <Skeleton className="h-80" />,
  }),
  BLOG_ROLL: dynamic(() => import('@/app/(public)/components/BlogRoll'), {
    loading: () => <Skeleton className="h-96" />,
  }),
  RICH_TEXT_CONTENT: dynamic(() => import('@/app/(public)/components/RichText'), {
    loading: () => <Skeleton className="h-96" />,
  }),
};
