import { prisma } from '@/lib/db/client';
import { revalidateTag } from 'next/cache';
import { RefreshCcw, Trash2 } from 'lucide-react';

export default async function RecycleBinPage() {
  const deletedSections = await prisma.pageSection.findMany({
    where: { isDeleted: true },
    include: { page: true },
    orderBy: { updatedAt: 'desc' }
  });

  async function restoreSection(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const pageSlug = formData.get('pageSlug') as string;
    
    await prisma.pageSection.update({
      where: { id },
      data: { isDeleted: false }
    });
    
    // @ts-expect-error - Next.js types conflict
    revalidateTag(`page:${pageSlug}`);
    // @ts-expect-error - Next.js types conflict
    revalidateTag('sections');
  }

  async function purgeSection(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    
    await prisma.pageSection.delete({
      where: { id }
    });
  }

  return (
    <div>
      <h1 className="h2-title mb-6">Recycle Bin</h1>
      <p className="desc-text mb-8">Restore accidentally deleted items or permanently purge them.</p>

      {deletedSections.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-slate-300 rounded-[var(--radius)] text-center text-slate-500">
          The recycle bin is empty.
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {deletedSections.map((section: any) => (
            <div key={section.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[var(--radius)]">
              <div>
                <h3 className="font-semibold">{section.type} <span className="text-sm font-normal text-slate-500">from {section.page.title}</span></h3>
                <p className="text-xs text-slate-500">Deleted: {section.updatedAt.toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <form action={restoreSection}>
                  <input type="hidden" name="id" value={section.id} />
                  <input type="hidden" name="pageSlug" value={section.page.slug} />
                  <button type="submit" className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--primary)] bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 rounded">
                    <RefreshCcw size={16} /> Restore
                  </button>
                </form>
                <form action={purgeSection}>
                  <input type="hidden" name="id" value={section.id} />
                  <button type="submit" className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded">
                    <Trash2 size={16} /> Purge
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
