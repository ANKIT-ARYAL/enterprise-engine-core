import { prisma } from '@/lib/db/client';
import { SectionDndList } from '@/components/admin/SectionDndList';
import Link from 'next/link';
import { ArrowUpRight, FileText, Home, HelpCircle, BookOpen, Users, Mail } from 'lucide-react';

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

  const pages = [
    { slug: 'home', label: 'Homepage', icon: Home },
    { slug: 'faq', label: 'FAQ', icon: HelpCircle },
    { slug: 'blogs', label: 'Blogs', icon: BookOpen },
    { slug: 'about-us', label: 'About Us', icon: Users },
    { slug: 'contact-us', label: 'Contact Us', icon: Mail },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-24">
      <div className="flex flex-col gap-2 border-b border-border pb-5">
        <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-primary">Pages / workspace</p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-[-0.04em] text-foreground">Page studio</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl">Shape the structure and content of every public page from one consistent workspace.</p>
          </div>
          <Link href="/admin/pages/home" className="inline-flex items-center gap-2 px-4 py-2.5 bg-btn-bg text-btn-text rounded-btn text-xs font-semibold hover:bg-btn-hover hover:text-btn-hover-text transition-colors shadow-sm">
            Open homepage <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {pages.map(({ slug, label, icon: Icon }) => (
          <Link key={slug} href={`/admin/pages/${slug}`} className="group rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:bg-muted/30 transition-all">
            <div className="flex items-center justify-between mb-8"><span className="p-2 rounded-lg bg-primary/10 text-primary"><Icon size={16} /></span><ArrowUpRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" /></div>
            <p className="text-sm font-semibold text-foreground">{label}</p><p className="text-[11px] text-muted-foreground mt-1">/{slug}</p>
          </Link>
        ))}
      </div>

      <div className="border border-border bg-card rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-border flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-primary mb-1">Quick structure view</p><h2 className="text-lg font-semibold tracking-tight text-foreground">Homepage sections</h2></div><span className="text-xs font-mono text-muted-foreground">{page?.sections.length || 0} blocks</span></div>
      
      <div className="p-5">
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
      </div>
    </div>
  );
}
