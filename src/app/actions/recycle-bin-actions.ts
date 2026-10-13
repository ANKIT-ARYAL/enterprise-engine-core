'use server';

import { prisma } from '@/lib/db/client';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function restoreSectionAction(id: string, pageSlug?: string) {
  await prisma.pageSection.update({
    where: { id },
    data: { isDeleted: false },
  });

  if (pageSlug) {
    revalidateTag(`page:${pageSlug}`, 'default');
  }
  revalidateTag('sections', 'default');
  revalidateTag('global-content', 'default');
  revalidatePath('/admin/recycle-bin');
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function purgeSectionAction(id: string) {
  await prisma.pageSection.delete({
    where: { id },
  });

  revalidateTag('sections', 'default');
  revalidatePath('/admin/recycle-bin');
  return { success: true };
}

export async function restoreProductAction(id: string) {
  await prisma.product.update({
    where: { id },
    data: { isDeleted: false },
  });

  revalidateTag('products', 'default');
  revalidatePath('/admin/recycle-bin');
  return { success: true };
}

export async function purgeProductAction(id: string) {
  await prisma.product.delete({
    where: { id },
  });

  revalidateTag('products', 'default');
  revalidatePath('/admin/recycle-bin');
  return { success: true };
}

export async function restoreMediaAction(id: string) {
  await prisma.mediaVault.update({
    where: { id },
    data: { isDeleted: false },
  });

  revalidateTag('media', 'default');
  revalidatePath('/admin/recycle-bin');
  return { success: true };
}

export async function purgeMediaAction(id: string) {
  await prisma.mediaVault.delete({
    where: { id },
  });

  revalidateTag('media', 'default');
  revalidatePath('/admin/recycle-bin');
  return { success: true };
}

export async function emptyRecycleBinAction() {
  await prisma.pageSection.deleteMany({
    where: { isDeleted: true },
  });

  await prisma.product.deleteMany({
    where: { isDeleted: true },
  });

  await prisma.mediaVault.deleteMany({
    where: { isDeleted: true },
  });

  revalidateTag('sections', 'default');
  revalidateTag('products', 'default');
  revalidateTag('media', 'default');
  revalidateTag('global-content', 'default');
  revalidatePath('/admin/recycle-bin');
  revalidatePath('/', 'layout');
  return { success: true };
}
