import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/client';
import { requireAdminPermission } from '@/lib/auth/authorization';

const requestSchema = z.object({
  model: z.enum(['post', 'faq']),
  data: z.record(z.string(), z.unknown()),
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const session = await requireAdminPermission('content:create');
    if (body.model === 'post') {
      const data = z.object({ title: z.string().min(1), slug: z.string().min(1), content: z.string().min(1), excerpt: z.string().optional(), published: z.boolean().optional() }).parse(body.data);
      const record = await prisma.post.create({ data: { ...data, slug: data.slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-'), author: { connect: { id: session.id } } } });
      return NextResponse.json({ success: true, record }, { status: 201 });
    }
    const data = z.object({ question: z.string().min(1), answer: z.string().min(1), order: z.number().int().default(0) }).parse(body.data);
    const record = await prisma.faq.create({ data });
    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (error) {
    const message = error instanceof z.ZodError ? 'Invalid request data' : error instanceof Error ? error.message : 'Failed to add item';
    return NextResponse.json({ success: false, error: message }, { status: message.startsWith('Unauthorized') || message.startsWith('Forbidden') ? 403 : 400 });
  }
}
