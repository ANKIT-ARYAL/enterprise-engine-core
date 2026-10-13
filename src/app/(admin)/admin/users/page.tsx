export const instant = false;

import { prisma } from '@/lib/db/client';
import UsersManager from '@/components/admin/UsersManager';
import { connection } from 'next/server';

export default async function AdminUsersPage() {
  await connection();

  const [users, customRoles, settings] = await Promise.all([
    prisma.user.findMany({
      include: {
        customRole: {
          select: { id: true, name: true, permissions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.customRole.findMany({
      select: { id: true, name: true, permissions: true },
      orderBy: { name: 'asc' },
    }),
    prisma.systemSettings.findUnique({
      where: { id: 'global_config' },
      select: { siteName: true },
    }),
  ]);

  const serializedUsers = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    customRoleId: u.customRoleId,
    customRoleName: u.customRole?.name || null,
    permissions: u.customRole?.permissions || u.permissions || [],
    mustChangePassword: u.mustChangePassword,
    isBanned: u.isBanned,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  }));

  return (
    <div className="w-full">
      <UsersManager 
        initialUsers={serializedUsers} 
        availableCustomRoles={customRoles} 
        siteName={settings?.siteName || 'engine'}
      />
    </div>
  );
}
