# Render + Neon deployment

## Published instance — verified 31 October 2026

- Website: https://ds-financial.onrender.com
- Financial workspace: https://ds-financial.onrender.com/financial-modelling.html
- Render service: srv-dbio1hou01pc73dfvuog, My Workspace, Singapore, free.
- Neon project: divine-pond-49676053, Deepanshu organization, Singapore, free.
- Source: financeforumglrc/psb-securewealth-twin, branch codex/render-neon-release.
- Verified release: 204986a567d7f03dc37f23df4413a085804a809a.
- Admin ID: owner. Generated administrator password is held in Render's
  environment settings; it is not stored in this repository or chat.

Verified: 19 live page/API/asset/private-file checks, browser valuation
calculation, real registration and model API save committed to PostgreSQL,
successful login after deploying a fresh instance, and blocked production
demo login. 130 backend and 26 tool tests pass. PostgreSQL schema compatibility,
write and fresh-runtime restoration were also checked independently.

Browser download automation timed out, so live Excel download completion has
not been confirmed; export generation has automated local coverage. The main
workspace's Save project control still saves in browser storage; publishing
does not turn it into an automatic cloud-project sync feature.

Use the release checkout at tmp/render-release for deliberate releases; it
contains only application source, without local databases, .env, uploads,
screenshots or unrelated GitHub workflows. Existing services were not changed.
Automatic deployments remain disabled. Do not run overlapping replicas or
releases that write to the SQLite working copies; schedule maintenance for
future releases until the adapter is replaced by native PostgreSQL queries.

## Recreate deployment

Import the root `render.yaml` from the repository. It builds the website and
API on one free Render Node service, without paid disks, Redis or Render DB.
Automatic deployment is off for deliberate releases.

1. Create a Neon PostgreSQL project near Singapore. Put its pooled connection
   URL in Render's secret DATABASE_URL field, retaining TLS settings.
2. Import the root Blueprint. Render generates JWT_SECRET. Never commit secrets.
3. Wait for /api/v1/ready to return success and database postgresql.
4. Verify home, financial modelling, PDF tools, company lookup, authenticated
   save/reload, and saved records after a service restart.

Build: `npm ci --include=dev && npm run build && npm run check:tools`.
Start: `node backend/server.js`. VITE_API_BASE_URL=/api/v1 keeps API requests
on the website's origin. Only dist is public; repository files are not served.

The adapter uses a SQLite working copy hydrated from PostgreSQL. Mutation
responses wait for queued writes to commit. Exactly one process/replica is
supported; this is not a PostgreSQL-native multi-replica application. Startup
fails if required PostgreSQL is unavailable. Local user data is not uploaded
automatically. AI, email and payment providers require separate credentials.

Free Render services sleep when idle and have monthly limits. Neon also has
storage and compute limits. No paid upgrades are authorized by this config.
Deployment is complete only after hosted URL and persistence verification.
