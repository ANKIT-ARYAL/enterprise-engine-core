#!/usr/bin/env node

import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const sourceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requestedTarget = process.argv[2] ?? '.';
const targetDir = path.resolve(process.cwd(), requestedTarget);

const ignored = new Set([
  '.git',
  '.next',
  'node_modules',
  '.env',
  '.env.local',
  '.env.staging',
  '.env.production',
  'coverage',
]);

await mkdir(targetDir, { recursive: true });

for (const entry of await readdir(sourceDir, { withFileTypes: true })) {
  if (ignored.has(entry.name) || entry.name === 'pnpm-lock.yaml') continue;
  await cp(path.join(sourceDir, entry.name), path.join(targetDir, entry.name), {
    recursive: true,
    errorOnExist: false,
    force: false,
  });
}

const targetPackage = path.join(targetDir, 'package.json');
try {
  const packageJson = JSON.parse(await readFile(targetPackage, 'utf8'));
  packageJson.name = path.basename(targetDir).toLowerCase().replace(/[^a-z0-9._-]+/g, '-') || 'enterprise-project';
  delete packageJson.private;
  delete packageJson.bin;
  await writeFile(targetPackage, `${JSON.stringify(packageJson, null, 2)}\n`);
} catch {
  // The copied template always contains package.json; leave custom targets untouched.
}

const projectSlug = path.basename(targetDir).toLowerCase().replace(/[^a-z0-9._-]+/g, '-') || 'enterprise-project';
await writeFile(path.join(targetDir, '.enterprise-engine.json'), `${JSON.stringify({
  engineRepository: 'https://github.com/ANKIT-ARYAL/enterprise-engine-core.git',
  engineVersion: '0.1.0',
  projectSlug,
  managedFiles: ['src', 'prisma', 'scripts', 'docker', 'package.json'],
}, null, 2)}\n`);

try {
  execSync('gh auth status', { stdio: 'ignore' });
  const owner = execSync('gh api user --jq .login', { encoding: 'utf8' }).trim();
  execSync('git init -b main', { cwd: targetDir, stdio: 'ignore' });
  execSync('git add . && git commit -m "Initialize Enterprise Engine project"', { cwd: targetDir, stdio: 'ignore' });
  execSync(`gh repo create ${owner}/${projectSlug} --private --source . --remote origin --push`, { cwd: targetDir, stdio: 'inherit' });
  console.log(`GitHub repository created: https://github.com/${owner}/${projectSlug}`);
} catch (error) {
  console.warn('GitHub repository setup was skipped. Run gh auth login and retry if needed.');
}

console.log(`\nEnterprise Engine created at ${targetDir}`);
console.log('\nInstalling dependencies and starting the project...\n');
execSync('pnpm install', { cwd: targetDir, stdio: 'inherit' });
execSync('pnpm run setup:project', { cwd: targetDir, stdio: 'inherit' });
execSync('pnpm dev', { cwd: targetDir, stdio: 'inherit' });
