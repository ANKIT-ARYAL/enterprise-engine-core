<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Enterprise Engine project contract

This repository is a reusable platform foundation. At the beginning of a new project, Codex must ask for the project details before writing implementation code. Ask for the project overview, users and roles, features, data fields and relationships, public pages, admin workflows, permissions, integrations, staging/production setup, and frontend design direction. Do not guess the product domain when these details are missing.

After the developer provides the project details, Codex must automatically build the complete vertical system: Prisma schema and migrations, APIs, JWT/cookie authentication, authorization, admin screens, dashboards, forms, uploads, error states, toast feedback, tests, and deployment checks. Once the system is defined, ask whether the developer wants relatable staging mock data generated. If yes, generate a domain-specific data file on command (hotel data for a hotel system, school data for a school system, and so on), validate it against the generated schema, and only load it into staging after explicit approval. Never insert mock data into production.

Before changing code, read `TODO.md` and identify the relevant workflow. Use Next.js and Node.js, server components by default, client components only when interaction requires them, Tailwind CSS, Prisma, Docker, Framer Motion, and secure JWT/cookie sessions. Keep credentials and project-specific values in environment variables; never hardcode them.

For every feature, implement the complete vertical slice: schema and migration, validated server action/API, authorization, admin UI, loading/empty/error/success states, theme tokens, tests, and documentation. Run `pnpm run verify` and the production build before declaring work complete. Do not claim the platform is complete when a generated feature is only a placeholder.

Project isolation is mandatory. A new project must not read, copy, modify, or depend on this engine project’s existing database, `.env` files, uploaded assets, users, credentials, seed data, generated records, or project-specific implementation state. It may import only reusable tooling, templates, documentation, and patterns through the bootstrap workflow. Every new project must have its own repository, environment files, database, migrations, storage bucket, credentials, and staging data.

When starting a new project, run `pnpm bootstrap:project /path/to/project` from the engine repository. This imports the reusable `TODO.md` and `AGENTS.md` instructions while preserving existing files. After bootstrapping, work only inside the new project directory.
