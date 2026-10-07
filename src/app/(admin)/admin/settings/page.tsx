import { prisma } from '@/lib/db/client';
import SettingsForm from '@/components/admin/SettingsForm';
import { connection } from 'next/server';

export default async function SettingsPage() {
  await connection();
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 'global_config' }
  });

  if (!settings) return <div>Fatal Error: System config not seeded.</div>;

  return <SettingsForm initialSettings={settings} />;
}
