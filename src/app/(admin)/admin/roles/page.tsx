export const instant = false;

import { prisma } from '@/lib/db/client';
import RolesAndPermissionsManager from '@/components/admin/RolesAndPermissionsManager';
import { connection } from 'next/server';

export default async function AdminRolesAndPermissionsPage() {
  await connection();
  const customRoles = await prisma.customRole.findMany({
    include: {
      users: {
        select: { id: true, email: true, name: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="w-full">
      <RolesAndPermissionsManager customRoles={customRoles} />
    </div>
  );
}
