'use server';

import { prisma } from '@/lib/db/client';
import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';



const RoleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  description: z.string().optional().default(''),
  permissions: z.array(z.string()).default([]),
});

export async function createRoleAction(data: z.infer<typeof RoleSchema>) {
  const validated = RoleSchema.parse(data);

  const existing = await prisma.customRole.findUnique({
    where: { name: validated.name },
  });

  if (existing) {
    throw new Error(`A role named "${validated.name}" already exists.`);
  }

  const role = await prisma.customRole.create({
    data: {
      name: validated.name,
      description: validated.description,
      permissions: validated.permissions,
    },
  });

  revalidateTag('roles', 'default');
  revalidatePath('/admin/roles');
  revalidatePath('/admin/permissions');
  return { success: true, role };
}

export async function updateRoleAction(id: string, data: z.infer<typeof RoleSchema>) {
  const validated = RoleSchema.parse(data);

  const role = await prisma.customRole.update({
    where: { id },
    data: {
      name: validated.name,
      description: validated.description,
      permissions: validated.permissions,
    },
  });

  revalidateTag('roles', 'default');
  revalidatePath('/admin/roles');
  revalidatePath('/admin/permissions');
  return { success: true, role };
}

export async function deleteRoleAction(id: string) {
  // Check if users are assigned
  const userCount = await prisma.user.count({
    where: { customRoleId: id },
  });

  if (userCount > 0) {
    throw new Error(`Cannot delete role: ${userCount} active users are currently assigned to this role.`);
  }

  await prisma.customRole.delete({
    where: { id },
  });

  revalidateTag('roles', 'default');
  revalidatePath('/admin/roles');
  revalidatePath('/admin/permissions');
  return { success: true };
}

export async function updatePermissionAssignmentAction(roleId: string, permissionId: string, enabled: boolean) {
  const role = await prisma.customRole.findUnique({
    where: { id: roleId },
  });

  if (!role) throw new Error('Role not found');

  const currentPermissions = new Set(role.permissions);
  if (enabled) {
    currentPermissions.add(permissionId);
  } else {
    currentPermissions.delete(permissionId);
  }

  await prisma.customRole.update({
    where: { id: roleId },
    data: { permissions: Array.from(currentPermissions) },
  });

  revalidateTag('roles', 'default');
  revalidatePath('/admin/roles');
  revalidatePath('/admin/permissions');
  return { success: true };
}
