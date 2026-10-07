'use server';

import { prisma } from '@/lib/db/client';
import { revalidatePath } from 'next/cache';

export async function updateNavigationAction(navLinks: any) {
  const settings = await prisma.systemSettings.findUnique({ where: { id: 'global_config' } });
  const tokens = (settings?.tokens as any) || {};

  await prisma.systemSettings.update({
    where: { id: 'global_config' },
    data: {
      tokens: {
        ...tokens,
        navigation: navLinks
      }
    }
  });

  revalidatePath('/', 'layout');
  return { success: true };
}
