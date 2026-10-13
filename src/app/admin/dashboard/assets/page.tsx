export const instant = false;

import React from 'react';
import { prisma } from '@/lib/db/client';
import Image from 'next/image';

export default async function AssetGallery() {
  const assets = await prisma.mediaVault.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[color:var(--text-main)]">Media Vault</h1>
          <p className="text-[color:var(--text-muted)]">Manage all uploaded images and assets across the platform.</p>
        </div>
        <button className="px-4 py-2 bg-[color:var(--accent)] text-white rounded font-bold shadow-lg hover:opacity-90">
          Upload Images
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {assets.map((asset) => (
          <div key={asset.id} className="group relative rounded-[var(--card-radius)] border border-[color:var(--card-border)] overflow-hidden bg-[color:var(--bg-main)]">
            <div className="aspect-square relative bg-black/5">
              <Image 
                src={asset.storageKey} 
                alt={asset.altText || asset.fileName} 
                fill 
                className="object-cover" 
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button className="px-3 py-1 bg-white/20 text-white rounded text-sm hover:bg-white/40">Copy URL</button>
                <button className="px-3 py-1 bg-red-500 text-white rounded text-sm">Delete</button>
              </div>
            </div>
            <div className="p-3">
              <p className="text-xs font-medium truncate text-[color:var(--text-main)]" title={asset.fileName}>
                {asset.fileName}
              </p>
              <p className="text-xs opacity-50 mt-1">{(asset.fileSize / 1024).toFixed(1)} KB • {asset.mimeType}</p>
            </div>
          </div>
        ))}

        {assets.length === 0 && (
          <div className="col-span-full p-12 text-center border-2 border-dashed border-[color:var(--card-border)] rounded-[var(--card-radius)]">
            <p className="opacity-70">No assets uploaded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
