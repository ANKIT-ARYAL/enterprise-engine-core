import { execSync } from 'node:child_process';
import { existsSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import net from 'node:net';

const composeProject = `engine-${path.basename(process.cwd())
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')}`;

function run(command, env = {}) {
  execSync(command, { stdio: 'inherit', env: { ...process.env, ...env } });
}

function capture(command) {
  return execSync(command, { encoding: 'utf8' }).trim();
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => server.close(() => resolve(true)));
    server.listen(port, '127.0.0.1');
  });
}

async function findPort(start) {
  for (let port = start; port < 65536; port += 1) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting at ${start}`);
}

console.log('🚀 Initializing Enterprise Headless Engine...');

console.log('🧾 Preparing isolated environment templates...');
run('pnpm run prepare:env');

// 1. Environment File Check
if (!existsSync('.env')) {
  console.log('📄 Generating .env from .env.example...');
  copyFileSync('.env.example', '.env');
  
  const secret = crypto.randomBytes(32).toString('hex');
  let envContent = readFileSync('.env', 'utf-8');
  envContent = envContent.replace('REPLACE_WITH_GENERATED_32_BYTE_HEX_SECRET', secret);
  writeFileSync('.env', envContent);
}

const envPath = path.resolve('.env');
let envContent = readFileSync(envPath, 'utf8');
const postgresPort = 0;
const redisPort = 0;
const setEnv = (key, value) => {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  envContent = pattern.test(envContent) ? envContent.replace(pattern, line) : `${envContent.trimEnd()}\n${line}\n`;
};
setEnv('POSTGRES_PORT', postgresPort);
setEnv('REDIS_PORT', redisPort);
writeFileSync(envPath, envContent);

// 2. Docker Health and Up
try {
  console.log('🐳 Verifying Docker Daemon...');
  execSync('docker info', { stdio: 'ignore' });
} catch {
  console.error('❌ Error: Docker is not running. Please start Docker and re-run.');
  process.exit(1);
}

console.log(`📦 Starting isolated Docker Services (${composeProject})...`);
run(`docker compose -p ${composeProject} --env-file .env -f docker/docker-compose.yml up -d --wait`);

const assignedPostgresPort = Number(capture(`docker compose -p ${composeProject} -f docker/docker-compose.yml port postgres 5432`).match(/:(\d+)\s*$/)?.[1]);
const assignedRedisPort = Number(capture(`docker compose -p ${composeProject} -f docker/docker-compose.yml port redis 6379`).match(/:(\d+)\s*$/)?.[1]);
if (!assignedPostgresPort || !assignedRedisPort) throw new Error('Docker did not report assigned host ports.');
envContent = readFileSync(envPath, 'utf8');
const replaceEnv = (key, value) => { envContent = envContent.replace(new RegExp(`^${key}=.*$`, 'm'), `${key}=${value}`); };
replaceEnv('POSTGRES_PORT', assignedPostgresPort);
replaceEnv('REDIS_PORT', assignedRedisPort);
replaceEnv('DATABASE_URL', `postgresql://engine_user:engine_local_dev_password@localhost:${assignedPostgresPort}/engine_dev_db`);
replaceEnv('DIRECT_URL', `postgresql://engine_user:engine_local_dev_password@localhost:${assignedPostgresPort}/engine_dev_db`);
writeFileSync(envPath, envContent);
console.log(`🔌 Docker assigned PostgreSQL port ${assignedPostgresPort} and Redis port ${assignedRedisPort}`);

// 3. Database Sync & Migrations
console.log('🔄 Synchronizing fresh database schema via Prisma...');
run('pnpm prisma generate');
// Project bootstrap is intentionally non-interactive. Reviewed migrations remain
// the production deployment mechanism; db push makes a brand-new local database
// match the current template schema without asking the user to create a migration.
run('pnpm prisma db push --accept-data-loss');

// 4. Seed Core System Tokens & Administrator
console.log('🌱 Seeding Core Design Tokens and Default Layout...');
run('pnpm prisma db seed');

console.log('\n✅ Local Infrastructure is Live.');
console.log('👉 Public URL: http://localhost:3000');
console.log('👉 Admin URL:  http://localhost:3000/admin/login');
const configuredEnv = readFileSync('.env', 'utf-8');
const readEnvValue = (key) => configuredEnv.match(new RegExp(`^${key}="?([^"\\n]+)"?`, 'm'))?.[1] || '[not configured]';
console.log(`👉 Superadmin email: ${readEnvValue('SUPERADMIN_EMAIL')}`);
console.log('👉 Superadmin password: read SUPERADMIN_PASSWORD from .env');
console.log('👉 Create regular admins from the Users screen after signing in.\n');
