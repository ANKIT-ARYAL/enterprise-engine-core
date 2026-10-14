# Enterprise Engine — reusable project checklist

This file is the operating checklist for every project built with Enterprise Engine. Codex should read it before making changes and keep it updated as the project evolves.

## 1. Start a new project

The intended operating model is approximately 90% engine/Codex automation and
10% project-owner input. The owner supplies the product brief and design,
reviews generated business rules/workflows, adds mock data, and fills the
generated environment templates with credentials. The engine owns schema,
migrations, validation, authorization, audit logging, UI scaffolding, test
scaffolding, and deployment gates.

```bash
# From the engine repository; copies TODO.md and AGENTS.md without overwriting files.
pnpm bootstrap:project /absolute/path/to/new-project

# In the new project, install dependencies and initialize local infrastructure.
pnpm install
pnpm setup:project
pnpm dev
```

Before implementation, provide Codex with:

- project name, purpose, users, and roles;
- feature overview and required data fields/relationships;
- public pages and admin workflows;
- permissions and approval rules;
- integrations, email, payments, storage, and retention requirements;
- staging and production environment details;
- visual direction, reference screens, theme, typography, and responsive requirements.

Codex must ask for these details first when they are missing. It must not begin by copying this engine’s existing pages, records, credentials, assets, or project-specific code.

After receiving the brief, Codex must turn it into a written feature plan and automatically complete each feature vertically. After the initial build, Codex must ask whether staging mock data should be generated. Mock data is never preloaded automatically. Generate it only when requested:

```bash
pnpm generate:mock-data --domain=hotel --count=20 --output=staging/hotel-mock-data.json
pnpm generate:mock-data --domain=school --count=20 --output=staging/school-mock-data.json
```

The generated file must contain realistic domain data, be clearly marked staging-only, be validated against the current schema, and only be imported into staging after explicit approval. Never insert mock data into production.

Validate or import a generated file only after reviewing it:

```bash
pnpm load:mock-data --model=HotelReservation --file=staging/hotel-mock-data.json --dry-run
pnpm load:mock-data --model=HotelReservation --file=staging/hotel-mock-data.json
```

New projects are isolated workspaces. Import reusable instructions, generators, components, and patterns only. Do not reuse this engine’s `.env`, database, credentials, uploaded files, seed records, migrations that are not part of the new project, or runtime state.

## 2. Environment and credentials

```bash
cp .env.example .env
cp .env.staging.example .env.staging
cp .env.production.example .env.production
```

Required values are environment-specific and must never be committed:

- `DATABASE_URL` and `DIRECT_URL`;
- `SUPERADMIN_EMAIL` and `SUPERADMIN_PASSWORD`;
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` for optional bootstrap admin access;
- `JWT_SECRET` or the project’s session secret;
- Supabase/database storage credentials when `STORAGE_DRIVER=supabase`;
- `AUDIT_LOG_RETENTION_DAYS`;
- public site URL and external service keys.

```bash
pnpm setup:project
```

`pnpm setup:project` also runs `pnpm prepare:env`. Every project receives local,
staging, and production environment templates containing the core database,
JWT, Supabase, storage, admin bootstrap, audit, and feature integration keys.
Never copy this engine's `.env`; fill the new project's generated templates.

The setup script starts Docker, applies local Prisma migrations, generates Prisma Client, and seeds the core system. It prints the configured superadmin email but never prints the password.

## 3. Daily development commands

```bash
pnpm dev
pnpm run verify
pnpm exec next build --webpack
pnpm start
```

Use `pnpm run verify` after every backend, schema, route, auth, or form change. Fix all errors before continuing.

## 4. Generate a feature

Create a definition such as `features/product.json`, then run:

```bash
pnpm generate:feature ./features/product.json
pnpm prisma migrate dev --name add-product
pnpm prisma generate
pnpm run verify
```

The generator currently creates a Prisma model, protected collection and record API routes, permission entries, an admin table, and a dashboard overview for supported scalar fields. Codex must extend the generator when a feature needs relationships, files, search, pagination, workflows, bulk actions, charts, or custom validation; do not silently reduce those requirements to a placeholder.

## 5. Database commands

```bash
pnpm prisma validate
pnpm prisma migrate dev --name describe-the-change
pnpm prisma migrate status
pnpm prisma migrate deploy
pnpm prisma generate
pnpm prisma db seed
```

Create migrations locally against staging/development, review the SQL, commit them, and use only `prisma migrate deploy` in Vercel. Never invent migrations during a production build.

## 6. Docker and database lifecycle

```bash
docker compose -f docker/docker-compose.yml up -d --wait
docker compose -f docker/docker-compose.yml ps
docker compose -f docker/docker-compose.yml logs -f postgres
pnpm docker:down
pnpm docker:clean
```

`docker:clean` deletes local Docker volumes. Use it only when local data can be recreated.

## 7. Validation and UX requirements

Every form and mutation must have:

- server-side Zod validation;
- authorization checks on the server;
- pending/loading state;
- field-level validation where appropriate;
- a useful error message and toast;
- success feedback and data refresh;
- empty, not-found, and failure states;
- accessible labels, keyboard behavior, and focus treatment;
- semantic theme tokens instead of hard-coded light/dark colors.

Do not use `window.alert`, fake sample records, random dashboard metrics, hard-coded credentials, or manual URL fields where an upload route exists.

## 8. Uploads and media

```bash
curl -I http://localhost:3000/api/upload
```

Uploads must go through the configured upload route, enforce size/type limits, convert supported raster images to WebP or AVIF, and store through the configured storage driver. Confirm local storage and staging Supabase storage independently.

## 9. Audit logs and cleanup

```bash
pnpm db:cleanup-audit
```

Configure `AUDIT_LOG_RETENTION_DAYS` and schedule this command in staging/production. Any security-sensitive mutation should write an audit event with actor, action, resource, resource ID, and safe metadata.

## 10. Pre-deployment checks

```bash
pnpm run predeploy
```

This runs Prisma generation, verification, and the production build without applying migrations. Do not push/deploy if it fails.

## 11. Engine hosting versus project hosting

The Enterprise Engine itself does not need to be deployed to Vercel. It can remain local as a private development toolkit. The engine is used to generate and maintain future project repositories. Turning off the laptop only stops local development and generation; it does not affect future projects that have already been deployed independently to Vercel or another server.

Each future project must contain its own application code, environment variables, database, migrations, storage, and deployment configuration. Deploy the future project—not this private engine—when that project needs to run continuously for users. Staging Supabase remains available independently of the laptop.

## 12. Vercel deployment

Vercel runs the `vercel.json` build command:

```bash
pnpm run vercel-build
```

That command runs `prisma generate`, `prisma migrate deploy` for committed migrations, `pnpm run verify`, and `pnpm run build`. Vercel must have the staging/production environment variables configured before deployment. The build command does not create new migrations.

## 13. Final completion gate

Before telling the user a project is complete, Codex must:

1. inspect the changed files and database schema;
2. run `pnpm run verify`;
3. run `pnpm exec next build --webpack`;
4. test critical auth, authorization, CRUD, upload, theme persistence, and error paths;
5. check for hard-coded credentials, browser alerts, fake data, and unthemed UI;
6. report remaining limitations honestly.
