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

export const getCachedFaqs = () =>
  unstable_cache(
    async () => {
      return prisma.faq.findMany({
        where: { isPublished: true },
        orderBy: { order: 'asc' },
      });
    },
    ['public-faqs'],
    {
      tags: ['faqs', 'global-content'],
      revalidate: 86400,
    }
  )();

export const getCachedPosts = (take = 10) =>
  unstable_cache(
    async () => {
      return prisma.post.findMany({
        take,
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { name: true, email: true } },
        },
      });
    },
    [`public-posts-${take}`],
    {
      tags: ['posts', 'global-content'],
      revalidate: 86400,
    }
  )();

export const getCachedPostBySlug = (slug: string) =>
  unstable_cache(
    async () => {
      return prisma.post.findUnique({
        where: { slug, published: true },
        include: {
          author: { select: { name: true, email: true } },
        },
      });
    },
    [`post-${slug}`],
    {
      tags: [`post:${slug}`, 'posts'],
      revalidate: 86400,
    }
  )();

export const getCachedCategories = () =>
  unstable_cache(
    async () => {
      return prisma.category.findMany({
        orderBy: { name: 'asc' },
      });
    },
    ['public-categories'],
    {
      tags: ['categories', 'catalog'],
      revalidate: 86400,
    }
  )();

export const getCachedSidebarNav = () =>
  unstable_cache(
    async () => {
      return prisma.sidebarNav.findMany({
        orderBy: { order: 'asc' },
      });
    },
    ['sidebar-nav-items'],
    {
      tags: ['navigation', 'system-settings'],
      revalidate: 86400,
    }
  )();

export const getCachedPages = () =>
  unstable_cache(
    async () => {
      return prisma.page.findMany({
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          slug: true,
        },
        orderBy: { createdAt: 'asc' },
      });
    },
    ['public-all-pages'],
    {
      tags: ['pages', 'navigation', 'global-content'],
      revalidate: 86400,
    }
  )();

