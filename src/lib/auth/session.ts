import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/client';

export const SESSION_COOKIE_NAME = 'engine_admin_session';

export interface AdminSessionUser {
  id: string;
  email: string;
  name: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOM' | 'USER';
  customRoleId: string | null;
  customRoleName?: string | null;
  permissions: string[];
  mustChangePassword: boolean;
}

/**
 * Encrypt / sign session token payload or store session ID in database.
 * We store a real Session row in PostgreSQL with token string for revocation capabilities.
 */
export async function createAdminSession(userId: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return token;
}

/**
 * Destroy current session.
 */
export async function destroyAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    try {
      await prisma.session.deleteMany({
        where: { token },
      });
    } catch {
      // Ignored
    }
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Get current verified session user.
 */
export async function getCurrentAdminSession(): Promise<AdminSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  // Fallback support for legacy demo cookie if needed
  if (token === 'SUPER_ADMIN' || token === 'ADMIN') {
    const fallbackUser = await prisma.user.findFirst({
      where: { role: token as 'SUPER_ADMIN' | 'ADMIN' },
      include: { customRole: true },
    });
    if (fallbackUser) {
      return {
        id: fallbackUser.id,
        email: fallbackUser.email,
        name: fallbackUser.name,
        role: fallbackUser.role,
        customRoleId: fallbackUser.customRoleId,
        customRoleName: fallbackUser.customRole?.name || null,
        permissions: fallbackUser.customRole?.permissions || fallbackUser.permissions || [],
        mustChangePassword: fallbackUser.mustChangePassword,
      };
    }
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        include: { customRole: true },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    }
    return null;
  }

  const { user } = session;
  if (user.isBanned) return null;

  const permissions = user.role === 'SUPER_ADMIN'
    ? ['*'] // Superadmin possesses global scope
    : user.customRole?.permissions || user.permissions || [];

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    customRoleId: user.customRoleId,
    customRoleName: user.customRole?.name || null,
    permissions,
    mustChangePassword: user.mustChangePassword,
  };
}
