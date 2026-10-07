'use server';

import { prisma } from '@/lib/db/client';
import { revalidatePath } from 'next/cache';

export async function clearAllPatches() {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Patches can only be managed in development mode');
  }

  const settings = await prisma.systemSettings.findUnique({ where: { id: 'global_config' } });
  const tokens = (settings?.tokens as any) || {};

  await prisma.systemSettings.update({
    where: { id: 'global_config' },
    data: {
      tokens: {
        ...tokens,
        visualPatches: []
      }
    }
  });

  revalidatePath('/', 'layout');
}
