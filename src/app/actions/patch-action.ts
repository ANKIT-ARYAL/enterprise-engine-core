'use server';

import { prisma } from '@/lib/db/client';
import { revalidatePath } from 'next/cache';

export async function saveVisualPatch(patch: { selector: string, type: 'text' | 'class', value: string }) {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Patches can only be saved in development mode');
  }

  const settings = await prisma.systemSettings.findUnique({ where: { id: 'global_config' } });
  const tokens = (settings?.tokens as any) || {};
  const patches = tokens.visualPatches || [];

  // Update existing or add new
  const existingIdx = patches.findIndex((p: any) => p.selector === patch.selector && p.type === patch.type);
  if (existingIdx >= 0) {
    patches[existingIdx].value = patch.value;
  } else {
    patches.push(patch);
  }

  await prisma.systemSettings.update({
    where: { id: 'global_config' },
    data: {
      tokens: {
        ...tokens,
        visualPatches: patches
      }
    }
  });

  revalidatePath('/', 'layout');
}
