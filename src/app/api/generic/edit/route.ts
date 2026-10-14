import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/client';
import { requireAdminPermission } from '@/lib/auth/authorization';

const requestSchema = z.object({ model: z.enum(['post', 'faq']), id: z.string().min(1), data: z.record(z.string(), z.unknown()) });

export async function PUT(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    await requireAdminPermission('content:edit');
    if (body.model === 'post') {
      const data = z.object({ title: z.string().min(1).optional(), slug: z.string().min(1).optional(), content: z.string().min(1).optional(), excerpt: z.string().optional(), published: z.boolean().optional() }).parse(body.data);
      const record = await prisma.post.update({ where: { id: body.id }, data: { ...data, ...(data.slug ? { slug: data.slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-') } : {}) } });
      return NextResponse.json({ success: true, record });
    }
    const record = await prisma.faq.update({ where: { id: body.id }, data: z.object({ question: z.string().min(1).optional(), answer: z.string().min(1).optional(), order: z.number().int().optional() }).parse(body.data) });
    return NextResponse.json({ success: true, record });
  } catch (error) {
    const message = error instanceof z.ZodError ? 'Invalid request data' : error instanceof Error ? error.message : 'Failed to save changes';
    return NextResponse.json({ success: false, error: message }, { status: message.startsWith('Unauthorized') || message.startsWith('Forbidden') ? 403 : 400 });
  }
}
