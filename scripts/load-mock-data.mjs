import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient, Prisma } from '@prisma/client';

async function main() {
const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, value] = arg.replace(/^--/, '').split('=');
  return [key, value ?? true];
}));
const modelName = String(args.model || '');
const file = String(args.file || '');
if (!modelName || !file) throw new Error('Usage: pnpm load:mock-data --model=ModelName --file=staging/data.json [--dry-run]');
if (process.env.NODE_ENV === 'production' && args['allow-production'] !== true) throw new Error('Mock data cannot be loaded into production.');

const payload = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
const records = payload?.records;
if (payload?.generatedFor !== 'staging' || !Array.isArray(records) || !records.length) throw new Error('The file must contain generatedFor="staging" and a non-empty records array.');

const model = Prisma.dmmf.datamodel.models.find((candidate) => candidate.name.toLowerCase() === modelName.toLowerCase());
if (!model) throw new Error(`Unknown Prisma model: ${modelName}`);
const writable = new Set(model.fields.filter((field) => field.kind === 'scalar' && !field.isId && !field.isUpdatedAt && field.name !== 'createdAt').map((field) => field.name));
const sanitized = records.map((record, index) => {
  const unknown = Object.keys(record).filter((key) => !writable.has(key));
  if (unknown.length) throw new Error(`Record ${index + 1} contains unsupported fields: ${unknown.join(', ')}`);
  return Object.fromEntries(Object.entries(record).filter(([key]) => writable.has(key)));
});

if (args['dry-run'] === true) {
  console.log(`Validated ${sanitized.length} ${model.name} staging records.`);
  process.exit(0);
}

const prisma = new PrismaClient();
try {
  const delegate = prisma[model.name.charAt(0).toLowerCase() + model.name.slice(1)];
  if (!delegate?.createMany) throw new Error(`Model ${model.name} does not support createMany.`);
  const result = await delegate.createMany({ data: sanitized });
  console.log(`Inserted ${result.count} ${model.name} staging records.`);
} finally {
  await prisma.$disconnect();
}
}

void main();
