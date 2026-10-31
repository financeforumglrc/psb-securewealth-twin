# Render + Neon deployment

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
