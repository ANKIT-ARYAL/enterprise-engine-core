'use server';

import { prisma } from '@/lib/db/client';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdminPermission } from '@/lib/auth/authorization';
import { writeAuditLog } from '@/lib/audit-log';

export async function createFaqsAction(faqs: { question: string; answer: string; order: number }[]) {
  await requireAdminPermission('content:create');
  for (const faq of faqs) {
    await prisma.faq.create({
      data: {
        question: faq.question,
        answer: faq.answer,
        order: faq.order,
      }
    });
  }
  await writeAuditLog({ action: 'bulk_create', resource: 'faq', metadata: { count: faqs.length } });
  revalidateTag('faqs', 'default');
  revalidateTag('global-content', 'default');
  revalidatePath('/admin/faq');
  revalidatePath('/', 'layout');
}

export async function updateFaqAction(id: string, data: { question: string; answer: string; order: number }) {
  await requireAdminPermission('content:edit');
  await prisma.faq.update({
    where: { id },
    data: {
      question: data.question,
      answer: data.answer,
      order: data.order,
    }
  });
  await writeAuditLog({ action: 'update', resource: 'faq', resourceId: id });
  revalidateTag('faqs', 'default');
  revalidateTag('global-content', 'default');
  revalidatePath('/admin/faq');
  revalidatePath('/', 'layout');
}

export async function deleteFaqAction(id: string) {
  await requireAdminPermission('content:delete');
  await prisma.faq.delete({
    where: { id }
  });
  await writeAuditLog({ action: 'delete', resource: 'faq', resourceId: id });
  revalidateTag('faqs', 'default');
  revalidateTag('global-content', 'default');
  revalidatePath('/admin/faq');
  revalidatePath('/', 'layout');
}
