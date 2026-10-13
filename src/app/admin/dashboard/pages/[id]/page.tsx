export const instant = false;

import React from 'react';
import { prisma } from '@/lib/db/client';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SectionEditorForm } from '@/components/admin/SectionEditorForm';
import { AddSectionDropdown } from '@/components/admin/AddSectionDropdown';

export default async function PageEditor({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const page = await prisma.page.findUnique({
    where: { id: resolvedParams.id },
    include: { sections: { where: { isDeleted: false }, orderBy: { order: 'asc' } } }
  });

  if (!page) notFound();

  return (
    <div className="p-8 w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[color:var(--text-main)]">Editing: {page.title}</h1>
          <p className="text-[color:var(--text-muted)]">Manage the dynamic sections for /{page.slug}</p>
        </div>
        <Link href="/admin/dashboard/pages" className="px-4 py-2 bg-black/10 rounded font-medium">Back to Pages</Link>
      </div>

      <div className="space-y-6">
        {page.sections.map((section, index) => (
          <div key={section.id} className="p-6 bg-[color:var(--bg-main)] border border-[color:var(--card-border)] rounded-[var(--card-radius)] shadow-lg">
            <div className="flex justify-between items-center border-b border-[color:var(--card-border)] pb-4 mb-4">
              <h3 className="font-bold text-xl text-[color:var(--text-main)]">{section.type}</h3>
              <span className="text-sm font-bold bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full">Order: {section.order}</span>
            </div>
            
            <SectionEditorForm section={section} pageSlug={page.slug} />
            
          </div>
        ))}
        {page.sections.length === 0 && (
          <div className="p-8 text-center border-2 border-dashed border-[color:var(--card-border)] rounded-[var(--card-radius)]">
            <p className="text-[color:var(--text-muted)] mb-4">No sections added to this page yet.</p>
          </div>
        )}
        <div className="flex justify-center mt-8">
          <AddSectionDropdown pageId={page.id} pageSlug={page.slug} />
        </div>
      </div>
    </div>
  );
}
