'use server';

import { prisma } from '@/lib/db/client';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function createPostAction(data: { title: string; slug: string; excerpt?: string; content: string; published?: boolean }) {
  // Ensure default author exists
  let author = await prisma.user.findFirst();
  if (!author) {
    author = await prisma.user.create({
      data: {
        email: 'admin@enterprise.engine',
        name: 'System Admin',
        passwordHash: 'insecure_placeholder_hash',
        role: 'ADMIN',
      }
    });
  }

  const post = await prisma.post.create({
    data: {
      title: data.title,
      slug: data.slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
      excerpt: data.excerpt,
      content: data.content,
      published: data.published ?? true,
      authorId: author.id,
    }
  });

  try {
    revalidateTag('posts', 'default');
    revalidateTag('global-content', 'default');
    revalidatePath('/admin/blogs');
    revalidatePath('/blogs');
    revalidatePath('/', 'layout');
  } catch {
    // Suppress outside request context
  }

  return { success: true, post };
}

export async function updatePostAction(id: string, data: { title: string; slug: string; excerpt?: string; content: string; published?: boolean }) {
  const post = await prisma.post.update({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
      excerpt: data.excerpt,
      content: data.content,
      published: data.published ?? true,
    }
  });

  try {
    revalidateTag('posts', 'default');
    revalidateTag(`post:${post.slug}`, 'default');
    revalidateTag('global-content', 'default');
    revalidatePath('/admin/blogs');
    revalidatePath('/blogs');
    revalidatePath(`/${post.slug}`);
    revalidatePath('/', 'layout');
  } catch {
    // Suppress outside request context
  }

  return { success: true, post };
}

export async function deletePostAction(id: string) {
  const post = await prisma.post.delete({
    where: { id }
  });

  try {
    revalidateTag('posts', 'default');
    revalidateTag(`post:${post.slug}`, 'default');
    revalidateTag('global-content', 'default');
    revalidatePath('/admin/blogs');
    revalidatePath('/blogs');
    revalidatePath('/', 'layout');
  } catch {
    // Suppress outside request context
  }

  return { success: true };
}
