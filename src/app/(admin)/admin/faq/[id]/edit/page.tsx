import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/client';
import { FaqForm } from '../../components/FaqForm';

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const faq = await prisma.faq.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!faq) {
    notFound();
  }

  return (
    <div className="p-4 md:p-8">
      <FaqForm initialData={faq} isEditing={true} />
    </div>
  );
}
