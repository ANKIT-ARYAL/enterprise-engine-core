export const instant = false;

import { prisma } from '@/lib/db/client';
import RecycleBinManager from '@/components/admin/RecycleBinManager';

export default async function RecycleBinPage() {
  const [deletedSections, deletedProducts, deletedMedia] = await Promise.all([
    prisma.pageSection.findMany({
      where: { isDeleted: true },
      include: { page: { select: { id: true, title: true, slug: true } } },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.product.findMany({
      where: { isDeleted: true },
      select: { id: true, title: true, slug: true, price: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.mediaVault.findMany({
      where: { isDeleted: true },
      select: { id: true, fileName: true, fileSize: true, mimeType: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const formattedSections = deletedSections.map((s) => ({
    id: s.id,
    type: s.type,
    updatedAt: s.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    page: s.page,
  }));

  const formattedProducts = deletedProducts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.price.toString(),
    updatedAt: p.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  }));

  const formattedMedia = deletedMedia.map((m) => ({
    id: m.id,
    fileName: m.fileName,
    fileSize: m.fileSize,
    mimeType: m.mimeType,
    createdAt: m.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  }));

  return (
    <div className="w-full">
      <RecycleBinManager
        deletedSections={formattedSections}
        deletedProducts={formattedProducts}
        deletedMedia={formattedMedia}
      />
    </div>
  );
}
