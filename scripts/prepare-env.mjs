import fs from 'node:fs';

const core = `
# Core project configuration — fill these values before running the project
DATABASE_URL=REPLACE_WITH_PROJECT_DATABASE_URL
DIRECT_URL=REPLACE_WITH_PROJECT_DIRECT_DATABASE_URL
JWT_SECRET=REPLACE_WITH_RANDOM_PROJECT_SECRET
NEXT_PUBLIC_SITE_URL=http://localhost:3000
STORAGE_DRIVER=local
LOCAL_STORAGE_PATH=./public/uploads
SUPABASE_URL=REPLACE_WITH_PROJECT_SUPABASE_URL
SUPABASE_ANON_KEY=REPLACE_WITH_PROJECT_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=REPLACE_WITH_PROJECT_SUPABASE_SERVICE_ROLE_KEY
SUPABASE_BUCKET=project-assets
SUPERADMIN_EMAIL=REPLACE_WITH_PROJECT_SUPERADMIN_EMAIL
SUPERADMIN_PASSWORD=REPLACE_WITH_PROJECT_SUPERADMIN_PASSWORD
ADMIN_EMAIL=REPLACE_WITH_PROJECT_ADMIN_EMAIL
ADMIN_PASSWORD=REPLACE_WITH_PROJECT_ADMIN_PASSWORD
AUDIT_LOG_RETENTION_DAYS=90
`;

for (const file of ['.env.example', '.env.staging.example', '.env.production.example']) {
  const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const missing = core.trim().split('\n').filter((line) => line && !new RegExp(`^${line.split('=')[0]}=`, 'm').test(existing)).join('\n');
  if (missing) fs.writeFileSync(file, `${existing.trimEnd()}\n\n${missing}\n`);
}
console.log('Environment templates prepared. Copy the appropriate template to .env and fill project-specific values.');
