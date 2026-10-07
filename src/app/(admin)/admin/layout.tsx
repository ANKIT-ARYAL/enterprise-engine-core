export const instant = false;

import AdminShell from '@/components/admin/AdminShell';
import VisualInspector from '@/components/admin/VisualInspector';
import { prisma } from '@/lib/db/client';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const settings = await prisma.systemSettings.findUnique({ where: { id: 'global_config' } });
  
  // Default fallback links if none are in the DB
  const defaultNav = {
    dashboards: [
      { href: '/admin/default', label: 'Default', icon: 'LayoutDashboard' },
      { href: '/admin/crm', label: 'CRM', icon: 'User' },
      { href: '/admin/finance', label: 'Finance', icon: 'CreditCard' },
      { href: '/admin/academy', label: 'Academy', icon: 'GraduationCap' },
    ],
    pages: [
      { href: '/admin/email', label: 'Email', icon: 'Mail' },
      { href: '/admin/settings', label: 'System Design', icon: 'Settings' },
    ]
  };

  const navLinks = (settings?.tokens as any)?.navigation || defaultNav;

  return (
    <>
      <AdminShell initialNav={navLinks}>{children}</AdminShell>
      <VisualInspector />
    </>
  );
}
