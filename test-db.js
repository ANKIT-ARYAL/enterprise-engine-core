const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const page = await prisma.page.findUnique({ where: { slug: 'home' }, include: { sections: true } });
  console.log(JSON.stringify(page.sections[0].content, null, 2));
}
main();
