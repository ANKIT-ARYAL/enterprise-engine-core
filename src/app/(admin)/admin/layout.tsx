/* eslint-disable @typescript-eslint/no-explicit-any */
export const instant = false;

import AdminShell from '@/components/admin/AdminShell';
import VisualInspector from '@/components/admin/VisualInspector';
import PatchApplier from '@/components/admin/PatchApplier';
import { prisma } from '@/lib/db/client';
import { getCurrentAdminSession } from '@/lib/auth/session';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [settings, sessionUser] = await Promise.all([
    prisma.systemSettings.findUnique({ where: { id: 'global_config' } }),
    getCurrentAdminSession(),
  ]);
  
  // Default fallback links if none are in the DB
  const defaultNav = {
    dashboards: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      { href: '/admin/pages', label: 'Homepage', icon: 'House' },
      { href: '/admin/blogs', label: 'Blogs', icon: 'BookOpen' },
      { href: '/admin/faq', label: 'FAQ', icon: 'MessageCircleQuestion' },
      { href: '/admin/pages/about-us', label: 'About Us', icon: 'Users' },
      { href: '/admin/pages/contact-us', label: 'Contact Us', icon: 'Mail' },
    ],
    pages: [
      { href: '/admin/users', label: 'Users', icon: 'Users' },
      { href: '/admin/roles', label: 'Roles', icon: 'ShieldCheck' },
      { href: '/admin/recycle-bin', label: 'Recycle Bin', icon: 'Trash2' },
      { href: '/admin/pages', label: 'Pages & Sections', icon: 'Files' },
      { href: '/admin/email', label: 'Contact Messages', icon: 'Mail' },
      { href: '/admin/settings', label: 'System Design', icon: 'Settings' },
    ]
  };

  const navLinks = (settings?.tokens as any)?.navigation || defaultNav;
  const visualPatches = (settings?.tokens as any)?.visualPatches || [];

  return (
    <>
      <PatchApplier patches={visualPatches} />
      <AdminShell initialNav={navLinks} sessionUser={sessionUser}>
        {children}
      </AdminShell>
      <VisualInspector />
    </>
  );
}
