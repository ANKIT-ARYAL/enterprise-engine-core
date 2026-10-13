import { notFound } from 'next/navigation';
import { getCachedPagePayload } from '@/lib/db/queries';
import { SectionDispatcher } from '@/components/engine/SectionDispatcher';

export default async function BLOGPage() {
  const page = await getCachedPagePayload('blog');

  if (!page || !page.isPublished) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      {page.sections.map((section) => (
        <SectionDispatcher key={section.id} section={section} />
      ))}
      {/* You can add custom code here below the dynamic sections */}
    </main>
  );
}
