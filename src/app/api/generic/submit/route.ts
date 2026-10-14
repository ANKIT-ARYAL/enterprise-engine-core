import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/client';

const submissionSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  subject: z.string().max(200).optional(),
  content: z.string().min(1).max(10000),
});

export async function POST(request: Request) {
  try {
    const data = submissionSchema.parse(await request.json());
    const message = await prisma.message.create({ data });
    return NextResponse.json({ success: true, id: message.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof z.ZodError ? 'Invalid submission data' : 'Submission failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
