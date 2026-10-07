import { prisma } from '@/lib/db/client';
import SettingsForm from '@/components/admin/SettingsForm';

export default async function SettingsPage() {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 'global_config' }
  });

  if (!settings) return <div>Fatal Error: System config not seeded.</div>;

  return <SettingsForm initialSettings={settings} />;
}
