import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const run = (command, args) => execFileSync(command, args, { stdio: 'inherit' });

const env = fs.readFileSync('.env.example', 'utf8');
for (const key of ['SUPERADMIN_EMAIL', 'SUPERADMIN_PASSWORD', 'ADMIN_EMAIL', 'ADMIN_PASSWORD']) {
  if (!new RegExp(`^${key}=`, 'm').test(env)) throw new Error(`Missing required environment key: ${key}`);
}

for (const source of ['src/components', 'src/app']) {
  let output = '';
  try { output = execFileSync('rg', ['-n', 'window\\.alert|[^a-zA-Z]alert\\(', source], { encoding: 'utf8' }).trim(); } catch { /* rg exits 1 when no matches exist */ }
  if (output) throw new Error(`Browser alert usage remains:\n${output}`);
}

run('node', ['--check', 'scripts/generate-feature.mjs']);
run('node', ['--check', 'scripts/generate-mock-data.mjs']);
run('node', ['--check', 'scripts/load-mock-data.mjs']);
run('pnpm', ['test']);
run('pnpm', ['exec', 'tsc', '--noEmit']);
run('pnpm', ['prisma', 'validate']);
run('pnpm', ['prisma', 'migrate', 'status']);
console.log('Project verification passed.');
