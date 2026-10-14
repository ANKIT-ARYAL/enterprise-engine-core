/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { prisma } from '@/lib/db/client';
import { hashPassword, verifyPassword, generateSecurePassword, generateRandomEmail } from '@/lib/auth/passwords';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';
import { writeAuditLog } from '@/lib/audit-log';

const UserCreateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Valid email is required'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'CUSTOM', 'USER']),
  customRoleId: z.string().nullable().optional(),
  mustChangePassword: z.boolean().default(true),
});

const UserUpdateSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email('Valid email is required'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'CUSTOM', 'USER']),
  customRoleId: z.string().nullable().optional(),
  password: z.string().optional(),
  isBanned: z.boolean().optional(),
});

/**
 * Fetch all users with custom role metadata for admin management
 */
export async function getUsersListAction() {
  const sessionUser = await getCurrentAdminSession();
  if (!sessionUser) {
    throw new Error('Unauthorized');
  }

  const users = await prisma.user.findMany({
    include: {
      customRole: {
        select: { id: true, name: true, permissions: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return users.map(u => ({
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
}

/**
 * Create a new user with auto-generated credentials option
 */
export async function createUserAction(data: {
  name?: string;
  email?: string;
  password?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOM' | 'USER';
  customRoleId?: string | null;
}) {
  const sessionUser = await getCurrentAdminSession();
  if (!sessionUser) {
    throw new Error('Unauthorized');
  }

  if (data.role === 'SUPER_ADMIN' && sessionUser.role !== 'SUPER_ADMIN') {
    throw new Error('Only a superadmin can create another superadmin.');
  }

  // Auto-generate email if missing or requested
  const email = (data.email && data.email.trim()) 
    ? data.email.trim().toLowerCase() 
    : generateRandomEmail(data.name);

  // Auto-generate secure password if empty
  const rawPassword = (data.password && data.password.trim()) 
    ? data.password.trim() 
    : generateSecurePassword(14);

  const validated = UserCreateSchema.parse({
    name: data.name?.trim() || null,
    email,
    password: rawPassword,
    role: data.role,
    customRoleId: data.customRoleId || null,
    mustChangePassword: true, // First-time login forces password change
  });

  const existing = await prisma.user.findUnique({
    where: { email: validated.email },
  });

  if (existing) {
    throw new Error(`A user with email "${validated.email}" already exists.`);
  }

  const user = await prisma.user.create({
    data: {
      name: validated.name,
      email: validated.email,
      passwordHash: hashPassword(validated.password),
      role: validated.role,
      customRoleId: validated.customRoleId,
      mustChangePassword: true,
    },
    include: { customRole: true },
  });

  revalidateTag('roles', 'default');
  revalidatePath('/admin/users');
  revalidatePath('/admin/roles');
  await writeAuditLog({ action: 'create', resource: 'user', resourceId: user.id, metadata: { role: user.role } });

  // Return generated credentials so admin can view/copy them
  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      customRoleName: user.customRole?.name || null,
    },
    generatedCredentials: {
      email: user.email,
      temporaryPassword: rawPassword,
    },
  };
}

/**
 * Update an existing user's role, name, or password
 */
export async function updateUserAction(data: {
  id: string;
  name?: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOM' | 'USER';
  customRoleId?: string | null;
  password?: string;
  isBanned?: boolean;
}) {
  const sessionUser = await getCurrentAdminSession();
  if (!sessionUser) {
    throw new Error('Unauthorized');
  }

  const validated = UserUpdateSchema.parse(data);

  if (validated.role === 'SUPER_ADMIN' && sessionUser.role !== 'SUPER_ADMIN') {
    throw new Error('Only a superadmin can assign the superadmin role.');
  }

  // Check email uniqueness if modified
  const existing = await prisma.user.findUnique({
    where: { email: validated.email.toLowerCase() },
  });

  if (existing && existing.id !== validated.id) {
    throw new Error(`Email "${validated.email}" is already used by another account.`);
  }

  const updatePayload: any = {
    name: validated.name || null,
    email: validated.email.toLowerCase(),
    role: validated.role,
    customRoleId: validated.customRoleId || null,
  };

  if (validated.isBanned !== undefined) {
    updatePayload.isBanned = validated.isBanned;
  }

  if (validated.password && validated.password.trim().length >= 8) {
    updatePayload.passwordHash = hashPassword(validated.password.trim());
    updatePayload.mustChangePassword = true; // reset force password flag if admin reset password
  }

  const updatedUser = await prisma.user.update({
    where: { id: validated.id },
    data: updatePayload,
  });

  revalidatePath('/admin/users');
  revalidatePath('/admin/roles');
  await writeAuditLog({ action: 'update', resource: 'user', resourceId: updatedUser.id, metadata: { role: updatedUser.role, isBanned: updatedUser.isBanned } });
  return { success: true, user: updatedUser };
}

/**
 * Delete a user
 */
export async function deleteUserAction(id: string) {
  const sessionUser = await getCurrentAdminSession();
  if (!sessionUser) {
    throw new Error('Unauthorized');
  }

  if (sessionUser.id === id) {
    throw new Error('You cannot delete your own active account.');
  }

  await prisma.user.delete({
    where: { id },
  });

  revalidatePath('/admin/users');
  revalidatePath('/admin/roles');
  await writeAuditLog({ action: 'delete', resource: 'user', resourceId: id });
  return { success: true };
}

/**
 * Update personal profile (Self email / password change)
 */
const ProfileUpdateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Valid email is required'),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
});

export async function updateOwnProfileAction(formData: FormData) {
  const sessionUser = await getCurrentAdminSession();
  if (!sessionUser) {
    throw new Error('Unauthorized: please log in.');
  }

  const name = formData.get('name') as string;
  const email = (formData.get('email') as string)?.toLowerCase().trim();
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;

  const parsed = ProfileUpdateSchema.safeParse({ name, email, currentPassword, newPassword });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || 'Validation error');
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
  });

  if (!user) {
    throw new Error('User record not found.');
  }

  // If changing email, ensure email is not already in use
  if (email !== user.email) {
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      throw new Error(`Email address "${email}" is already registered.`);
    }
  }

  const dataToUpdate: any = {
    name: name || user.name,
    email: email || user.email,
  };

  // If new password is provided, current password MUST match
  if (newPassword && newPassword.trim().length > 0) {
    if (!currentPassword) {
      throw new Error('Current password is required to set a new password.');
    }
    if (newPassword.trim().length < 8) {
      throw new Error('New password must be at least 8 characters.');
    }
    const isCurrentValid = verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      throw new Error('Current password is incorrect.');
    }
    dataToUpdate.passwordHash = hashPassword(newPassword.trim());
    dataToUpdate.mustChangePassword = false;
  }

  await prisma.user.update({
    where: { id: sessionUser.id },
    data: dataToUpdate,
  });

  revalidatePath('/admin/profile');
  revalidatePath('/admin');
  return { success: true, email: dataToUpdate.email, name: dataToUpdate.name };
}
