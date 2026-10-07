import { execSync } from 'node:child_process';
import { existsSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import crypto from 'node:crypto';

function run(command, env = {}) {
  execSync(command, { stdio: 'inherit', env: { ...process.env, ...env } });
}

console.log('🚀 Initializing Enterprise Headless Engine...');

// 1. Environment File Check
if (!existsSync('.env')) {
  console.log('📄 Generating .env from .env.example...');
  copyFileSync('.env.example', '.env');
  
  const secret = crypto.randomBytes(32).toString('hex');
  let envContent = readFileSync('.env', 'utf-8');
  envContent = envContent.replace('REPLACE_WITH_GENERATED_32_BYTE_HEX_SECRET', secret);
  writeFileSync('.env', envContent);
}

// 2. Docker Health and Up
try {
  console.log('🐳 Verifying Docker Daemon...');
  execSync('docker info', { stdio: 'ignore' });
} catch {
  console.error('❌ Error: Docker is not running. Please start Docker and re-run.');
  process.exit(1);
}

console.log('📦 Starting Docker Services (Postgres 16, Redis, MinIO)...');
run('docker compose -f docker/docker-compose.yml up -d --wait');

// 3. Database Sync & Migrations
console.log('🔄 Running Database Migrations via Prisma...');
run('pnpm prisma migrate dev --name init');
run('pnpm prisma generate');

// 4. Seed Core System Tokens & Administrator
console.log('🌱 Seeding Core Design Tokens and Default Layout...');
run('pnpm prisma db seed');

console.log('\n✅ Local Infrastructure is Live.');
console.log('👉 Public URL: http://localhost:3000');
console.log('👉 Admin URL:  http://localhost:3000/admin (Default: admin@engine.local / admin123456)\n');
