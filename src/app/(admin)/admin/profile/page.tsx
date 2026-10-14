export const instant = false;

import { getCurrentAdminSession } from '@/lib/auth/session';
import ProfileManager from '@/components/admin/ProfileManager';
import { redirect } from 'next/navigation';

export default async function AdminProfilePage() {
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
