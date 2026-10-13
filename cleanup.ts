import { prisma } from './src/lib/db/client';

async function main() {
  const page = await prisma.page.findUnique({
    where: { slug: 'home' },
    include: { sections: true }
  });
  if (page) {
    console.log(`Found ${page.sections.length} sections for home page.`);
    // Delete all except the first one
    if (page.sections.length > 1) {
      for (let i = 1; i < page.sections.length; i++) {
        await prisma.pageSection.delete({
          where: { id: page.sections[i].id }
        });
        console.log(`Deleted section ${page.sections[i].id}`);
      }
    }
  }
}
main();
