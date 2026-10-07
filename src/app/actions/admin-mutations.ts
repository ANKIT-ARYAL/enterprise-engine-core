'use server';

import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/db/client';
import { z } from 'zod';

const SettingsSchema = z.object({
  primaryColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/),
  accentColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/),
  backgroundColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/),
  textColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/),
  fontHeading: z.string().min(1),
  fontBody: z.string().min(1),
  radius: z.string().min(1),
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
