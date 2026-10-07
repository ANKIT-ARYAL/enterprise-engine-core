import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db/client';

export const getCachedPagePayload = (slug: string) =>
  unstable_cache(
    async () => {
      return prisma.page.findUnique({
        where: { slug, isPublished: true },
        include: {
          sections: {
            where: { isDeleted: false, isEnabled: true },
            orderBy: { order: 'asc' },
          },
        },
      });
    },
    [`page-payload-${slug}`],
    {
      tags: [`page:${slug}`, 'sections', 'global-content'],
      revalidate: 86400,
    }
  )();

export const getCachedSystemSettings = () =>
  unstable_cache(
    async () => {
      return prisma.systemSettings.upsert({
        where: { id: 'global_config' },
        update: {},
        create: { id: 'global_config' },
      });
    },
    ['system-settings-global'],
    {
      tags: ['system-settings'],
      revalidate: 86400,
    }
  )();

export const getCachedProductCatalog = (cursorId?: string, take = 24) =>
  unstable_cache(
    async () => {
      return prisma.product.findMany({
        take,
        skip: cursorId ? 1 : 0,
        cursor: cursorId ? { id: cursorId } : undefined,
        where: { isPublished: true, isDeleted: false },
        orderBy: { id: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          compareAtPrice: true,
          images: true,
          category: { select: { name: true, slug: true } },
        },
      });
    },
    [`catalog-cursor-${cursorId ?? 'first'}-${take}`],
    {
      tags: ['catalog', 'products'],
      revalidate: 3600,
    }
  )();
