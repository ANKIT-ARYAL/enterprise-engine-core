import { getCurrentAdminSession, type AdminSessionUser } from './session';

export async function requireAdminPermission(permission: string): Promise<AdminSessionUser> {
  const user = await getCurrentAdminSession();
  if (!user) throw new Error('Unauthorized');
  if (user.role !== 'SUPER_ADMIN' && !user.permissions.includes('*') && !user.permissions.includes(permission)) {
    throw new Error(`Forbidden: missing ${permission} permission`);
  }
  return user;
}

export async function requireSuperAdmin(): Promise<AdminSessionUser> {
  const user = await getCurrentAdminSession();
  if (!user || user.role !== 'SUPER_ADMIN') throw new Error('Superadmin access required');
  return user;
}
