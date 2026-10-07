import { prisma } from '@/lib/db/client';
import { SectionDndList } from '@/components/admin/SectionDndList';

export default async function AdminPagesOverview() {
  // Mock fetch sections for the 'home' page
  const page = await prisma.page.findUnique({
    where: { slug: 'home' },
    include: {
      sections: {
        where: { isDeleted: false },
        orderBy: { order: 'asc' }
      }
    }
  });

  return (
    <div>
      <h1 className="h2-title mb-6">Page Studio: {page?.title || 'Home'}</h1>
      <p className="desc-text mb-8">Drag to reorder sections. Changes are optimistically rendered and saved automatically.</p>
      
      {page && page.sections.length > 0 ? (
        <SectionDndList 
          initialSections={page.sections.map((s: any) => ({
            id: s.id,
            type: s.type,
            isEnabled: s.isEnabled,
            order: s.order
          }))}
          pageSlug={page.slug}
        />
      ) : (
        <div className="p-8 border-2 border-dashed border-slate-300 rounded-[var(--radius)] text-center text-slate-500">
          No sections found. Add a section to get started.
        </div>
      )}
    </div>
  );
}
