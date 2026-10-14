/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { prisma } from '@/lib/db/client';
import { Prisma } from '@prisma/client';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdminPermission } from '@/lib/auth/authorization';

export async function updateNavigationAction(navLinks: unknown) {
  await requireAdminPermission('settings:navigation');
  const settings = await prisma.systemSettings.findUnique({ where: { id: 'global_config' } });
  const tokens = (settings?.tokens as Record<string, unknown>) || {};

  await prisma.systemSettings.update({
    where: { id: 'global_config' },
    data: {
      tokens: {
        ...tokens,
        navigation: navLinks as Prisma.InputJsonValue
      }
    }
  });

  revalidateTag('system-settings', 'default');
  revalidateTag('global-content', 'default');
  revalidatePath('/', 'layout');
  return { success: true };
}
