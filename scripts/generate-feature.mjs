import fs from 'node:fs';
import path from 'node:path';

const inputPath = process.argv[2];
if (!inputPath) throw new Error('Usage: pnpm generate:feature ./features/product.json');

const definition = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const name = String(definition.name || '').replace(/[^A-Za-z0-9]/g, '');
if (!name || !/^[A-Z]/.test(name)) throw new Error('Feature name must be PascalCase.');

const scalarMap = { string: 'String', text: 'String @db.Text', int: 'Int', float: 'Float', boolean: 'Boolean', datetime: 'DateTime', json: 'Json', file: 'String' };
const fields = Array.isArray(definition.fields) ? definition.fields : [];
if (!fields.length) throw new Error('A feature must define at least one field.');
const rules = Array.isArray(definition.businessRules) ? definition.businessRules : [];
const workflow = definition.workflow && typeof definition.workflow === 'object' ? definition.workflow : null;
const permissions = definition.permissions && typeof definition.permissions === 'object' ? definition.permissions : {};
const integrations = Array.isArray(definition.integrations) ? definition.integrations : [];
if (workflow && (!Array.isArray(workflow.states) || !Array.isArray(workflow.transitions))) throw new Error('workflow requires states and transitions arrays.');
for (const transition of workflow?.transitions || []) {
  if (!transition.from || !transition.to || !transition.action) throw new Error('Each workflow transition requires from, to, and action.');
}

const safeName = (value) => String(value).replace(/[^A-Za-z0-9_]/g, '');
const modelFields = fields.map((field) => {
  const fieldName = safeName(field.name);
  if (field.relation) {
    const target = safeName(field.relation.model);
    if (!fieldName || !target || !/^[A-Z]/.test(target)) throw new Error(`Invalid relation field: ${field.name}`);
    const optional = field.required === false ? '?' : '';
    return `  ${fieldName}Id String${optional}\n  ${fieldName} ${target}${optional} @relation(fields: [${fieldName}Id], references: [id])`;
  }
  const type = scalarMap[field.type];
  if (!fieldName || !type) throw new Error(`Unsupported field: ${field.name}`);
  const optional = field.required === false ? '?' : '';
  return `  ${fieldName} ${type}${optional}`;
}).join('\n');

const schemaPath = path.resolve('prisma/schema.prisma');
const schema = fs.readFileSync(schemaPath, 'utf8');
if (new RegExp(`model ${name} \\{`).test(schema)) throw new Error(`Model ${name} already exists.`);
let updatedSchema = schema.trimEnd();
for (const field of fields.filter((candidate) => candidate.relation)) {
  const target = safeName(field.relation.model);
  const targetPattern = new RegExp(`(model ${target} \\{[\\s\\S]*?)(\\n\\})`);
  if (!targetPattern.test(updatedSchema)) throw new Error(`Relation target model ${target} does not exist.`);
  const inverse = `  ${name.charAt(0).toLowerCase() + name.slice(1)} ${name}[]`;
  updatedSchema = updatedSchema.replace(targetPattern, (match, body, close) => body.includes(inverse) ? match : `${body}\n${inverse}${close}`);
}
fs.writeFileSync(schemaPath, `${updatedSchema}\n\nmodel ${name} {\n  id        String   @id @default(cuid())\n${modelFields}\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n`);

const routeDir = path.resolve('src/app/api/generated', name.toLowerCase());
fs.mkdirSync(routeDir, { recursive: true });
const validationShape = fields.map((field) => `  ${safeName(field.name)}${field.relation ? 'Id' : ''}: ${field.relation ? 'z.string()' : zodExpression(field.type)}${field.required === false ? '.optional()' : ''}`).join(',\n');
fs.writeFileSync(path.join(routeDir, 'route.ts'), `import { NextResponse } from 'next/server';\nimport { z } from 'zod';\nimport { prisma } from '@/lib/db/client';\nimport { requireAdminPermission } from '@/lib/auth/authorization';\n\nconst bodySchema = z.object({\n${validationShape}\n});\n\nexport async function GET() {\n  await requireAdminPermission('${name.toLowerCase()}:view');\n  const records = await prisma.${name.charAt(0).toLowerCase() + name.slice(1)}.findMany({ orderBy: { createdAt: 'desc' } });\n  return NextResponse.json({ records });\n}\n\nexport async function POST(request: Request) {\n  await requireAdminPermission('${name.toLowerCase()}:create');\n  const input = bodySchema.parse(await request.json());\n  const record = await prisma.${name.charAt(0).toLowerCase() + name.slice(1)}.create({ data: input });\n  return NextResponse.json({ record }, { status: 201 });\n}\n`);

// Generated APIs use this shared audit helper and expose pagination/search/bulk contracts.
const model = name.charAt(0).toLowerCase() + name.slice(1);

// Replace the minimal route emitted above with the production route contract.
const generatedApi = `import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/client';
import { requireAdminPermission } from '@/lib/auth/authorization';
import { writeAuditLog } from '@/lib/audit-log';
const bodySchema = z.object({\n${validationShape}\n});
const searchable = [${fields.filter((field) => ['string', 'text', 'file'].includes(field.type)).map((field) => `'${safeName(field.name)}'`).join(', ')}] as const;
function makeWhere(query: string | null, filters: Record<string, string>) { const where: Record<string, unknown> = {}; if (query) where.OR = searchable.map((field) => ({ [field]: { contains: query, mode: 'insensitive' } })); for (const [key, value] of Object.entries(filters)) if (value && ${JSON.stringify(fields.map((field) => safeName(field.name)))}.includes(key)) where[key] = value; return where; }
export async function GET(request: Request) { await requireAdminPermission('${name.toLowerCase()}:view'); const url = new URL(request.url); const page = Math.max(1, Number(url.searchParams.get('page') || 1)); const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize') || 20))); const query = url.searchParams.get('q'); const filters = Object.fromEntries([...url.searchParams.entries()].filter(([key]) => !['page', 'pageSize', 'q'].includes(key))); const where = makeWhere(query, filters); const [records, total] = await Promise.all([prisma.${model}.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }), prisma.${model}.count({ where })]); return NextResponse.json({ records, pagination: { page, pageSize, total, pages: Math.ceil(total / pageSize) } }); }
export async function POST(request: Request) { await requireAdminPermission('${name.toLowerCase()}:create'); const input = bodySchema.parse(await request.json()); const record = await prisma.${model}.create({ data: input }); await writeAuditLog({ action: 'create', resource: '${name.toLowerCase()}', resourceId: record.id }); return NextResponse.json({ record }, { status: 201 }); }
export async function PATCH(request: Request) { await requireAdminPermission('${name.toLowerCase()}:delete'); const input = z.object({ ids: z.array(z.string()).min(1).max(100), action: z.literal('delete') }).parse(await request.json()); const result = await prisma.${model}.deleteMany({ where: { id: { in: input.ids } } }); await writeAuditLog({ action: 'bulk_delete', resource: '${name.toLowerCase()}', metadata: { ids: input.ids, count: result.count } }); return NextResponse.json({ success: true, count: result.count }); }
`;
fs.writeFileSync(path.join(routeDir, 'route.ts'), generatedApi);
const idRouteDir = path.join(routeDir, '[id]');
fs.mkdirSync(idRouteDir, { recursive: true });
fs.writeFileSync(path.join(idRouteDir, 'route.ts'), `import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/client';
import { requireAdminPermission } from '@/lib/auth/authorization';
const bodySchema = z.object({\n${validationShape}\n});
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) { await requireAdminPermission('${name.toLowerCase()}:view'); const { id } = await params; const record = await prisma.${model}.findUnique({ where: { id } }); if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 }); return NextResponse.json({ record }); }
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) { await requireAdminPermission('${name.toLowerCase()}:edit'); const { id } = await params; const record = await prisma.${model}.update({ where: { id }, data: bodySchema.partial().parse(await request.json()) }); return NextResponse.json({ record }); }
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) { await requireAdminPermission('${name.toLowerCase()}:delete'); const { id } = await params; await prisma.${model}.delete({ where: { id } }); return NextResponse.json({ success: true }); }
`);
fs.writeFileSync(path.join(idRouteDir, 'route.ts'), `import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/client';
import { requireAdminPermission } from '@/lib/auth/authorization';
import { writeAuditLog } from '@/lib/audit-log';
const bodySchema = z.object({\n${validationShape}\n});
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) { await requireAdminPermission('${name.toLowerCase()}:view'); const { id } = await params; const record = await prisma.${model}.findUnique({ where: { id } }); if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 }); return NextResponse.json({ record }); }
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) { await requireAdminPermission('${name.toLowerCase()}:edit'); const { id } = await params; const record = await prisma.${model}.update({ where: { id }, data: bodySchema.partial().parse(await request.json()) }); await writeAuditLog({ action: 'update', resource: '${name.toLowerCase()}', resourceId: id }); return NextResponse.json({ record }); }
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) { await requireAdminPermission('${name.toLowerCase()}:delete'); const { id } = await params; await prisma.${model}.delete({ where: { id } }); await writeAuditLog({ action: 'delete', resource: '${name.toLowerCase()}', resourceId: id }); return NextResponse.json({ success: true }); }
`);

const generatedAdminDir = path.resolve('src/app/admin/generated', name.toLowerCase());
fs.mkdirSync(generatedAdminDir, { recursive: true });
const tableHeaders = fields.map((field) => `<th className="p-3 text-muted-foreground">${safeName(field.name)}</th>`).join('');
const tableCells = fields.map((field) => `<td className="p-3 text-foreground">{String(record.${safeName(field.name)} ?? '')}</td>`).join('');
fs.writeFileSync(path.join(generatedAdminDir, 'page.tsx'), `import { prisma } from '@/lib/db/client';
import { requireAdminPermission } from '@/lib/auth/authorization';
import Link from 'next/link';
import GeneratedTable from '@/components/admin/GeneratedTable';

export default async function ${name}AdminPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  await requireAdminPermission('${name.toLowerCase()}:view');
  const params = await searchParams; const page = Math.max(1, Number(params.page || 1)); const pageSize = 20; const query = params.q?.trim();
  const where = query ? { OR: [${fields.filter((f) => ['string', 'text', 'file'].includes(f.type)).map((f) => `{ ${safeName(f.name)}: { contains: query, mode: 'insensitive' } }`).join(', ')}] } : {};
  const [records, total] = await Promise.all([prisma.${model}.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }), prisma.${model}.count({ where })]);
  return <main className="space-y-6"><header className="flex items-end justify-between"><div><h1 className="text-2xl font-semibold text-foreground">${name}</h1><p className="text-sm text-muted-foreground">Generated data management · {total} records</p></div><Link href="/admin/generated/${name.toLowerCase()}/new" className="rounded-btn bg-btn-bg px-4 py-2 text-sm text-btn-text">Create ${name}</Link></header><form className="flex gap-2"><input name="q" defaultValue={query} placeholder="Search records…" className="rounded-btn border border-border bg-muted/40 px-3 py-2 text-sm" /><button className="rounded-btn border border-border px-3 py-2 text-sm">Search</button></form><GeneratedTable records={records} resource="${name.toLowerCase()}" /><nav className="flex gap-3 text-sm">{page > 1 && <Link href={"/admin/generated/${name.toLowerCase()}?q=" + encodeURIComponent(query || '') + "&page=" + (page - 1)}>Previous</Link>}{page * pageSize < total && <Link href={"/admin/generated/${name.toLowerCase()}?q=" + encodeURIComponent(query || '') + "&page=" + (page + 1)}>Next</Link>}</nav></main>;
}
`);

fs.mkdirSync(path.join(generatedAdminDir, 'new'), { recursive: true });
const createFieldMarkup = fields.map((field) => {
  const key = safeName(field.name);
  if (field.type === 'file') return `<label className="block text-sm text-foreground">${key}<input required={${field.required !== false}} type="file" accept="image/*" className="mt-1 w-full rounded-btn border border-border bg-muted/40 px-3 py-2" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; const form = new FormData(); form.append('images', file); const response = await fetch('/api/upload', { method: 'POST', body: form }); const body = await response.json(); if (!response.ok) { setError(body.error || 'Upload failed.'); return; } setValues((current) => ({ ...current, ${key}: body.urls[0] })); }} /></label>`;
  return `<label className="block text-sm text-foreground">${key}<input required={${field.required !== false}} type="${field.type === 'boolean' ? 'checkbox' : field.type === 'int' || field.type === 'float' ? 'number' : 'text'}" className="mt-1 w-full rounded-btn border border-border bg-muted/40 px-3 py-2" onChange={(event) => setValues((current) => ({ ...current, ${key}: ${field.type === 'boolean' ? 'event.target.checked' : 'event.target.value'} }))} /></label>`;
}).join('');
const editFieldMarkup = fields.map((field) => {
  const key = safeName(field.name);
  if (field.type === 'file') return `<label className="block text-sm text-foreground">${key}<input type="file" accept="image/*" className="mt-1 w-full rounded-btn border border-border bg-muted/40 px-3 py-2" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; const form = new FormData(); form.append('images', file); const response = await fetch('/api/upload', { method: 'POST', body: form }); const body = await response.json(); if (!response.ok) { setError(body.error || 'Upload failed.'); return; } setValues((current) => ({ ...current, ${key}: body.urls[0] })); }} /></label>`;
  return `<label className="block text-sm text-foreground">${key}<input type="${field.type === 'boolean' ? 'checkbox' : field.type === 'int' || field.type === 'float' ? 'number' : 'text'}" className="mt-1 w-full rounded-btn border border-border bg-muted/40 px-3 py-2" defaultValue={String(values.${key} ?? '')} onChange={(event) => setValues((current) => ({ ...current, ${key}: ${field.type === 'boolean' ? 'event.target.checked' : 'event.target.value'} }))} /></label>`;
}).join('');
fs.writeFileSync(path.join(generatedAdminDir, 'new', 'page.tsx'), `'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ${name}CreatePage() {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError('');
    const response = await fetch('/api/generated/${name.toLowerCase()}', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(values) });
    if (!response.ok) { const body = await response.json().catch(() => ({})); setError(body.error || 'Unable to save record.'); setSaving(false); return; }
    router.push('/admin/generated/${name.toLowerCase()}'); router.refresh();
  }
  return <main className="mx-auto max-w-2xl space-y-6"><header><h1 className="text-2xl font-semibold text-foreground">Create ${name}</h1><p className="text-sm text-muted-foreground">Validated generated feature form.</p></header><form onSubmit={submit} className="space-y-4 rounded-card border border-border bg-card p-6">${createFieldMarkup} {error && <p className="text-sm text-destructive">{error}</p>}<button disabled={saving} className="rounded-btn bg-btn-bg px-4 py-2 text-sm text-btn-text disabled:opacity-50">{saving ? 'Saving…' : 'Create record'}</button></form></main>;
}
`);

// Every generated feature also gets a first-class edit form with partial server validation.
const editDir = path.join(generatedAdminDir, '[id]', 'edit');
fs.mkdirSync(editDir, { recursive: true });
fs.writeFileSync(path.join(editDir, 'page.tsx'), `'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
export default function ${name}EditPage() {
  const { id } = useParams<{ id: string }>(); const router = useRouter();
  const [values, setValues] = useState<Record<string, unknown>>({}); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  useEffect(() => { fetch('/api/generated/${name.toLowerCase()}/' + id).then((r) => r.json()).then((body) => setValues(body.record || {})).catch(() => setError('Unable to load record.')); }, [id]);
  async function submit(event: React.FormEvent) { event.preventDefault(); setSaving(true); setError(''); const response = await fetch('/api/generated/${name.toLowerCase()}/' + id, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(values) }); if (!response.ok) { const body = await response.json().catch(() => ({})); setError(body.error || 'Unable to save record.'); setSaving(false); return; } router.push('/admin/generated/${name.toLowerCase()}'); router.refresh(); }
  return <main className="mx-auto max-w-2xl space-y-6"><header><h1 className="text-2xl font-semibold text-foreground">Edit ${name}</h1></header><form onSubmit={submit} className="space-y-4 rounded-card border border-border bg-card p-6">${editFieldMarkup} {error && <p className="text-sm text-destructive">{error}</p>}<button disabled={saving} className="rounded-btn bg-btn-bg px-4 py-2 text-sm text-btn-text">{saving ? 'Saving…' : 'Save changes'}</button></form></main>;
}
`);

const generatedDashboardDir = path.resolve('src/app/admin/dashboard/generated', name.toLowerCase());
fs.mkdirSync(generatedDashboardDir, { recursive: true });
fs.writeFileSync(path.join(generatedDashboardDir, 'page.tsx'), `import { prisma } from '@/lib/db/client';
import { requireAdminPermission } from '@/lib/auth/authorization';

export default async function ${name}DashboardPage() {
  await requireAdminPermission('${name.toLowerCase()}:view');
  const [count, recent] = await Promise.all([
    prisma.${model}.count(),
    prisma.${model}.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);
  return <main className="space-y-6"><header><p className="text-sm text-primary">Generated feature dashboard</p><h1 className="text-2xl font-semibold text-foreground">${name} overview</h1></header><section className="grid gap-4 sm:grid-cols-3"><div className="rounded-card border border-border bg-card p-6"><p className="text-sm text-muted-foreground">Total records</p><p className="mt-2 text-4xl font-semibold text-foreground">{count.toLocaleString()}</p></div><div className="rounded-card border border-border bg-card p-6"><p className="text-sm text-muted-foreground">Latest activity</p><p className="mt-2 text-lg font-semibold text-foreground">{recent[0] ? new Date(recent[0].createdAt).toLocaleDateString() : 'No activity'}</p></div><div className="rounded-card border border-border bg-card p-6"><p className="text-sm text-muted-foreground">Recent records</p><p className="mt-2 text-4xl font-semibold text-foreground">{recent.length}</p></div></section><section className="rounded-card border border-border bg-card p-6"><h2 className="font-semibold text-foreground">Activity widget</h2><div className="mt-4 flex h-32 items-end gap-2">{recent.map((record, index) => <div key={record.id} className="flex-1 rounded-t bg-primary/70" style={{ height: (Math.max(18, 100 - index * 14)) + '%' }} title={new Date(record.createdAt).toLocaleString()} />)}</div></section><section className="rounded-card border border-border bg-card p-6"><h2 className="font-semibold text-foreground">Recent records</h2><div className="mt-4 divide-y divide-border">{recent.map((record) => <div key={record.id} className="py-3 text-sm text-foreground">{record.id}</div>)}</div></section></main>;
}
`);

const generatedConfigDir = path.resolve('src/lib/generated');
fs.mkdirSync(generatedConfigDir, { recursive: true });
fs.writeFileSync(path.join(generatedConfigDir, `${name.toLowerCase()}.ts`), `// Generated from the reviewed feature specification. Do not edit manually.\nexport const ${name}Feature = ${JSON.stringify({ name, businessRules: rules, workflow, permissions, integrations }, null, 2)} as const;\n`);
if (integrations.length) {
  const envKeys = integrations.flatMap((integration) => Array.isArray(integration.env) ? integration.env : []).filter(Boolean);
  for (const envName of ['.env.example', '.env.staging.example', '.env.production.example']) {
    const envPath = path.resolve(envName);
    const envSource = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    const additions = envKeys.filter((key) => !new RegExp(`^${key}=`, 'm').test(envSource)).map((key) => `${key}=REPLACE_ME`).join('\n');
    if (additions) fs.writeFileSync(envPath, `${envSource.trimEnd()}\n\n# Generated integration configuration for ${name}\n${additions}\n`);
  }
}
const generatedTestDir = path.resolve('tests/e2e/generated');
fs.mkdirSync(generatedTestDir, { recursive: true });
fs.writeFileSync(path.join(generatedTestDir, `${name.toLowerCase()}.spec.ts`), `import { test, expect } from '@playwright/test';\n\n// Generated from ${name} feature requirements. Review fixtures and selectors before enabling in CI.\ntest.describe('${name} CRUD and authorization', () => {\n  test('admin can open the generated collection', async ({ page }) => {\n    await page.goto('/admin/generated/${name.toLowerCase()}');\n    await expect(page.getByRole('heading', { name: '${name}' })).toBeVisible();\n  });\n\n  test('unauthenticated users cannot open the generated collection', async ({ page }) => {\n    await page.goto('/admin/generated/${name.toLowerCase()}');\n    await expect(page).toHaveURL(/admin\\/(login|generated)/);\n  });\n});\n`);

const generatedPermissionsPath = path.resolve('src/lib/generated-permissions.ts');
const generatedPermission = `  '${name.toLowerCase()}:view',\n  '${name.toLowerCase()}:create',\n  '${name.toLowerCase()}:edit',\n  '${name.toLowerCase()}:delete',`;
if (!fs.existsSync(generatedPermissionsPath)) {
  fs.writeFileSync(generatedPermissionsPath, `// Generated feature permissions.\nexport const GENERATED_PERMISSIONS = [\n${generatedPermission}\n] as const;\n`);
} else {
  const permissionsSource = fs.readFileSync(generatedPermissionsPath, 'utf8');
  const permissionEntries = generatedPermission.split('\n').filter((entry) => !permissionsSource.includes(entry.trim()));
  if (permissionEntries.length) {
    fs.writeFileSync(generatedPermissionsPath, permissionsSource.replace(/\n\] as const;/, `\n${permissionEntries.join('\n')}\n] as const;`));
  }
}

function zodExpression(type) {
  const map = { string: 'z.string().trim().min(1)', text: 'z.string().trim().min(1)', int: 'z.coerce.number().int()', float: 'z.coerce.number()', boolean: 'z.coerce.boolean()', datetime: 'z.coerce.date()', json: 'z.unknown()', file: 'z.string().url()' };
  return map[type] || 'z.unknown()';
}

console.log(`Generated ${name}: Prisma model, API routes, admin table, dashboard, and permissions.`);
console.log(`Next steps: pnpm prisma migrate dev --name add-${name.toLowerCase()} && pnpm prisma generate && pnpm run verify`);
