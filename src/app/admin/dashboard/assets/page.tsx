export const instant = false;
import Image from 'next/image';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { prisma } from '@/lib/db/client';

export default async function AssetGallery() {
  const assets = await prisma.mediaVault.findMany({ orderBy: { createdAt: 'desc' } });
  return <div className="mx-auto w-full max-w-[1600px] space-y-8 pb-24">
    <header className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between"><div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">System / assets</p><h1 className="text-3xl font-bold tracking-[-0.04em] text-foreground md:text-4xl">Media vault</h1><p className="mt-2 text-sm text-muted-foreground">Manage uploaded images and assets across the platform.</p></div><button className="inline-flex items-center gap-2 rounded-btn bg-btn-bg px-4 py-2.5 text-xs font-semibold text-btn-text shadow-sm transition-colors hover:bg-btn-hover hover:text-btn-hover-text"><Upload size={14} /> Upload images</button></header>
    <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">{assets.map((asset) => <article key={asset.id} className="group overflow-hidden rounded-card border border-border bg-card shadow-sm"><div className="relative aspect-square bg-muted/40"><Image src={asset.storageKey} alt={asset.altText || asset.fileName} fill sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" /></div><div className="p-4"><p className="truncate text-xs font-semibold text-foreground" title={asset.fileName}>{asset.fileName}</p><p className="mt-1 text-[11px] text-muted-foreground">{(asset.fileSize / 1024).toFixed(1)} KB · {asset.mimeType}</p></div></article>)}</section>
    {assets.length === 0 && <div className="rounded-card border border-dashed border-border bg-card p-12 text-center"><ImageIcon className="mx-auto mb-3 text-muted-foreground" size={24} /><p className="text-sm text-muted-foreground">No assets uploaded yet.</p></div>}
  </div>;
}
