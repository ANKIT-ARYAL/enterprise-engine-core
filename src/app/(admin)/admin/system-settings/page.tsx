export const instant = false;

import { prisma } from '@/lib/db/client';
import SystemSettingsManager from '@/components/admin/SystemSettingsManager';

export default async function SystemSettingsPage() {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 'global_config' },
  });

  const pages = await prisma.page.findMany({
    where: { isPublished: true },
    select: { id: true, title: true, slug: true },
    orderBy: { createdAt: 'asc' },
  });

  if (!settings) {
    return (
      <div className="p-8 text-center text-rose-600 font-semibold">
        System configuration not seeded. Please contact database administrator.
      </div>
    );
  }

  return (
    <div className="w-full">
      <SystemSettingsManager initialSettings={settings} availablePages={pages} />
    </div>
  );
}
