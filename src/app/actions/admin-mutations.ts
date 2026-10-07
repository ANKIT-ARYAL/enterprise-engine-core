/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/client';
import { z } from 'zod';

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

  // Purges Vercel Edge node cache globally in real time
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function mutateSectionAction(sectionId: string, pageSlug: string, content: unknown) {
  await prisma.pageSection.update({
    where: { id: sectionId },
    data: { content: content as any },
  });

  // Invalidate page-specific cache tags
  revalidatePath(`/${pageSlug}`);
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function softDeleteSectionAction(sectionId: string, pageSlug: string) {
  await prisma.pageSection.update({
    where: { id: sectionId },
    data: { isDeleted: true },
  });

  revalidatePath(`/${pageSlug}`);
  revalidatePath('/', 'layout');
  return { success: true };
}
