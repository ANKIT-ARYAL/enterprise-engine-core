import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const retentionDays = Number(process.env.AUDIT_LOG_RETENTION_DAYS || 90);
    if (!Number.isInteger(retentionDays) || retentionDays < 1) {
      throw new Error('AUDIT_LOG_RETENTION_DAYS must be a positive integer.');
    }
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const result = await prisma.auditLog.deleteMany({ where: { createdAt: { lt: cutoff } } });
    console.log(`Deleted ${result.count} audit logs older than ${retentionDays} days.`);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
