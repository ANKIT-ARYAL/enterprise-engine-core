/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/db/client';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

const SettingsSchema = z.object({
  siteName: z.string().min(1),
  customCss: z.string().optional().nullable(),
  tokens: z.record(z.string(), z.any()).default({}),
});

export async function updateSystemSettingsAction(input: z.infer<typeof SettingsSchema>) {
  const validated = SettingsSchema.parse(input);

  await prisma.systemSettings.update({
    where: { id: 'global_config' },
    data: {
      siteName: validated.siteName,
      customCss: validated.customCss,
      tokens: validated.tokens as any,
    },
  });

  // Zero-code Form Component Generation
  if (validated.tokens?.formSchema?.componentName) {
    const compName = validated.tokens.formSchema.componentName;
    const fileName = `${compName}.tsx`;
    const formsDir = path.join(process.cwd(), 'src', 'components', 'forms');
    
    if (!fs.existsSync(formsDir)) {
      fs.mkdirSync(formsDir, { recursive: true });
    }

    const fileContent = `import { getCachedSystemSettings } from '@/lib/db/queries';
import { DynamicFormRenderer } from '@/components/ui/DynamicFormRenderer';

export async function ${compName}() {
  const settings = await getCachedSystemSettings();
  const tokens = (settings?.tokens as any) || {};
  
  const schema = tokens.formSchema;

  if (!schema || !schema.fields || schema.fields.length === 0) {
    return (
      <div className="p-8 text-center bg-black/5 rounded-[var(--card-radius)] border border-[color:var(--card-border)] text-[color:var(--text-main)]">
        <p className="opacity-70">No dynamic form configured yet. Please configure it in the Admin Settings.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <DynamicFormRenderer schema={schema} />
    </div>
  );
}
`;
    fs.writeFileSync(path.join(formsDir, fileName), fileContent);
  }

  // Purges global edge cache and system-settings tag
  revalidateTag('system-settings', 'default');
  revalidateTag('pages', 'default');
  revalidateTag('navigation', 'default');
  revalidateTag('global-content', 'default');
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function mutateSectionAction(sectionId: string, pageSlug: string, content: unknown) {
  await prisma.pageSection.update({
    where: { id: sectionId },
    data: { content: content as any },
  });

  // Invalidate page-specific cache tags
  revalidateTag(`page:${pageSlug}`, 'default');
  revalidateTag('sections', 'default');
  revalidatePath(`/${pageSlug}`);
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function toggleSectionVisibilityAction(sectionId: string, pageSlug: string, isEnabled: boolean) {
  await prisma.pageSection.update({
    where: { id: sectionId },
    data: { isEnabled },
  });

  revalidateTag(`page:${pageSlug}`, 'default');
  revalidateTag('sections', 'default');
  revalidatePath(`/${pageSlug}`);
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function reorderSectionsAction(pageSlug: string, sectionIds: string[]) {
  await prisma.$transaction(
    sectionIds.map((id, order) =>
      prisma.pageSection.update({ where: { id }, data: { order } }),
    ),
  );
  revalidateTag(`page:${pageSlug}`, 'default');
  revalidateTag('sections', 'default');
  revalidatePath(`/admin/pages/${pageSlug}`);
  revalidatePath(`/${pageSlug}`);
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function softDeleteSectionAction(sectionId: string, pageSlug: string) {
  await prisma.pageSection.update({
    where: { id: sectionId },
    data: { isDeleted: true },
  });

  revalidateTag(`page:${pageSlug}`, 'default');
  revalidateTag('sections', 'default');
  revalidatePath(`/${pageSlug}`);
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function createDynamicPageAction(title: string, slug: string) {
  // Normalize slug
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-');

  // 1. Determine default section configuration based on slug
  const defaultSections: { type: any; order: number; content: any }[] = [
    {
      type: 'HERO',
      order: 0,
      content: {
        title: title,
        subtitle: `Explore everything about ${title.toLowerCase()}.`,
        badge: 'Enterprise Engine',
        primaryCtaText: 'Get Started',
        primaryCtaLink: '#',
      }
    }
  ];

  if (cleanSlug.includes('faq')) {
    defaultSections.push({
      type: 'FAQ_ACCORDION',
      order: 1,
      content: {
        title: 'Frequently Asked Questions',
        subtitle: 'Everything you need to know',
        description: 'Instant answers to common questions.'
      }
    });
  } else if (cleanSlug.includes('blog') || cleanSlug.includes('news')) {
    defaultSections.push({
      type: 'BLOG_ROLL',
      order: 1,
      content: {
        title: 'Latest News & Updates',
      }
    });
  } else {
    defaultSections.push({
      type: 'FEATURED_GRID',
      order: 1,
      content: {
        title: 'Key Features & Capabilities',
        subtitle: 'Engineered for Performance',
        description: 'Explore the modular architecture powering this solution.'
      }
    });
  }

  // 2. Create the Page in DB with default sections
  const page = await prisma.page.upsert({
    where: { slug: cleanSlug },
    update: { title },
    create: {
      title,
      slug: cleanSlug,
      sections: {
        create: defaultSections
      }
    },
    include: { sections: true }
  });

  // If page already existed without sections, seed them
  if (page.sections.length === 0) {
    for (const sec of defaultSections) {
      await prisma.pageSection.create({
        data: {
          pageId: page.id,
          type: sec.type,
          order: sec.order,
          content: sec.content
        }
      });
    }
  }

  // 3. Add to SidebarNav
  await prisma.sidebarNav.upsert({
    where: { path: `/admin/pages/${cleanSlug}` },
    update: { label: title },
    create: {
      label: title,
      path: `/admin/pages/${cleanSlug}`,
      groupId: 'PAGES',
    }
  });

  // 4. Auto-generate the physical frontend TSX file with clean standard Next.js imports
  const appDir = path.join(process.cwd(), 'src', 'app', '(public)', cleanSlug);
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true });
  }

  const compName = title.replace(/[^a-zA-Z0-9]/g, '') || 'Custom';
  const hasFaq = cleanSlug.includes('faq');
  const hasBlog = cleanSlug.includes('blog') || cleanSlug.includes('news');

  const fileContent = `import { notFound } from 'next/navigation';
import { getCachedPagePayload } from '@/lib/db/queries';
import Hero from '../components/Hero';
${hasFaq ? "import FaqSection from '../components/Faq';" : ''}
${hasBlog ? "import BlogRoll from '../components/BlogRoll';" : ''}
${!hasFaq && !hasBlog ? "import FeaturedSection from '../components/Featured';" : ''}

export default async function ${compName}Page() {
  const page = await getCachedPagePayload('${cleanSlug}');

  if (!page || !page.isPublished) {
    notFound();
  }

  // 1. Extract dynamic section data configured in /admin/pages/${cleanSlug}
  const heroData = page.sections.find((s) => s.type === 'HERO')?.content as Record<string, string> | undefined;
  ${hasFaq ? "const faqData = page.sections.find((s) => s.type === 'FAQ_ACCORDION')?.content as Record<string, string> | undefined;" : ''}
  ${hasBlog ? "const blogData = page.sections.find((s) => s.type === 'BLOG_ROLL')?.content as Record<string, string> | undefined;" : ''}
  ${!hasFaq && !hasBlog ? "const featuredData = page.sections.find((s) => s.type === 'FEATURED_GRID')?.content as Record<string, string> | undefined;" : ''}

  return (
    <main className="min-h-screen">
      {/* 
        DESIGNER ZONE:
        The backend engine automatically created this route, wired all Prisma queries,
        and connected the admin builder. You only need to focus on styling & HTML!
      */}

      {heroData && (
        <Hero 
          badge={heroData.badge}
          title={heroData.title}
          subtitle={heroData.subtitle}
          primaryCtaText={heroData.primaryCtaText}
          primaryCtaLink={heroData.primaryCtaLink}
        />
      )}

      ${hasFaq ? `{faqData && (
        <FaqSection 
          title={faqData.title}
          subtitle={faqData.subtitle}
        />
      )}` : ''}

      ${hasBlog ? `{blogData && (
        <BlogRoll 
          title={blogData.title}
        />
      )}` : ''}

      ${!hasFaq && !hasBlog ? `{featuredData && (
        <FeaturedSection 
          title={featuredData.title}
          subtitle={featuredData.subtitle}
          description={featuredData.description}
          imageUrl={featuredData.imageUrl}
        />
      )}` : ''}
    </main>
  );
}
`;

  fs.writeFileSync(path.join(appDir, 'page.tsx'), fileContent);

  try {
    revalidateTag(`page:${cleanSlug}`, 'default');
    revalidateTag('sections', 'default');
    revalidatePath('/', 'layout');
    revalidatePath(`/admin/pages/${cleanSlug}`);
  } catch {
    // Suppress outside request context
  }
  return { success: true, url: `/admin/pages/${cleanSlug}` };
}

export async function addSectionAction(pageId: string, pageSlug: string, sectionType: string, defaultContent: any) {
  await prisma.pageSection.create({
    data: {
      pageId,
      type: sectionType as any,
      content: defaultContent,
    }
  });
  
  revalidateTag(`page:${pageSlug}`, 'default');
  revalidateTag('sections', 'default');
  revalidatePath(`/${pageSlug}`);
  revalidatePath(`/admin/pages/${pageSlug}`);
  revalidatePath(`/admin/dashboard/pages/${pageId}`);
  return { success: true };
}
