# Build Issues Log

Running log of real errors hit during the build: what broke, the cause, and the
fix. Append a dated entry every time something actually breaks.

---

## 2026-06-21 — Day 1 setup

_No build errors yet — initial data layer (schema, client, drizzle config, seed,
Supabase helpers) scaffolded. Entries will be added here as migrations/seed run
against the live Supabase project._

### Real issues hit during Supabase wiring

- **`@` in DB password broke the connection string.** Password was
  `Nandakishore@1938`; pasted raw into `DATABASE_URL`, the `@` collided with the
  `user:pass@host` delimiter so the host failed to parse. **Fix:** URL-encode it
  to `%40` → `Nandakishore%401938`. (Cleaner long-term fix: use an
  alphanumeric-only DB password.)
- **`?pgbouncer=true` query param.** Supabase's copy-paste string included it;
  it's a Prisma-only flag and `postgres-js` doesn't understand it. **Fix:**
  dropped it — pooling correctness comes from `prepare: false` in the client.
- **`gin_trgm_ops` needs the `pg_trgm` extension.** The
  `profiles_handle_trgm_idx` index in migration `0000` fails with "operator
  class gin_trgm_ops does not exist" on a fresh DB. **Fix:** prepended
  `CREATE EXTENSION IF NOT EXISTS pg_trgm;` to the migration so it's
  self-contained and re-runnable.

## 2026-06-22 — Day 2 (auth + profiles + RLS)

- **Next 16 renamed `middleware` → `proxy`.** The `middleware.ts` file
  convention is deprecated; the file must be `proxy.ts` exporting a `proxy`
  function, and it now defaults to the Node.js runtime. Writing `middleware.ts`
  silently does nothing. Confirmed in
  `node_modules/next/dist/docs/.../file-conventions/proxy.md`. Build output lists
  it as `ƒ Proxy (Middleware)`.
- **Home page flipped from static to dynamic.** Adding `<Header>` (which reads
  the auth session via cookies) into the root layout makes every route
  server-rendered on demand (`ƒ`). Expected — per-user data must not be statically
  cached (CLAUDE.md gotcha #2).
- **next/image needs `remotePatterns`.** Seed avatars come from
  `avatars.githubusercontent.com` and OAuth users from `lh3.googleusercontent.com`;
  without allowlisting these in `next.config.ts`, `<Image>` throws at runtime.

### Notes / gotchas confirmed proactively (not errors)

- **Two Postgres URLs.** App uses the transaction pooler (`DATABASE_URL`, 6543)
  with `prepare: false`; drizzle-kit + seed use the direct connection
  (`DIRECT_DATABASE_URL`, 5432). Mixing them up surfaces as
  "prepared statement does not exist" errors under the pooler.
- **`tsvector` has no native Drizzle type.** Declared via `customType` and the
  `search` column is `GENERATED ALWAYS AS to_tsvector('english', content)` so
  Postgres maintains it on every write.
- **`pg_trgm` extension required** for the `profiles.handle` trigram index. Must
  run `create extension if not exists pg_trgm;` before the first migration that
  builds `profiles_handle_trgm_idx`.
