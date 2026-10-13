const fs = require('fs');
const path = require('path');

const write = (file, content) => {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, content);
  console.log(`Created ${file}`);
};

// 1. Hero Component
write('src/components/engine/sections/HeroSection.tsx', `
import React from 'react';

export function HeroSection({ heading, subheading, imageUrl, buttons }: any) {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center p-8 bg-[color:var(--bg-main)]">
      <h1 className="text-5xl font-extrabold mb-4 text-[color:var(--text-main)]">{heading || 'Hero Heading'}</h1>
      <p className="text-xl mb-8 text-[color:var(--text-muted)] max-w-2xl">{subheading || 'Hero Subheading'}</p>
      {imageUrl && <img src={imageUrl} alt="Hero" className="w-full max-w-4xl rounded-[var(--card-radius)] shadow-2xl mb-8" />}
      <div className="flex gap-4">
        {buttons?.map((btn: any, i: number) => (
          <a key={i} href={btn.url} className="px-6 py-3 bg-[color:var(--accent)] text-white rounded-[var(--btn-radius)] font-bold transition hover:opacity-90">
            {btn.text}
          </a>
        ))}
      </div>
    </div>
  );
}
`);

// 2. FAQ Component
write('src/components/engine/sections/FaqAccordion.tsx', `
import React, { useState } from 'react';

export function FaqAccordion({ heading, faqs }: any) {
  return (
    <div className="w-full max-w-3xl mx-auto py-16 px-4">
      <h2 className="text-3xl font-bold mb-8 text-center text-[color:var(--text-main)]">{heading || 'Frequently Asked Questions'}</h2>
      <div className="space-y-4">
        {faqs?.map((faq: any, i: number) => (
          <details key={i} className="group border border-[color:var(--card-border)] rounded-[var(--card-radius)] p-4 bg-black/5">
            <summary className="font-bold cursor-pointer list-none text-[color:var(--text-main)] flex justify-between">
              {faq.question}
              <span className="transition group-open:rotate-180">↓</span>
            </summary>
            <p className="mt-4 text-[color:var(--text-muted)]">{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
`);

// 3. Featured Grid Component
write('src/components/engine/sections/FeaturedGrid.tsx', `
import React from 'react';

export function FeaturedGrid({ heading, features }: any) {
  return (
    <div className="w-full py-16 px-4 bg-black/5">
      <h2 className="text-3xl font-bold mb-12 text-center text-[color:var(--text-main)]">{heading || 'Features'}</h2>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {features?.map((f: any, i: number) => (
          <div key={i} className="p-6 bg-[color:var(--bg-main)] border border-[color:var(--card-border)] rounded-[var(--card-radius)] text-center transition hover:-translate-y-1">
            <div className="w-12 h-12 mx-auto mb-4 bg-[color:var(--accent)]/10 text-[color:var(--accent)] rounded-full flex items-center justify-center text-xl font-bold">{i + 1}</div>
            <h3 className="text-xl font-bold mb-2 text-[color:var(--text-main)]">{f.title}</h3>
            <p className="text-[color:var(--text-muted)]">{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
`);

// 4. Update SectionRegistry
write('src/components/engine/SectionRegistry.ts', `
import { HeroSection } from './sections/HeroSection';
import { FaqAccordion } from './sections/FaqAccordion';
import { FeaturedGrid } from './sections/FeaturedGrid';

export const SectionRegistry: Record<string, any> = {
  HERO: HeroSection,
  FAQ_ACCORDION: FaqAccordion,
  FEATURED_GRID: FeaturedGrid,
};
`);

// 5. Admin Pages Management (Mock for now, needs DB hooks)
write('src/app/admin/dashboard/pages/page.tsx', `
import React from 'react';
import { prisma } from '@/lib/db';
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
            <Link href={\`/admin/dashboard/pages/\${p.id}\`} className="px-4 py-2 bg-blue-600 text-white rounded">
              Edit Sections
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
`);

