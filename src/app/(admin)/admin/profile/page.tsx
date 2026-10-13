export const instant = false;

import { getCurrentAdminSession } from '@/lib/auth/session';
import ProfileManager from '@/components/admin/ProfileManager';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';

export default async function AdminProfilePage() {
  await connection();
  const sessionUser = await getCurrentAdminSession();

  if (!sessionUser) {
    redirect('/admin/login');
  }

  return (
    <div className="w-full">
      <ProfileManager initialUser={sessionUser} />
    </div>
  );
}
