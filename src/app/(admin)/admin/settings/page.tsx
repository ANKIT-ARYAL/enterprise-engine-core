export const instant = false;

import { prisma } from '@/lib/db/client';
import SettingsForm from '@/components/admin/SettingsForm';

export default async function SettingsPage() {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 'global_config' }
  });

  const pages = await prisma.page.findMany({
    where: { isPublished: true },
    select: { id: true, title: true, slug: true },
    orderBy: { createdAt: 'asc' }
  });

  if (!settings) return <div>Fatal Error: System config not seeded.</div>;

  return <SettingsForm initialSettings={settings} availablePages={pages} />;
}
