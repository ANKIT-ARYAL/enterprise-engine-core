/* eslint-disable @typescript-eslint/no-explicit-any */
export const instant = false;

import AdminShell from '@/components/admin/AdminShell';
import VisualInspector from '@/components/admin/VisualInspector';
import PatchApplier from '@/components/admin/PatchApplier';
import { prisma } from '@/lib/db/client';
import { getCurrentAdminSession } from '@/lib/auth/session';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [settings, sessionUser] = await Promise.all([
    prisma.systemSettings.findUnique({ where: { id: 'global_config' } }),
    getCurrentAdminSession(),
  ]);
  const navLinks = (settings?.tokens as any)?.navigation || { dashboards: [], pages: [] };
  const visualPatches = (settings?.tokens as { visualPatches?: unknown[] } | null)?.visualPatches || [];

  return <><PatchApplier patches={visualPatches} /><AdminShell initialNav={navLinks} sessionUser={sessionUser}>{children}</AdminShell><VisualInspector /></>;
}
