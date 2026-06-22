# Build Issues Log

Running log of real errors hit during the build: what broke, the cause, and the
fix. Append a dated entry every time something actually breaks.

---

## 2026-06-21 — Day 1 setup

_No build errors yet — initial data layer (schema, client, drizzle config, seed,
Supabase helpers) scaffolded. Entries will be added here as migrations/seed run
against the live Supabase project._

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
