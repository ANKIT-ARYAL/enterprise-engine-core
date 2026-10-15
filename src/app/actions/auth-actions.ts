'use server';

import { prisma } from '@/lib/db/client';
import { verifyPassword, hashPassword } from '@/lib/auth/passwords';
import { createAdminSession, destroyAdminSession, getCurrentAdminSession } from '@/lib/auth/session';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const LoginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function loginAction(formData: FormData) {
  const emailRaw = formData.get('email');
  const passwordRaw = formData.get('password');

  const parsed = LoginSchema.safeParse({ email: emailRaw, password: passwordRaw });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid input format' };
  }

  const { email, password } = parsed.data;

  // 1. Look up user in database
  let user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { customRole: true },
  });

  // 2. Fallback / Seed check for system admin credentials if not existing
  const superAdminEmail = process.env.SUPERADMIN_EMAIL?.toLowerCase();
  const superAdminPassword = process.env.SUPERADMIN_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!user) {
    if (superAdminEmail && superAdminPassword && email.toLowerCase() === superAdminEmail && password === superAdminPassword) {
      user = await prisma.user.create({
        data: {
          email: superAdminEmail,
          passwordHash: hashPassword(superAdminPassword),
          name: 'Super Admin',
          role: 'SUPER_ADMIN',
        },
        include: { customRole: true },
      });
    } else if (adminEmail && adminPassword && email.toLowerCase() === adminEmail && password === adminPassword) {
      user = await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash: hashPassword(adminPassword),
          name: 'System Admin',
          // The configured admin bootstrap account is a regular admin.
          // Only the superadmin bootstrap account receives root access.
          role: 'ADMIN',
        },
        include: { customRole: true },
      });
    }
  }

  // The configured bootstrap credentials are authoritative. This also repairs
  // databases created by older seeds that stored the wrong admin email/role.
  if (
    user &&
    superAdminEmail &&
    superAdminPassword &&
    email.toLowerCase() === superAdminEmail &&
    password === superAdminPassword &&
    user.role !== 'SUPER_ADMIN'
  ) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'SUPER_ADMIN' },
      include: { customRole: true },
    });
  }

  if (!user) {
    return { success: false, error: 'Invalid email or password.' };
  }

  if (user.isBanned) {
    return { success: false, error: 'This account has been disabled. Contact an administrator.' };
  }

  // 3. Verify password
  let isValid = false;
  if (user.passwordHash.includes(':')) {
    isValid = verifyPassword(password, user.passwordHash);
  } else {
    // Check fallback plain text or dummy hash match
    if (
      (superAdminEmail && superAdminPassword && user.email === superAdminEmail && password === superAdminPassword) ||
      (adminEmail && adminPassword && user.email === adminEmail && password === adminPassword)
    ) {
      isValid = true;
      // Upgrade to secure hash immediately
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashPassword(password) },
      });
    }
  }

  if (!isValid) {
    return { success: false, error: 'Invalid email or password.' };
  }

  // 4. Create session and cookie
  await createAdminSession(user.id);

  // 5. Check if user is forced to change password
  return {
    success: true,
    mustChangePassword: user.mustChangePassword,
  };
}

export async function logoutAction() {
  await destroyAdminSession();
  return { success: true };
}

/**
 * Force password change for first-time login
 */
const ForcePasswordChangeSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export async function completeFirstTimePasswordChangeAction(formData: FormData) {
  const sessionUser = await getCurrentAdminSession();
  if (!sessionUser) {
    throw new Error('Not authenticated.');
  }

  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  const parsed = ForcePasswordChangeSchema.safeParse({ newPassword, confirmPassword });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || 'Validation failed');
  }

  const newHash = hashPassword(newPassword);

  await prisma.user.update({
    where: { id: sessionUser.id },
    data: {
      passwordHash: newHash,
      mustChangePassword: false,
    },
  });

  revalidatePath('/admin');
  return { success: true };
}
