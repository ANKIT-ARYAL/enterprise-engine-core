export const instant = false;

import React from 'react';
import { prisma } from '@/lib/db/client';
import Link from 'next/link';

export default async function AdminRoles() {
  const customRoles = await prisma.customRole.findMany({
    include: { users: true }
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-[color:var(--text-main)]">Role Management</h1>
      <div className="mb-6 flex justify-between items-center">
        <p className="text-[color:var(--text-muted)]">Manage custom roles and their permissions for your project.</p>
        <Link href="/admin/dashboard/roles/new" className="px-4 py-2 bg-[color:var(--accent)] text-white rounded font-bold">
          + Create New Role
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {customRoles.map((role) => (
          <div key={role.id} className="p-6 border border-[color:var(--card-border)] rounded-[var(--card-radius)] shadow flex justify-between items-start bg-[color:var(--bg-main)]">
            <div>
              <h2 className="font-bold text-xl text-[color:var(--text-main)]">{role.name}</h2>
              <p className="text-sm text-[color:var(--text-muted)] mb-2">{role.description || 'No description provided.'}</p>
              <p className="text-sm font-semibold opacity-70">Users with this role: {role.users.length}</p>
            </div>
            <Link href={`/admin/dashboard/roles/\${role.id}`} className="px-4 py-2 bg-blue-600/10 text-blue-500 rounded font-medium hover:bg-blue-600/20 transition">
              Edit Role
            </Link>
          </div>
        ))}
        {customRoles.length === 0 && (
          <div className="col-span-full p-8 text-center border border-dashed border-[color:var(--card-border)] rounded-[var(--card-radius)]">
            <p className="opacity-70">No custom roles created yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
