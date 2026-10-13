
import { HeroSection } from './sections/HeroSection';
import { FaqAccordion } from './sections/FaqAccordion';
import { FeaturedGrid } from './sections/FeaturedGrid';

export const SectionRegistry: Record<string, any> = {
  HERO: HeroSection,
  FAQ_ACCORDION: FaqAccordion,
  FEATURED_GRID: FeaturedGrid,
};
