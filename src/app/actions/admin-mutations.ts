'use server';

import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/db/client';
import { z } from 'zod';

const SettingsSchema = z.object({
  siteName: z.string().min(1),
  customCss: z.string().optional().nullable(),
  tokens: z.record(z.any()).default({}),
});

export async function updateSystemSettingsAction(input: z.infer<typeof SettingsSchema>) {
  const validated = SettingsSchema.parse(input);

  await prisma.systemSettings.update({
    where: { id: 'global_config' },
    data: validated,
  });

  // Purges Vercel Edge node cache globally in real time
  revalidateTag('system-settings');
  return { success: true };
}

export async function mutateSectionAction(sectionId: string, pageSlug: string, content: any) {
  await prisma.pageSection.update({
    where: { id: sectionId },
    data: { content },
  });

  // Invalidate page-specific cache tags
  revalidateTag(`page:${pageSlug}`);
  revalidateTag('sections');
  return { success: true };
}

export async function softDeleteSectionAction(sectionId: string, pageSlug: string) {
  await prisma.pageSection.update({
    where: { id: sectionId },
    data: { isDeleted: true },
  });

  revalidateTag(`page:${pageSlug}`);
  revalidateTag('sections');
  return { success: true };
}
