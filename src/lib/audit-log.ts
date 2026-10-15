import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/client';
import { getCurrentAdminSession } from '@/lib/auth/session';

type AuditMetadata = Record<string, Prisma.InputJsonValue>;

export async function writeAuditLog(input: {
  actorId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: AuditMetadata;
}) {
  const actor = input.actorId ? { id: input.actorId } : await getCurrentAdminSession();

  await prisma.auditLog.create({
    data: {
      actorId: actor?.id,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId,
      metadata: input.metadata,
    },
  });
}
