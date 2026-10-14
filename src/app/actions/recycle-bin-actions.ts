'use server';

import { prisma } from '@/lib/db/client';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdminPermission } from '@/lib/auth/authorization';
import { writeAuditLog } from '@/lib/audit-log';

export async function restoreSectionAction(id: string, pageSlug?: string) {
  await requireAdminPermission('recycle:restore');
  await prisma.pageSection.update({
    where: { id },
    data: { isDeleted: false },
  });
  await writeAuditLog({ action: 'restore', resource: 'page_section', resourceId: id });

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
  await requireAdminPermission('recycle:purge');
  await prisma.pageSection.delete({
    where: { id },
  });
  await writeAuditLog({ action: 'purge', resource: 'page_section', resourceId: id });

  revalidateTag('sections', 'default');
  revalidatePath('/admin/recycle-bin');
  return { success: true };
}

export async function restoreProductAction(id: string) {
  await requireAdminPermission('recycle:restore');
  await prisma.product.update({
    where: { id },
    data: { isDeleted: false },
  });
  await writeAuditLog({ action: 'restore', resource: 'product', resourceId: id });

  revalidateTag('products', 'default');
  revalidatePath('/admin/recycle-bin');
  return { success: true };
}

export async function purgeProductAction(id: string) {
  await requireAdminPermission('recycle:purge');
  await prisma.product.delete({
    where: { id },
  });
  await writeAuditLog({ action: 'purge', resource: 'product', resourceId: id });

  revalidateTag('products', 'default');
  revalidatePath('/admin/recycle-bin');
  return { success: true };
}

export async function restoreMediaAction(id: string) {
  await requireAdminPermission('recycle:restore');
  await prisma.mediaVault.update({
    where: { id },
    data: { isDeleted: false },
  });
  await writeAuditLog({ action: 'restore', resource: 'media', resourceId: id });

  revalidateTag('media', 'default');
  revalidatePath('/admin/recycle-bin');
  return { success: true };
}

export async function purgeMediaAction(id: string) {
  await requireAdminPermission('recycle:purge');
  await prisma.mediaVault.delete({
    where: { id },
  });
  await writeAuditLog({ action: 'purge', resource: 'media', resourceId: id });

  revalidateTag('media', 'default');
  revalidatePath('/admin/recycle-bin');
  return { success: true };
}

export async function emptyRecycleBinAction() {
  await requireAdminPermission('recycle:purge');
  await prisma.pageSection.deleteMany({
    where: { isDeleted: true },
  });

  await prisma.product.deleteMany({
    where: { isDeleted: true },
  });

  await prisma.mediaVault.deleteMany({
    where: { isDeleted: true },
  });
  await writeAuditLog({ action: 'empty', resource: 'recycle_bin' });

  revalidateTag('sections', 'default');
  revalidateTag('products', 'default');
  revalidateTag('media', 'default');
  revalidateTag('global-content', 'default');
  revalidatePath('/admin/recycle-bin');
  revalidatePath('/', 'layout');
  return { success: true };
}
