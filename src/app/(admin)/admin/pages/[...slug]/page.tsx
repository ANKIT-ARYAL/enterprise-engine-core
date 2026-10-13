export const instant = false;

import React from 'react';
import { prisma } from '@/lib/db/client';
import { SectionEditorForm } from '@/components/admin/SectionEditorForm';
import { AddSectionDropdown } from '@/components/admin/AddSectionDropdown';
import Link from 'next/link';
import { 
  ExternalLink, Home, HelpCircle, BookOpen, Users, Mail, 
  Layers, Sparkles, LayoutTemplate, ArrowRight, CheckCircle2,
  FileQuestion, PenTool, Database
} from 'lucide-react';

export default async function DynamicAdminPageDashboard({ 
  params 
}: { 
  params: Promise<{ slug: string[] }> 
}) {
  const resolvedParams = await params;
  const slugPath = resolvedParams.slug.join('/');
  
  // Look up the current page by slug and fetch all active pages for the tab bar
  const [initialPage, allPages] = await Promise.all([
    prisma.page.findUnique({
      where: { slug: slugPath },
      include: { 
        sections: { 
          where: { isDeleted: false }, 
          orderBy: { order: 'asc' } 
        } 
      }
    }),
    prisma.page.findMany({
      select: { id: true, title: true, slug: true },
      orderBy: { createdAt: 'asc' }
    })
  ]);

  let page = initialPage;

  // Auto-initialize if it doesn't exist yet
  if (!page) {
    const formattedTitle = slugPath
      .split(/[-_/]/)
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');
      
    const { createDynamicPageAction } = await import('@/app/actions/admin-mutations');
    await createDynamicPageAction(formattedTitle, slugPath);

    // Re-fetch the freshly initialized page
    page = await prisma.page.findUnique({
      where: { slug: slugPath },
      include: { 
        sections: { 
          where: { isDeleted: false }, 
          orderBy: { order: 'asc' } 
        } 
      }
    });
  }

  if (!page) {
    return null;
  }

  // Pre-defined core pages for the top strip
  const corePages = [
    { slug: 'home', label: 'Homepage', icon: Home },
    { slug: 'faq', label: 'FAQ', icon: HelpCircle },
    { slug: 'blogs', label: 'Blogs', icon: BookOpen },
    { slug: 'about-us', label: 'About Us', icon: Users },
    { slug: 'contact-us', label: 'Contact Us', icon: Mail },
  ];

  // Merge with any custom dynamic pages created by the user
  const combinedNav = [...corePages];
  allPages.forEach(p => {
    if (!combinedNav.some(c => c.slug === p.slug)) {
      combinedNav.push({ slug: p.slug, label: p.title, icon: Layers });
    }
  });

  const publicHref = slugPath === 'home' ? '/' : `/${slugPath}`;

  return (
    <div className="w-full space-y-6 pb-24">
      {/* 1. Top Pages Switcher Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {combinedNav.map(item => {
          const isActive = slugPath === item.slug;
          const Icon = item.icon;
          return (
            <Link
              key={item.slug}
              href={`/admin/pages/${item.slug}`}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* 2. Executive Page Builder Header */}
      <div className="bg-card border border-border rounded-card p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 w-full">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Page Studio
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
              /{slugPath}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live & Published
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {page.title} Page Builder
          </h1>
          <p className="text-xs text-muted-foreground">
            Add, reorder, and configure components rendered live on {publicHref}.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <a
            href={publicHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold rounded-btn transition-colors shadow-xs"
          >
            <span>View Live Page</span>
            <ExternalLink size={13} />
          </a>

          <AddSectionDropdown pageId={page.id} pageSlug={slugPath} />
        </div>
      </div>

      {/* 3. Contextual Data Shortcuts */}
      {slugPath === 'faq' && (
        <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <FileQuestion size={18} />
            </span>
            <div>
              <h3 className="font-semibold text-xs text-foreground">FAQ Questions Database</h3>
              <p className="text-[11px] text-muted-foreground">
                Manage the live question bank, tags, and answers displayed in FAQ accordion blocks.
              </p>
            </div>
          </div>
          <Link
            href="/admin/faq"
            className="flex items-center gap-1 px-3 py-1.5 rounded-btn bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold transition-colors shrink-0 shadow-xs"
          >
            <span>Open FAQ Database</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {slugPath === 'blogs' && (
        <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <BookOpen size={18} />
            </span>
            <div>
              <h3 className="font-semibold text-xs text-foreground">Blog Articles CMS</h3>
              <p className="text-[11px] text-muted-foreground">
                Publish articles, edit author profiles, and configure post categories.
              </p>
            </div>
          </div>
          <Link
            href="/admin/blogs"
            className="flex items-center gap-1 px-3 py-1.5 rounded-btn bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold transition-colors shrink-0 shadow-xs"
          >
            <span>Open Blog CMS</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {slugPath === 'contact-us' && (
        <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <PenTool size={18} />
            </span>
            <div>
              <h3 className="font-semibold text-xs text-foreground">Dynamic Form Builder</h3>
              <p className="text-[11px] text-muted-foreground">
                Customize inputs, select fields, and contact form schema visually in Design Studio.
              </p>
            </div>
          </div>
          <Link
            href="/admin/settings?tab=comp-form-builder"
            className="flex items-center gap-1 px-3 py-1.5 rounded-btn bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold transition-colors shrink-0 shadow-xs"
          >
            <span>Open Form Builder</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* 4. Active Components List */}
      <div className="space-y-4 w-full">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">Page Sections & Components</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground font-mono">
              {page.sections.length}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Saved changes sync in real time
          </span>
        </div>

        {page.sections.map((section, idx) => (
          <SectionEditorForm 
            key={section.id} 
            section={section} 
            pageSlug={page.slug} 
            index={idx} 
          />
        ))}

        {/* 5. Empty State / Quick Starter Kits */}
        {page.sections.length === 0 && (
          <div className="border border-dashed border-border rounded-card p-8 md:p-12 text-center bg-card shadow-xs w-full">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto mb-3">
              <LayoutTemplate size={24} />
            </div>
            <h3 className="text-base font-bold text-foreground">No Components on this Page Yet</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-6">
              Start building your page by adding a hero banner, features grid, FAQ accordion, or custom section.
            </p>
            <div className="flex justify-center">
              <AddSectionDropdown pageId={page.id} pageSlug={slugPath} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
