import React from 'react';
import { prisma } from '@/lib/db/client';
import { notFound } from 'next/navigation';
import { BlogForm } from '../../components/BlogForm';

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id }
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="w-full space-y-6 pb-24">
      <div className="pb-4 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Article</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Modify contents for &quot;{post.title}&quot;.</p>
      </div>

      <BlogForm initialData={post} isEditing />
    </div>
  );
}
