export const instant = false;

import { notFound } from 'next/navigation';
import { getCachedPagePayload } from '@/lib/db/queries';
import { SectionDispatcher } from '@/components/engine/SectionDispatcher';

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function DynamicPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slugPath = resolvedParams.slug ? resolvedParams.slug.join('/') : 'home';
  const page = await getCachedPagePayload(slugPath);

  if (!page || !page.isPublished) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      {page.sections.map((section) => (
        <SectionDispatcher key={section.id} section={section} />
      ))}
    </main>
  );
}
