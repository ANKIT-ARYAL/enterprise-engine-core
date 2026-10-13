export const instant = false;

import React from 'react';
import { prisma } from '@/lib/db/client';
import Link from 'next/link';

export default async function AdminPages() {
  const pages = await prisma.page.findMany({
    include: { sections: true }
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Page Management (CMS)</h1>
      <div className="grid gap-4">
        {pages.map((p) => (
          <div key={p.id} className="p-4 border rounded shadow flex justify-between items-center">
            <div>
              <h2 className="font-bold text-xl">{p.title}</h2>
              <p className="text-sm opacity-70">/{p.slug} - {p.sections.length} Sections</p>
            </div>
            <Link href={`/admin/dashboard/pages/${p.id}`} className="px-4 py-2 bg-blue-600 text-white rounded">
              Edit Sections
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
