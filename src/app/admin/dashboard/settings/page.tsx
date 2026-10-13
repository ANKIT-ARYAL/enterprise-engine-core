export const instant = false;

import React from 'react';
import { prisma } from '@/lib/db/client';
import { revalidateTag } from 'next/cache';

export default async function AdminSystemSettings() {
  const settings = await prisma.systemSettings.upsert({
    where: { id: 'global_config' },
    update: {},
    create: { id: 'global_config', siteName: 'Modular Engine', tokens: {} },
  });

  async function updateSettings(formData: FormData) {
    'use server';
    const siteName = formData.get('siteName') as string;
    const logoUrl = formData.get('logoUrl') as string;
    const contactEmail = formData.get('contactEmail') as string;
    const phone = formData.get('phone') as string;

    const currentTokens = (settings.tokens as { logoUrl?: string; contactDetails?: { email?: string; phone?: string } }) || {};
    const newTokens = {
      ...currentTokens,
      logoUrl,
      contactDetails: { email: contactEmail, phone },
    };

    await prisma.systemSettings.update({
      where: { id: 'global_config' },
      data: { siteName, tokens: newTokens },
    });

    revalidateTag('system-settings', 'default');
  }

  const currentTokens = (settings.tokens as { logoUrl?: string; contactDetails?: { email?: string; phone?: string } }) || {};

  return (
    <div className="p-8 w-full">
      <h1 className="text-3xl font-bold mb-8 text-[color:var(--text-main)]">System Settings</h1>
      <p className="text-[color:var(--text-muted)] mb-8">Manage global site configurations like logos, contact details, and core branding elements.</p>

      <form action={updateSettings} className="space-y-6 bg-[color:var(--bg-main)] p-6 border border-[color:var(--card-border)] rounded-[var(--card-radius)]">
        
        <div>
          <label className="block text-sm font-bold mb-2 text-[color:var(--text-main)]">Site Name</label>
          <input type="text" name="siteName" defaultValue={settings.siteName} required
            className="w-full p-3 bg-black/5 border border-[color:var(--card-border)] rounded text-[color:var(--text-main)] focus:outline-none focus:border-[color:var(--accent)] transition"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 text-[color:var(--text-main)]">Logo URL (or use uploader)</label>
          <input type="url" name="logoUrl" defaultValue={currentTokens.logoUrl || ''} 
            className="w-full p-3 bg-black/5 border border-[color:var(--card-border)] rounded text-[color:var(--text-main)] focus:outline-none focus:border-[color:var(--accent)] transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2 text-[color:var(--text-main)]">Contact Email</label>
            <input type="email" name="contactEmail" defaultValue={currentTokens.contactDetails?.email || ''} 
              className="w-full p-3 bg-black/5 border border-[color:var(--card-border)] rounded text-[color:var(--text-main)] focus:outline-none focus:border-[color:var(--accent)] transition"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 text-[color:var(--text-main)]">Contact Phone</label>
            <input type="tel" name="phone" defaultValue={currentTokens.contactDetails?.phone || ''} 
              className="w-full p-3 bg-black/5 border border-[color:var(--card-border)] rounded text-[color:var(--text-main)] focus:outline-none focus:border-[color:var(--accent)] transition"
            />
          </div>
        </div>

        <button type="submit" className="px-6 py-3 bg-[color:var(--accent)] text-white font-bold rounded-[var(--btn-radius)] hover:opacity-90 transition">
          Save Settings
        </button>

      </form>
    </div>
  );
}
