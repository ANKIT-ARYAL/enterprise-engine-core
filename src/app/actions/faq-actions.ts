'use server';

import { prisma } from '@/lib/db/client';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function createFaqsAction(faqs: { question: string; answer: string; order: number }[]) {
  for (const faq of faqs) {
    await prisma.faq.create({
      data: {
        question: faq.question,
        answer: faq.answer,
        order: faq.order,
      }
    });
  }
  revalidateTag('faqs', 'default');
  revalidateTag('global-content', 'default');
  revalidatePath('/admin/faq');
  revalidatePath('/', 'layout');
}

export async function updateFaqAction(id: string, data: { question: string; answer: string; order: number }) {
  await prisma.faq.update({
    where: { id },
    data: {
      question: data.question,
      answer: data.answer,
      order: data.order,
    }
  });
  revalidateTag('faqs', 'default');
  revalidateTag('global-content', 'default');
  revalidatePath('/admin/faq');
  revalidatePath('/', 'layout');
}

export async function deleteFaqAction(id: string) {
  await prisma.faq.delete({
    where: { id }
  });
  revalidateTag('faqs', 'default');
  revalidateTag('global-content', 'default');
  revalidatePath('/admin/faq');
  revalidatePath('/', 'layout');
}
