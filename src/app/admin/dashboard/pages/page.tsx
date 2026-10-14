export const instant = false;
import Link from 'next/link';
import { ArrowUpRight, FileText } from 'lucide-react';
import { prisma } from '@/lib/db/client';

export default async function AdminPages() {
  const pages = await prisma.page.findMany({ include: { sections: { where: { isDeleted: false } } }, orderBy: { updatedAt: 'desc' } });
  return <div className="mx-auto w-full max-w-[1600px] space-y-8 pb-24">
    <header className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between"><div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Pages / content workspace</p><h1 className="text-3xl font-bold tracking-[-0.04em] text-foreground md:text-4xl">Page management</h1><p className="mt-2 max-w-xl text-sm text-muted-foreground">Manage the structure of every public page from one consistent workspace.</p></div><Link href="/admin/pages/home" className="inline-flex items-center gap-2 rounded-btn bg-btn-bg px-4 py-2.5 text-xs font-semibold text-btn-text shadow-sm transition-colors hover:bg-btn-hover hover:text-btn-hover-text">Open page studio <ArrowUpRight size={14} /></Link></header>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{pages.map((page) => <article key={page.id} className="group rounded-card border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/30"><div className="mb-8 flex items-start justify-between"><span className="rounded-btn bg-primary/10 p-2.5 text-primary"><FileText size={18} /></span><span className="rounded-full border border-border bg-muted/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{page.isPublished ? 'Published' : 'Draft'}</span></div><h2 className="text-lg font-semibold text-foreground">{page.title}</h2><p className="mt-1 text-xs font-mono text-muted-foreground">/{page.slug} · {page.sections.length} sections</p><Link href={`/admin/dashboard/pages/${page.id}`} className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">Edit sections <ArrowUpRight size={13} /></Link></article>)}</section>
    {pages.length === 0 && <div className="rounded-card border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">No pages have been created yet.</div>}
  </div>;
}
