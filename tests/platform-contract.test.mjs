import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (file) => fs.readFileSync(file, 'utf8');

test('credentials remain environment-driven', () => {
  const source = read('src/app/actions/auth-actions.ts');
  assert.match(source, /SUPERADMIN_EMAIL/);
  assert.doesNotMatch(source, /superadmin123|super@admin\.com/);
});

test('generated feature tooling exists', () => {
  assert.match(read('scripts/generate-feature.mjs'), /prisma\/schema\.prisma/);
  assert.match(read('scripts/generate-feature.mjs'), /requireAdminPermission/);
  assert.match(read('scripts/generate-mock-data.mjs'), /generatedFor/);
  assert.match(read('scripts/load-mock-data.mjs'), /production/);
  const generator = read('scripts/generate-feature.mjs');
  assert.match(generator, /pageSize/);
  assert.match(generator, /bulk_delete/);
  assert.match(generator, /writeAuditLog/);
  assert.match(generator, /type="file"/);
  assert.match(generator, /Activity widget/);
});

test('project bootstrap does not copy runtime state or credentials', () => {
  const bootstrap = read('scripts/bootstrap-project.mjs');
  assert.doesNotMatch(bootstrap, /\.env|public\/uploads|prisma\/schema|credentials/i);
  assert.match(bootstrap, /TODO\.md/);
});

test('mutation surfaces include audit logging', () => {
  for (const file of ['src/app/actions/admin-mutations.ts', 'src/app/actions/faq-actions.ts', 'src/app/actions/recycle-bin-actions.ts', 'src/app/api/upload/route.ts']) {
    assert.match(read(file), /writeAuditLog/);
  }
});

test('deployment runs committed migrations and verification', () => {
  const packageJson = JSON.parse(read('package.json'));
  assert.match(packageJson.scripts['vercel-build'], /prisma migrate deploy/);
  assert.match(packageJson.scripts['vercel-build'], /pnpm run verify/);
});
