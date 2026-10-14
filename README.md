# Enterprise Engine

Reusable Next.js + Prisma administration platform. Project-specific work is expressed as feature definitions; the frontend remains designable with shared theme tokens.

## Local workflow

```bash
pnpm dev
pnpm run verify
pnpm exec next build --webpack
```

To generate a feature:

```bash
pnpm generate:feature ./features/product.json
pnpm prisma migrate dev --name add-product
pnpm prisma generate
pnpm run verify
```

The generator creates the Prisma model, protected CRUD API routes, permission entries, an admin table, and a dashboard overview. Migrations are deliberately created locally and committed to source control so deployments never invent unreviewed schema changes.

## Vercel deployment

Vercel uses `vercel.json` to run `pnpm run vercel-build`. This production hook runs Prisma Client generation, applies already-committed migrations with `prisma migrate deploy`, runs verification, and then builds Next.js. It does not create migrations. Create and review migrations in staging first, commit them, then deploy to Vercel.

For a local pre-deployment check without applying migrations, use `pnpm run predeploy`.

Staging should provide Supabase `DATABASE_URL`, `DIRECT_URL`, storage keys, `STORAGE_DRIVER=supabase`, and dynamic `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` values through environment settings. Credentials are never hard-coded in application code.

## Audit log retention

Set `AUDIT_LOG_RETENTION_DAYS` and run `pnpm db:cleanup-audit` from a staging/production scheduler or cron job.
