import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial tokens...');
  await prisma.systemSettings.upsert({
    where: { id: 'global_config' },
    update: {},
    create: {
      id: 'global_config',
      siteName: 'Modular Engine',
      primaryColor: '#2563eb',
      accentColor: '#f97316',
      backgroundColor: '#ffffff',
      textColor: '#0f172a',
      fontHeading: 'Inter',
      fontBody: 'Inter',
      radius: '0.5rem',
    }
  });

  console.log('Seeding administrator user...');
  await prisma.user.upsert({
    where: { email: 'admin@engine.local' },
    update: {},
    create: {
      email: 'admin@engine.local',
      passwordHash: 'dummy_hash_for_admin123456',
      name: 'System Admin',
      role: 'SUPER_ADMIN'
    }
  });

  console.log('Seeding mock catalog...');
  // Note: For a real 40k test, use chunked batches. We insert a few for demonstration.
  const cat = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Tech gadgets'
    }
  });

  await prisma.product.upsert({
    where: { slug: 'mock-laptop' },
    update: {},
    create: {
      title: 'Mock Laptop',
      slug: 'mock-laptop',
      sku: 'LPT-001',
      description: 'A great laptop',
      price: 999.99,
      categoryId: cat.id
    }
  });

  console.log('Seeding default pages...');
  const page = await prisma.page.upsert({
    where: { slug: 'home' },
    update: {},
    create: {
      title: 'Home',
      slug: 'home',
      isSystem: true,
    }
  });

  await prisma.pageSection.create({
    data: {
      pageId: page.id,
      type: 'HERO',
      order: 0,
      content: {
        title: 'Welcome to Enterprise Engine',
        subtitle: 'The best headless setup.',
        primaryCtaText: 'Get Started',
        primaryCtaLink: '/products',
        layout: 'center'
      }
    }
  });

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
