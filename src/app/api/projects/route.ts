import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/client';
import { requireSuperAdmin } from '@/lib/auth/authorization';
import { writeAuditLog } from '@/lib/audit-log';

const projectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  repository: z.string().trim().regex(/^[\w.-]+\/[\w.-]+$/, 'Use the owner/repository format.'),
  branch: z.string().trim().min(1).max(100).default('main'),
});

export async function GET() {
  await requireSuperAdmin();
  return NextResponse.json({ projects: await prisma.managedProject.findMany({ orderBy: { createdAt: 'desc' } }) });
}

export async function POST(request: Request) {
  const registrationToken = request.headers.get('x-engine-registration-token');
  const isAutomatedRegistration = Boolean(registrationToken && (process.env.GITHUB_SYNC_TOKEN || process.env.GITHUB_TOKEN) && registrationToken === (process.env.GITHUB_SYNC_TOKEN || process.env.GITHUB_TOKEN));
  const actor = isAutomatedRegistration ? null : await requireSuperAdmin();
  const input = projectSchema.parse(await request.json());
  const project = await prisma.managedProject.upsert({
    where: { repository: input.repository },
    update: { name: input.name, branch: input.branch },
    create: input,
  });
  await writeAuditLog({ actorId: actor?.id, action: 'register', resource: 'managed_project', resourceId: project.id, metadata: { repository: project.repository, source: isAutomatedRegistration ? 'start-project' : 'admin' } });
  return NextResponse.json({ project }, { status: 201 });
}
